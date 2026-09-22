import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { prisma } from './lib/prisma';
import { initSocket } from './lib/socket';
import apiRoutes from './routes/api';

const app = express();
const httpServer = createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const corsOrigin =
  FRONTEND_URL === '*'
    ? true
    : Array.from(
        new Set([
          FRONTEND_URL,
          'http://localhost:5173',
          'http://127.0.0.1:5173'
        ])
      );

const io = initSocket(httpServer, corsOrigin);

const PORT = process.env.PORT || 3001;

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

const distPath = path.join(__dirname, '../../MenuApp-Frontend/dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return res.status(404).json({ message: 'API route not found', path: req.path });
  }

  const indexPath = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return res.status(404).json({ message: 'Frontend is not built. Use the Vite dev server.' });
  }

  res.sendFile(indexPath, (err) => {
    if (err) next(err);
  });
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

httpServer.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

export { io, prisma };
