import { timingSafeEqual } from 'node:crypto';

export function requireAdmin(req, res, next) {
  const expected = process.env.API_ADMIN_TOKEN;
  if (!expected) {
    return res.status(404).json({ success: false, error: 'Not found.' });
  }

  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const providedBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  const authorized = providedBuffer.length === expectedBuffer.length
    && timingSafeEqual(providedBuffer, expectedBuffer);

  if (!authorized) return res.status(401).json({ success: false, error: 'Admin authorization required.' });
  return next();
}
