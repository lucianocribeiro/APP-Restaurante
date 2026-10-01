import { io, Socket } from 'socket.io-client';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

// Vercel (same-origin /api as serverless functions) has no Socket.IO server,
// so realtime only runs in local dev or against a separate long-running API.
export const REALTIME_ENABLED = Boolean(BACKEND_URL) || import.meta.env.DEV;

// Without realtime, screens fall back to frequent polling.
export const POLL_MS = REALTIME_ENABLED ? 30000 : 5000;

// In local Vite, talk to the API process directly — never proxy Socket.IO WS
// through Vite on Windows.
const SOCKET_URL = BACKEND_URL || 'http://127.0.0.1:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Always HTTP long-polling: native WebSockets on this Windows laptop
    // have triggered kernel crashes (Qualcomm QCA9377 / RST → 0xD1 / 0x139).
    socket = io(SOCKET_URL, {
      autoConnect: REALTIME_ENABLED,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 10000,
      transports: ['polling'],
      upgrade: false,
      withCredentials: false
    });
  }

  return socket;
}
