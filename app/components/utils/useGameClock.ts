'use client';

import { useEffect, useState } from 'react';
import { GAME_TIME_SCALE, getGameClock } from '@/app/Game/clock';
import { useGame } from './Store';

const CLOCK_START_KEY_PREFIX = 'freetown-life-game-clock-start:';

export default function useGameClock(enabled = true) {
  const [clock, setClock] = useState(() => getGameClock());
  const authenticated = useGame((state) => state.authenticated);
  const username = useGame((state) => state.playerUsername);

  useEffect(() => {
    if (!enabled || !authenticated || !username) {
      setClock(getGameClock());
      return;
    }

    const storageKey = `${CLOCK_START_KEY_PREFIX}${username.replace(/^@/, '').toLowerCase()}`;
    let startedAt = Date.now();
    try {
      const storedStart = Number(localStorage.getItem(storageKey));
      if (Number.isFinite(storedStart) && storedStart > 0 && storedStart <= Date.now()) {
        startedAt = storedStart;
      } else {
        localStorage.setItem(storageKey, String(startedAt));
      }
    } catch {
      // Without browser storage this session still starts at noon.
    }

    let timeout: number | undefined;
    const updateClock = () => {
      const now = Date.now();
      const currentClock = getGameClock(now, startedAt);
      setClock({
        ...currentClock,
        minute: Math.floor(currentClock.minute / 10) * 10,
      });

      // Refresh at the next 10-minute in-game boundary, rather than polling every 250 ms.
      const minuteOfDay = currentClock.hourOfDay * 60;
      const nextBoundary = (Math.floor(minuteOfDay / 10) + 1) * 10;
      const gameMsUntilBoundary = (nextBoundary - minuteOfDay) * 60_000;
      const realMsUntilBoundary = gameMsUntilBoundary / GAME_TIME_SCALE;
      timeout = window.setTimeout(updateClock, Math.max(25, realMsUntilBoundary));
    };

    updateClock();
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [authenticated, enabled, username]);

  return clock;
}
