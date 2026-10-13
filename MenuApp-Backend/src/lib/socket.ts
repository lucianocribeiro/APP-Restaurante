import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server | null = null;

export function initSocket(
  httpServer: HttpServer,
  origin: string | string[] | boolean
): Server {
  io = new Server(httpServer, {
    cors: {
      origin,
      methods: ['GET', 'POST']
    },
    // Keep payloads small so a bad object cannot blow the process.
    maxHttpBufferSize: 1e6,
    // Compression on Windows + many reconnects has caused native crashes.
    perMessageDeflate: false,
    httpCompression: false,
    pingInterval: 25000,
    pingTimeout: 20000,
    connectTimeout: 10000,
    // On this Windows laptop, native WebSockets have crashed the kernel
    // (0xD1 / 0x139). Linux production can still upgrade to WebSocket.
    transports:
      process.platform === 'win32' ? ['polling'] : ['polling', 'websocket'],
    allowUpgrades: process.platform !== 'win32'
  });
  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
}

export function emitSafe(event: string, payload: unknown): void {
  if (!io) {
    console.warn(`Socket.io not ready, skipped emit: ${event}`);
    return;
  }

  try {
    const safe = JSON.parse(JSON.stringify(payload));
    io.emit(event, safe);
  } catch (error) {
    console.error(`Failed to emit ${event}:`, error);
  }
}
