import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import app, { corsOrigin } from './app';
import { prisma } from './lib/prisma';
import { initSocket } from './lib/socket';

const httpServer = createServer(app);
const io = initSocket(httpServer, corsOrigin);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

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

httpServer.listen(Number(PORT), HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

export { io, prisma };
