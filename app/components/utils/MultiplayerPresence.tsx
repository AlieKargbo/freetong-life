'use client';

import { useEffect, useState } from 'react';
import type { SimAppearance } from '../Game-setup/CharacterData';
import {
  AUTH_STORAGE_KEY,
  PLAYER_USERNAME_STORAGE_KEY,
  game,
  getMigratedLocalStorage,
  removeMigratedLocalStorage,
  useGame,
  type MultiplayerPlayer,
} from './Store';

const APPEARANCE_STORAGE_KEY = 'freetown-life-player-appearance';
const PLAYER_ID_STORAGE_KEY = 'freetown-life-multiplayer-id';
const DEFAULT_URL = process.env.NODE_ENV === 'development'
  ? 'ws://localhost:8787'
  : 'wss://freetong-life.aliekargbo000.workers.dev/ws';
let presenceSocket: WebSocket | null = null;
const HAIRSTYLES = new Set(['Braids', 'Afro', 'Bun', 'Ponytail', 'Long', 'Locs', 'Low cut', 'Gele', 'Classic']);
const OUTFITS = new Set(['Casual', 'Office', 'Owambe', 'Site work', 'School', 'Traditional']);
const FABRICS = new Set(['Plain', 'Ankara', 'Adire', 'Aso-oke', 'Kente', 'Lace']);

export function sendPlayerMessage(to: string, text: string): string | null {
  if (!presenceSocket || presenceSocket.readyState !== WebSocket.OPEN) return null;
  const id = crypto.randomUUID();
  try {
    presenceSocket.send(JSON.stringify({ type: 'direct-message', id, to: to.replace(/^@/, ''), text }));
    return id;
  } catch {
    return null;
  }
}

export function sendPlayerPayment(to: string, amount: number): string | null {
  if (!presenceSocket || presenceSocket.readyState !== WebSocket.OPEN) return null;
  const id = crypto.randomUUID();
  try {
    presenceSocket.send(JSON.stringify({ type: 'payment', id, to: to.replace(/^@/, ''), amount }));
    return id;
  } catch {
    return null;
  }
}

function isAppearance(value: unknown): value is SimAppearance {
  if (!value || typeof value !== 'object') return false;
  const appearance = value as Record<string, unknown>;
  return (appearance.body === 'Woman' || appearance.body === 'Man')
    && typeof appearance.name === 'string'
    && HAIRSTYLES.has(String(appearance.hairstyle))
    && OUTFITS.has(String(appearance.outfit))
    && FABRICS.has(String(appearance.fabric))
    && ['skin', 'hairColor', 'accent'].every((key) => typeof appearance[key] === 'string' && /^#[0-9a-f]{6}$/i.test(appearance[key] as string));
}

function isRemotePlayer(value: unknown): value is MultiplayerPlayer {
  if (!value || typeof value !== 'object') return false;
  const player = value as Record<string, unknown>;
  const isVector = (vector: unknown) => Array.isArray(vector)
    && vector.length === 2
    && vector.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate));

  return typeof player.id === 'string'
    && typeof player.name === 'string'
    && isAppearance(player.appearance)
    && (player.buildingId === null || typeof player.buildingId === 'string')
    && isVector(player.position)
    && (player.target === null || isVector(player.target));
}

function getPresence() {
  const state = game.get();
  if (!state.player || !state.playerUsername) return null;

  return {
    name: state.playerUsername.replace(/^@/, ''),
    appearance: state.player,
    // A home is a private space: don't join a shared multiplayer room there.
    // Public interiors use their building id as a shared room key.
    buildingId: state.travel || state.interior?.id === 'player-home'
      ? null
      : state.interior?.id ?? null,
    position: state.playerPosition,
    target: state.playerTarget,
  };
}

