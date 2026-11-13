export function normalizeOrigin(value) {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getAllowedOrigins(value = 'http://localhost:5173') {
  return value.split(',').map((entry) => {
    const origin = normalizeOrigin(entry.trim());
    if (!origin) throw new Error(`ALLOWED_ORIGIN contains an invalid origin: ${entry}`);
    return origin;
  });
}

export function isRequestOriginAllowed(origin, requestOrigin, allowedOrigins) {
  const normalizedOrigin = normalizeOrigin(origin);
  return Boolean(normalizedOrigin && (
    normalizedOrigin === normalizeOrigin(requestOrigin)
    || allowedOrigins.includes(normalizedOrigin)
  ));
}
