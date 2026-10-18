import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { deleteSession, findPlayerBySession, insertSession } from './db';

const SESSION_COOKIE = 'freetown_session';
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export async function createSession(playerId: number) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  await insertSession(playerId, tokenHash, expiresAt.getTime());
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function getSessionPlayer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !/^[\da-f]{64}$/.test(token)) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return findPlayerBySession(tokenHash, Date.now());
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  try {
    if (token && /^[\da-f]{64}$/.test(token)) {
      await deleteSession(createHash('sha256').update(token).digest('hex'));
    }
  } finally {
    // Always expire the browser cookie, even if deleting its database row fails.
    cookieStore.delete(SESSION_COOKIE);
  }
}
