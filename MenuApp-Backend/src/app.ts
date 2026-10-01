import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api';

const FRONTEND_URL = process.env.FRONTEND_URL || '*';
export const corsOrigin =
  FRONTEND_URL === '*'
    ? true
    : Array.from(
        new Set([
          FRONTEND_URL,
          'http://localhost:5173',
          'http://127.0.0.1:5173'
        ])
      );

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

export default app;
