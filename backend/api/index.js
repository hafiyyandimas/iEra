import 'dotenv/config';
import app from '../src/app.js';

export default function handler(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const apiPath = requestUrl.searchParams.get('path');
  if (apiPath) {
    const query = new URLSearchParams(requestUrl.searchParams);
    query.delete('path');
    const pathname = apiPath === 'health' ? '/health' : `/api/${apiPath}`;
    req.url = `${pathname}${query.toString() ? `?${query.toString()}` : ''}`;
  }
  return app(req, res);
}
