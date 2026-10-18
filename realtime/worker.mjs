import { DurableObject } from 'cloudflare:workers';

const MAX_PLAYERS = 500;
const MAX_MESSAGE_BYTES = 32 * 1024;
const MAX_DIRECT_MESSAGE_LENGTH = 1000;
const MAX_PENDING_INBOX = 100;
const MAX_INTERNAL_BODY_BYTES = 1_050_000;
const USERNAME_PATTERN = /^@?[A-Za-z0-9_]{1,24}$/;
const VECTOR_PATTERN = /^[\w -]{1,100}$/;
const BODIES = new Set(['Woman', 'Man']);
const HAIRSTYLES = new Set(['Braids', 'Afro', 'Bun', 'Ponytail', 'Long', 'Locs', 'Low cut', 'Gele', 'Classic']);
const OUTFITS = new Set(['Casual', 'Office', 'Owambe', 'Site work', 'School', 'Traditional']);
const FABRICS = new Set(['Plain', 'Ankara', 'Adire', 'Aso-oke', 'Kente', 'Lace']);

function validVector(value, nullable = false) {
  return (nullable && value === null) || (Array.isArray(value)
    && value.length === 2
    && value.every((coordinate) => Number.isFinite(coordinate) && Math.abs(coordinate) <= 100));
}

