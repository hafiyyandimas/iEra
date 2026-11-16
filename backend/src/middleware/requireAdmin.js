import { requireAuth } from './requireAuth.js';

export function createRequireAdmin(requireSession = requireAuth) {
  return function requireAdmin(req, res, next) {
    return requireSession(req, res, (error) => {
      if (error) return next(error);
      if (req.authUser?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Akses hanya untuk admin.' });
      }
      return next();
    });
  };
}

export const requireAdmin = createRequireAdmin();
