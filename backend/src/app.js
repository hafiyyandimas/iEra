import express from 'express';
import cors from 'cors';
import animalRoutes from './routes/animalRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getAllowedOrigins, isRequestOriginAllowed } from './config/cors.js';

const app = express();
const allowedOrigins = getAllowedOrigins(process.env.ALLOWED_ORIGIN || 'http://localhost:5173');

app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (!origin) return next();

  const forwardedProtocol = req.get('x-forwarded-proto')?.split(',')[0].trim();
  const protocol = forwardedProtocol || req.protocol;
  const requestOrigin = `${protocol}://${req.get('host')}`;
  if (isRequestOriginAllowed(origin, requestOrigin, allowedOrigins)) return next();

  return res.status(403).json({ success: false, error: 'Origin tidak diizinkan oleh CORS.' });
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(new URL(origin).origin)) return callback(null, true);
    return callback(null, false);
  }
}));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/animals', animalRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
