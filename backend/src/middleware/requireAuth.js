import { findSessionByTokenHash } from '../models/authModel.js';
import { clearSessionCookie, hashSessionToken, readSessionToken } from '../auth/session.js';

export function createRequireAuth(findSession = findSessionByTokenHash) {
  return async function requireAuth(req, res, next) {
    const token = readSessionToken(req);
    if (!token) {
      return res.status(401).json({ success: false, error: 'Login diperlukan.' });
    }

    try {
      const session = await findSession(hashSessionToken(token));
      if (!session) {
        clearSessionCookie(res);
        return res.status(401).json({ success: false, error: 'Sesi login tidak valid.' });
      }
      req.authUser = session.user;
      req.sessionTokenHash = hashSessionToken(token);
      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export const requireAuth = createRequireAuth();
