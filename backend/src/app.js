import express from 'express';
import cors from 'cors';
import animalRoutes from './routes/animalRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('Origin tidak diizinkan oleh CORS.');
    error.status = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/animals', animalRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
