function createAuthRateLimit({ limit, windowMs }) {
  const buckets = new Map();

  return function authRateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    if (bucket.count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ success: false, error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
    }

    bucket.count += 1;
    if (buckets.size > 10000) {
      for (const [bucketKey, entry] of buckets) {
        if (entry.resetAt <= now) buckets.delete(bucketKey);
      }
    }
    return next();
  };
}

export const registrationRateLimit = createAuthRateLimit({ limit: 5, windowMs: 60 * 60 * 1000 });
export const loginRateLimit = createAuthRateLimit({ limit: 20, windowMs: 15 * 60 * 1000 });
