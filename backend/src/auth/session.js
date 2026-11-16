import { createHash, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'iera_session';
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function readSessionToken(req) {
  const cookies = (req.get('cookie') || '').split(';');
  const cookie = cookies.find((entry) => entry.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!cookie) return null;

  const value = cookie.trim().slice(SESSION_COOKIE_NAME.length + 1);
  return /^[0-9a-f]{64}$/i.test(value) ? value : null;
}

export function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'strict',
    path: '/api',
    maxAge: SESSION_TTL_SECONDS * 1000
  });
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production';
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'strict',
    path: '/api'
  });
}
