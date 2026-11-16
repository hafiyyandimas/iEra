import { normalizeUsername } from '../../../src/auth/username.js';
import { createSession, createUser, deleteSession, findUserByUsername } from '../models/authModel.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import {
  clearSessionCookie,
  createSessionToken,
  hashSessionToken,
  readSessionToken,
  SESSION_TTL_SECONDS,
  setSessionCookie
} from '../auth/session.js';

const DUMMY_PASSWORD_HASH = 'scrypt$16384$8$1$00000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

function validateCredentials(body, requireStrongPassword) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }

  let username;
  try {
    username = normalizeUsername(body.username);
  } catch (error) {
    error.status = 400;
    throw error;
  }

  if (typeof body.password !== 'string') {
    const error = new Error('Password wajib diisi.');
    error.status = 400;
    throw error;
  }
  if (body.password.length > PASSWORD_MAX_LENGTH || (requireStrongPassword && body.password.length < PASSWORD_MIN_LENGTH)) {
    const error = new Error(`Password harus ${requireStrongPassword ? '8-128' : 'maksimal 128'} karakter.`);
    error.status = 400;
    throw error;
  }
  if (!body.password.length) {
    const error = new Error('Password wajib diisi.');
    error.status = 400;
    throw error;
  }

  return { username, password: body.password };
}

function createAuthenticatedSession(res, user) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  return createSession({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    expiresAt
  }).then(() => {
    setSessionCookie(res, token);
    return { id: user.id, username: user.username, role: user.role };
  });
}

export async function register(req, res, next) {
  try {
    const { username, password } = validateCredentials(req.body, true);
    const user = await createUser({ username, passwordHash: await hashPassword(password) });
    const publicUser = await createAuthenticatedSession(res, user);
    return res.status(201).json({ success: true, data: { user: publicUser } });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = validateCredentials(req.body, false);
    const user = await findUserByUsername(username);
    const passwordMatches = await verifyPassword(password, user?.password_hash || DUMMY_PASSWORD_HASH);
    if (!user || !passwordMatches) {
      return res.status(401).json({ success: false, error: 'Username atau password salah.' });
    }

    const publicUser = await createAuthenticatedSession(res, user);
    return res.json({ success: true, data: { user: publicUser } });
  } catch (error) {
    return next(error);
  }
}

export function getCurrentUser(req, res) {
  return res.json({ success: true, data: { user: req.authUser } });
}

export async function logout(req, res, next) {
  try {
    const token = readSessionToken(req);
    if (token) await deleteSession(hashSessionToken(token));
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}