export default function MultiplayerPresence() {
  const authenticated = useGame((state) => state.authenticated);
  const username = useGame((state) => state.playerUsername);
  const appearance = useGame((state) => state.player);
  const interiorId = useGame((state) => state.interior?.id ?? null);
  const travelId = useGame((state) => state.travel?.id ?? null);
  const position = useGame((state) => state.playerPosition);
  const target = useGame((state) => state.playerTarget);
  const [clientId, setClientId] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => { void (async () => {
      try {
        const wasAuthenticated = getMigratedLocalStorage(AUTH_STORAGE_KEY) === 'true';
        let sessionUsername: string | null = null;
        if (wasAuthenticated) {
          const response = await fetch('/api/auth', { cache: 'no-store' });
          const session = await response.json();
          if (response.ok && session.authenticated && typeof session.username === 'string') {
            sessionUsername = session.username;
          } else {
            removeMigratedLocalStorage(AUTH_STORAGE_KEY);
          }
        }
        game.setAuthenticated(Boolean(sessionUsername));
        const savedUsername = localStorage.getItem(PLAYER_USERNAME_STORAGE_KEY);
        const username = sessionUsername ?? savedUsername;
        if (username) {
          game.setPlayerUsername(username);
          if (sessionUsername) localStorage.setItem(PLAYER_USERNAME_STORAGE_KEY, sessionUsername);
        }

        const savedAppearance = localStorage.getItem(APPEARANCE_STORAGE_KEY);
        if (savedAppearance) {
          const parsed: unknown = JSON.parse(savedAppearance);
          if (!isAppearance(parsed)) throw new Error('Saved Sim appearance is invalid.');
          game.restorePlayer(parsed);
        }

        let id = sessionStorage.getItem(PLAYER_ID_STORAGE_KEY);
        if (!id) {
          id = crypto.randomUUID();
          sessionStorage.setItem(PLAYER_ID_STORAGE_KEY, id);
        }
        setClientId(id);
      } catch {
        game.setAuthenticated(false);
        game.setMultiplayerStatus('error', 'Could not restore the local player session.');
      }
    })(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!clientId || !authenticated || !username || !appearance) return;

    const url = process.env.NEXT_PUBLIC_MULTIPLAYER_URL || DEFAULT_URL;
    if (!url) {
      game.setMultiplayerStatus('error', 'Set NEXT_PUBLIC_MULTIPLAYER_URL to enable multiplayer.');
      return;
    }

    let disposed = false;
    let retryTimer: number | undefined;
    let socket: WebSocket;
    game.setMultiplayerStatus('connecting');

    try {
      socket = new WebSocket(url);
      presenceSocket = socket;
    } catch {
      game.setMultiplayerStatus('error', 'The multiplayer WebSocket URL is invalid.');
      return;
    }

    socket.onopen = () => {
      if (disposed) return;
      // Wait for the server's snapshot (join acknowledgement) before marking
      // the player ready to send messages.
      game.setMultiplayerStatus('connecting');
      const presence = getPresence();
      if (presence) {
        socket.send(JSON.stringify({ type: 'join', id: clientId, ...presence }));
      }
    };

    socket.onmessage = (event) => {
      let message: unknown;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        game.setMultiplayerStatus('error', 'The multiplayer server sent an invalid message.');
        return;
      }
      if (!message || typeof message !== 'object') return;
      const payload = message as Record<string, unknown>;

      if (payload.type === 'snapshot' && Array.isArray(payload.players)) {
        game.setRemotePlayers(payload.players.filter(isRemotePlayer).filter((player) => player.id !== clientId));
        game.setMultiplayerStatus('connected');
      } else if (payload.type === 'player' && isRemotePlayer(payload.player)) {
        if (payload.player.id !== clientId) game.updateRemotePlayer(payload.player);
      } else if (payload.type === 'left' && typeof payload.id === 'string') {
        game.removeRemotePlayer(payload.id);
      } else if (payload.type === 'direct-message' && payload.message && typeof payload.message === 'object') {
        const directMessage = payload.message as Record<string, unknown>;
        if (typeof directMessage.id === 'string' && typeof directMessage.from === 'string' && typeof directMessage.to === 'string' && typeof directMessage.text === 'string' && Number.isFinite(directMessage.sentAt)) {
          game.receiveMessage({
            id: directMessage.id,
            from: directMessage.from.toLowerCase(),
            to: directMessage.to.toLowerCase(),
            text: directMessage.text,
            sentAt: directMessage.sentAt as number,
          });
        }
      } else if (payload.type === 'payment' && payload.transfer && typeof payload.transfer === 'object') {
        const transfer = payload.transfer as Record<string, unknown>;
        if (typeof transfer.id === 'string' && typeof transfer.from === 'string' && typeof transfer.to === 'string' && Number.isSafeInteger(transfer.amount) && Number.isFinite(transfer.sentAt)) {
          game.receivePayment({
            id: transfer.id,
            from: transfer.from.toLowerCase(),
            to: transfer.to.toLowerCase(),
            amount: transfer.amount as number,
            sentAt: transfer.sentAt as number,
          });
        }
      } else if (payload.type === 'delivery-status') {
        // Delivery is reflected by the server response; chat history is already
        // stored optimistically by the sender, and incoming messages are handled above.
      } else if (payload.type === 'error' && typeof payload.message === 'string') {
        game.setMultiplayerStatus('error', payload.message);
      }
    };

    socket.onerror = () => {
      if (!disposed) {
        game.setMultiplayerStatus('error', 'Could not reach the multiplayer server. Start it with npm run realtime.');
      }
    };

    socket.onclose = () => {
      if (disposed) return;
      if (presenceSocket === socket) presenceSocket = null;
      game.setRemotePlayers([]);
      if (game.get().multiplayerStatus !== 'error') {
        game.setMultiplayerStatus('disconnected');
      }
      retryTimer = window.setTimeout(() => setRetryCount((count) => count + 1), 2000);
    };

    return () => {
      disposed = true;
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
      if (presenceSocket === socket) presenceSocket = null;
      socket.close();
    };
  }, [clientId, authenticated, retryCount, username, appearance]);

  useEffect(() => {
    if (!authenticated || !clientId) return;
    const socket = presenceSocket;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const presence = getPresence();
    if (presence) socket.send(JSON.stringify({ type: 'update', ...presence }));
  }, [authenticated, clientId, username, appearance, interiorId, travelId]);

  useEffect(() => {
    if (!authenticated || !clientId) return;
    const socket = presenceSocket;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'move', position, target }));
  }, [authenticated, clientId, position, target]);

  return null;
}
