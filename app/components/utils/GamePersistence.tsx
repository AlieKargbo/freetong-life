'use client';

import { useEffect } from 'react';
import { AUTH_STORAGE_KEY, game, getMigratedLocalStorage, type SavedGameProgress } from './Store';

const SAVE_KEY = 'freetown-life-game-save-v2';
const LEGACY_SAVE_KEY = 'freetown-life-game-save-v1';

function readSelectedDream(): string | null {
  try {
    const choices = localStorage.getItem('freetown-life-player-choices');
    if (!choices) return null;
    const parsed = JSON.parse(choices) as { dream?: unknown };
    return typeof parsed.dream === 'string' ? parsed.dream : null;
  } catch {
    return null;
  }
}

export default function GamePersistence({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let saveTimer: number | undefined;

    const persist = async () => {
      const next = JSON.stringify(game.getSave());
      try {
        localStorage.setItem(SAVE_KEY, next);
      } catch {
        // Keep playing if browser storage is full or unavailable.
      }
      if (getMigratedLocalStorage(AUTH_STORAGE_KEY) !== 'true') return;
      try {
        await fetch('/api/player/save', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: next,
          keepalive: true,
        });
      } catch {
        // A local save remains available while D1 is unavailable.
      }
    };

    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SavedGameProgress>;
        const previousDream = parsed.dream;
        game.restoreSave(parsed);
        const selectedDream = readSelectedDream();
        if (selectedDream && selectedDream !== previousDream) game.setDream(selectedDream);
      } else {
        const legacySave = localStorage.getItem(LEGACY_SAVE_KEY);
        if (legacySave) {
          const parsed = JSON.parse(legacySave) as Partial<SavedGameProgress>;
          if (parsed.needs && Number.isFinite(parsed.needs.bladder)) {
            parsed.needs = { ...parsed.needs, bladder: 100 - parsed.needs.bladder };
          }
          const previousDream = parsed.dream;
          game.restoreSave(parsed);
          const selectedDream = readSelectedDream();
          if (selectedDream && selectedDream !== previousDream) game.setDream(selectedDream);
          localStorage.setItem(SAVE_KEY, JSON.stringify(game.getSave()));
        }
      }
    } catch {
      // Ignore a missing or malformed local save and start a fresh session.
    }

    const startSaving = () => {
      if (!active) return;
      let lastSaved = JSON.stringify(game.getSave());
      const save = () => {
      const next = JSON.stringify(game.getSave());
      if (next === lastSaved) return;
      lastSaved = next;
        void persist();
      };
      unsubscribe = game.subscribe(() => {
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(save, 500);
      });
      window.addEventListener('pagehide', persist);
    };

    const hydrateFromDatabase = async () => {
      try {
        const signedIn = getMigratedLocalStorage(AUTH_STORAGE_KEY) === 'true';
        if (signedIn) {
          const response = await fetch('/api/player/save', { cache: 'no-store' });
          if (response.ok) {
            const data = await response.json();
            if (data.save && typeof data.save === 'object') game.restoreSave(data.save);
            else await persist();
          }
        }
      } catch {
        // Continue from the local save when the database cannot be reached.
      } finally {
        startSaving();
        onReady?.();
      }
    };
    void hydrateFromDatabase();

    return () => {
      active = false;
      window.clearTimeout(saveTimer);
      unsubscribe?.();
      window.removeEventListener('pagehide', persist);
      void persist();
    };
  }, [onReady]);

  return null;
}