function validAppearance(value) {
  return Boolean(value && typeof value === 'object'
    && typeof value.name === 'string' && value.name.length <= 24
    && BODIES.has(value.body) && HAIRSTYLES.has(value.hairstyle)
    && OUTFITS.has(value.outfit) && FABRICS.has(value.fabric)
    && ['skin', 'hairColor', 'accent'].every((key) => typeof value[key] === 'string' && /^#[0-9a-f]{6}$/i.test(value[key])));
}

function validBuildingId(value) {
  return value === null || (typeof value === 'string' && VECTOR_PATTERN.test(value));
}

function publicPlayer(player) {
  return {
    id: player.id,
    name: player.name,
    appearance: player.appearance,
    buildingId: player.buildingId,
    position: player.position,
    target: player.target,
  };
}

function safeSend(socket, message) {
  try {
    socket.send(JSON.stringify(message));
  } catch {
    // The client may disconnect between selection and send.
  }
}

function hasValidServiceToken(request, expectedToken) {
  if (!expectedToken) return false;
  const supplied = request.headers.get('Authorization') ?? '';
  const expected = `Bearer ${expectedToken}`;
  if (supplied.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index++) difference |= supplied.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}

async function handleInternalDatabaseRequest(request, env) {
  if (!hasValidServiceToken(request, env.APP_API_TOKEN)) return new Response('Not found', { status: 404 });
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405 });

  let text;
  let body;
  try {
    text = await request.text();
    if (new TextEncoder().encode(text).byteLength > MAX_INTERNAL_BODY_BYTES) {
      return Response.json({ error: 'Request is too large.' }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body) || typeof body.action !== 'string') {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const validPlayerId = Number.isSafeInteger(body.playerId) && body.playerId > 0;
  const validTokenHash = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  try {
    switch (body.action) {
      case 'create-player': {
        const { username, email, displayName, passwordSalt, passwordHash } = body;
        if (typeof username !== 'string' || !/^[a-z0-9_]{3,20}$/.test(username)
          || (email !== null && (typeof email !== 'string' || email.length > 254))
          || typeof displayName !== 'string' || !displayName || displayName.length > 80
          || typeof passwordSalt !== 'string' || !/^[a-f0-9]{32}$/.test(passwordSalt)
          || typeof passwordHash !== 'string' || !/^[a-f0-9]{64}$/.test(passwordHash)) {
          return Response.json({ error: 'Invalid account data.' }, { status: 400 });
        }
        const player = await env.DB.prepare(
          'INSERT INTO players (username, email, display_name, password_salt, password_hash) VALUES (?, ?, ?, ?, ?) RETURNING id',
        ).bind(username, email, displayName, passwordSalt, passwordHash).first();
        return Response.json({ id: player.id });
      }
      case 'find-player': {
        if (typeof body.username !== 'string' || typeof body.email !== 'string') {
          return Response.json({ error: 'Invalid login identifier.' }, { status: 400 });
        }
        const player = await env.DB.prepare(
          'SELECT id, username, password_salt, password_hash FROM players WHERE username = ? OR email = ? LIMIT 1',
        ).bind(body.username, body.email).first();
        return Response.json({ player });
      }
      case 'create-session': {
        if (!validPlayerId || !validTokenHash(body.tokenHash) || !Number.isSafeInteger(body.expiresAt)) {
          return Response.json({ error: 'Invalid session data.' }, { status: 400 });
        }
        await env.DB.prepare(
          'INSERT INTO player_sessions (token_hash, player_id, expires_at) VALUES (?, ?, ?)',
        ).bind(body.tokenHash, body.playerId, body.expiresAt).run();
        return Response.json({ ok: true });
      }
      case 'find-session': {
        if (!validTokenHash(body.tokenHash) || !Number.isSafeInteger(body.now)) {
          return Response.json({ error: 'Invalid session lookup.' }, { status: 400 });
        }
        const player = await env.DB.prepare(
          `SELECT p.id, p.username, p.display_name FROM player_sessions s
           JOIN players p ON p.id = s.player_id WHERE s.token_hash = ? AND s.expires_at > ?`,
        ).bind(body.tokenHash, body.now).first();
        return Response.json({ player });
      }
      case 'delete-session': {
        if (!validTokenHash(body.tokenHash)) return Response.json({ error: 'Invalid session.' }, { status: 400 });
        await env.DB.prepare('DELETE FROM player_sessions WHERE token_hash = ?').bind(body.tokenHash).run();
        return Response.json({ ok: true });
      }
      case 'get-save': {
        if (!validPlayerId) return Response.json({ error: 'Invalid player.' }, { status: 400 });
        const row = await env.DB.prepare('SELECT data FROM player_saves WHERE player_id = ?').bind(body.playerId).first();
        return Response.json({ save: row ? JSON.parse(row.data) : null });
      }
      case 'put-save': {
        if (!validPlayerId || !body.save || typeof body.save !== 'object' || Array.isArray(body.save)) {
          return Response.json({ error: 'Invalid save data.' }, { status: 400 });
        }
        const data = JSON.stringify(body.save);
        if (new TextEncoder().encode(data).byteLength > 1_000_000) {
          return Response.json({ error: 'Save data is too large.' }, { status: 413 });
        }
        await env.DB.prepare(
          `INSERT INTO player_saves (player_id, data, updated_at) VALUES (?, ?, ?)
           ON CONFLICT (player_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
        ).bind(body.playerId, data, Date.now()).run();
        return Response.json({ ok: true });
      }
      default:
        return Response.json({ error: 'Unsupported database action.' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return Response.json({ error: 'Account already exists.' }, { status: 409 });
    }
    return Response.json({ error: 'Database request failed.' }, { status: 503 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') return Response.json({ status: 'ok' });
    if (url.pathname === '/_internal/db') return handleInternalDatabaseRequest(request, env);
    if (url.pathname === '/stats') {
      if (request.method !== 'GET') return Response.json({ error: 'Method not allowed.' }, { status: 405 });
      const room = env.REALTIME_ROOM.getByName('freetown-life-global-room');
      const result = await room.fetch(new Request('https://room/_stats'));
      return Response.json(await result.json(), { headers: { 'Cache-Control': 'no-store' } });
    }
    if (url.pathname === '/db-health') {
      const token = env.DB_HEALTH_TOKEN;
      if (!token || request.headers.get('Authorization') !== `Bearer ${token}`) {
        return new Response('Not found', { status: 404 });
      }

      try {
        const result = await env.DB.prepare('SELECT 1 AS connected').first();
        const connected = result?.connected === 1;
        return Response.json({ database: connected ? 'connected' : 'error' }, { status: connected ? 200 : 503 });
      } catch {
        return Response.json({ database: 'error' }, { status: 503 });
      }
    }
    if (url.pathname !== '/' && url.pathname !== '/ws') return new Response('Not found', { status: 404 });
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected a WebSocket upgrade.', { status: 426 });
    }

    const origin = request.headers.get('Origin');
    const allowedOrigins = (env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000')
      .split(',').map((item) => item.trim()).filter(Boolean);
    if (origin && !allowedOrigins.includes(origin)) return new Response('Origin is not allowed.', { status: 403 });

    const room = env.REALTIME_ROOM.getByName('freetown-life-global-room');
    return room.fetch(request);
  },
};

export class RealtimeRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sessions = new Map();
    for (const socket of this.ctx.getWebSockets()) {
      const attachment = socket.deserializeAttachment();
      if (attachment) this.sessions.set(socket, attachment);
    }
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  async fetch(request) {
    if (new URL(request.url).pathname === '/_stats') {
      const online = [...this.sessions.values()].filter((session) => session.player).length;
      return Response.json({ online });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    const attachment = { connectionId: crypto.randomUUID(), player: null, windowStartedAt: Date.now(), messageCount: 0 };
    server.serializeAttachment(attachment);
    this.sessions.set(server, attachment);
    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(message, except = null) {
    for (const socket of this.sessions.keys()) if (socket !== except) safeSend(socket, message);
  }

  broadcastToBuilding(message, buildingId, except = null) {
    if (!buildingId) return;
    for (const [socket, session] of this.sessions) {
      if (socket !== except && session.player?.buildingId === buildingId) safeSend(socket, message);
    }
  }

  async webSocketMessage(socket, raw) {
    let session = this.sessions.get(socket) ?? socket.deserializeAttachment();
    if (!session) return;
    const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
    if (new TextEncoder().encode(text).byteLength > MAX_MESSAGE_BYTES) {
      socket.close(1009, 'Message too large');
      return;
    }
    const now = Date.now();
    const sameWindow = now - session.windowStartedAt < 1000;
    const messageCount = sameWindow ? session.messageCount + 1 : 1;
    if (messageCount > 30) {
      socket.close(1008, 'Too many updates');
      return;
    }
    session = { ...session, windowStartedAt: sameWindow ? session.windowStartedAt : now, messageCount };
    this.sessions.set(socket, session);
    socket.serializeAttachment(session);

    let message;
    try {
      message = JSON.parse(text);
    } catch {
      safeSend(socket, { type: 'error', message: 'Invalid JSON message.' });
      return;
    }
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      safeSend(socket, { type: 'error', message: 'Invalid message shape.' });
      return;
    }

    if (message.type === 'join') {
      const players = [...this.sessions.values()].map((item) => item.player).filter(Boolean);
      if (session.player || typeof message.id !== 'string' || !/^[\w-]{16,64}$/.test(message.id)) {
        safeSend(socket, { type: 'error', message: 'Invalid or duplicate player identity.' });
        return;
      }
      if (players.length >= MAX_PLAYERS || players.some((player) => player.id === message.id)) {
        safeSend(socket, { type: 'error', message: 'The multiplayer room is full or this identity is already online.' });
        socket.close(1008, 'Room full or duplicate identity');
        return;
      }
      if (typeof message.name !== 'string' || !USERNAME_PATTERN.test(message.name)
        || !validAppearance(message.appearance) || !validBuildingId(message.buildingId)
        || !validVector(message.position) || !validVector(message.target, true)) {
        safeSend(socket, { type: 'error', message: 'Invalid player profile or location.' });
        socket.close(1008, 'Invalid player profile');
        return;
      }

      const player = {
        id: message.id,
        name: message.name.replace(/^@/, ''),
        appearance: message.appearance,
        buildingId: message.buildingId,
        position: message.position,
        target: message.target,
      };
      session = { ...session, player };
      this.sessions.set(socket, session);
      socket.serializeAttachment(session);
      safeSend(socket, { type: 'snapshot', players: players.filter((item) => item.id !== player.id).map(publicPlayer) });
      this.broadcast({ type: 'player', player: publicPlayer(player) }, socket);

      const inboxKey = `inbox:${player.name.toLowerCase()}`;
      const inbox = await this.ctx.storage.get(inboxKey) ?? [];
      for (const item of inbox) safeSend(socket, item);
      await this.ctx.storage.delete(inboxKey);
      return;
    }

    const current = session.player;
    if (!current) {
      safeSend(socket, { type: 'error', message: 'Join the room before sending updates.' });
      return;
    }

    if (message.type === 'move') {
      if (!validVector(message.position) || !validVector(message.target, true)) {
        safeSend(socket, { type: 'error', message: 'Invalid movement update.' });
        return;
      }
      const updated = { ...current, position: message.position, target: message.target };
      session = { ...session, player: updated };
      this.sessions.set(socket, session);
      socket.serializeAttachment(session);
      this.broadcastToBuilding({ type: 'player', player: publicPlayer(updated) }, updated.buildingId, socket);
      return;
    }

    if (message.type === 'update') {
      if (typeof message.name !== 'string' || !USERNAME_PATTERN.test(message.name)
        || !validAppearance(message.appearance) || !validBuildingId(message.buildingId)
        || !validVector(message.position) || !validVector(message.target, true)) {
        safeSend(socket, { type: 'error', message: 'Invalid player update.' });
        return;
      }
      const updated = { ...current, name: message.name.replace(/^@/, ''), appearance: message.appearance,
        buildingId: message.buildingId, position: message.position, target: message.target };
      session = { ...session, player: updated };
      this.sessions.set(socket, session);
      socket.serializeAttachment(session);
      this.broadcast({ type: 'player', player: publicPlayer(updated) }, socket);
      return;
    }

    if (message.type === 'direct-message' || message.type === 'payment') {
      const to = typeof message.to === 'string' ? message.to.replace(/^@/, '').toLowerCase() : '';
      const id = typeof message.id === 'string' && /^[\w-]{8,80}$/.test(message.id) ? message.id : '';
      if (!id || !USERNAME_PATTERN.test(to) || to === current.name.toLowerCase()) {
        safeSend(socket, { type: 'error', message: 'Choose a valid other player.' });
        return;
      }
      let outgoing;
      if (message.type === 'direct-message') {
        const body = typeof message.text === 'string' ? message.text.trim() : '';
        if (!body || body.length > MAX_DIRECT_MESSAGE_LENGTH) {
          safeSend(socket, { type: 'error', message: `Messages must be 1–${MAX_DIRECT_MESSAGE_LENGTH} characters.` });
          return;
        }
        outgoing = { type: 'direct-message', message: { id, from: current.name, to, text: body, sentAt: Date.now() } };
      } else {
        if (!Number.isSafeInteger(message.amount) || message.amount <= 0 || message.amount > 10_000_000) {
          safeSend(socket, { type: 'error', message: 'Enter a valid in-game payment amount.' });
          return;
        }
        outgoing = { type: 'payment', transfer: { id, from: current.name, to, amount: message.amount, sentAt: Date.now() } };
      }

      const recipients = [...this.sessions.entries()].filter(([, item]) => item.player?.name.toLowerCase() === to);
      if (recipients.length) {
        for (const [recipient] of (message.type === 'payment' ? recipients.slice(0, 1) : recipients)) safeSend(recipient, outgoing);
      } else {
        const inboxKey = `inbox:${to}`;
        const inbox = await this.ctx.storage.get(inboxKey) ?? [];
        if (inbox.length >= MAX_PENDING_INBOX) inbox.shift();
        inbox.push(outgoing);
        await this.ctx.storage.put(inboxKey, inbox);
      }
      safeSend(socket, { type: 'delivery-status', id, to, queued: recipients.length === 0 });
      return;
    }

    safeSend(socket, { type: 'error', message: 'Unsupported message type.' });
  }

  webSocketClose(socket, code, reason) {
    const session = this.sessions.get(socket) ?? socket.deserializeAttachment();
    this.sessions.delete(socket);
    if (session?.player) this.broadcast({ type: 'left', id: session.player.id }, socket);
    try { socket.close(code, reason); } catch { /* socket is already closed */ }
  }

  webSocketError(socket) {
    const session = this.sessions.get(socket) ?? socket.deserializeAttachment();
    this.sessions.delete(socket);
    if (session?.player) this.broadcast({ type: 'left', id: session.player.id }, socket);
  }
}
