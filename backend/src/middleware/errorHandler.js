export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  console.error(error);
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status >= 500 ? 'Terjadi kesalahan pada server.' : error.message;
  return res.status(status).json({ success: false, error: message });
}
