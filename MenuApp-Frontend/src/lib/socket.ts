import { io, Socket } from 'socket.io-client';

// Prefer explicit backend URL (Vercel / split deploy). In local Vite, talk to
// the API process directly — never proxy Socket.IO WS through Vite on Windows.
const SOCKET_URL =
  (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '') ||
  (import.meta.env.DEV ? 'http://127.0.0.1:3001' : window.location.origin);

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // Always HTTP long-polling: native WebSockets on this Windows laptop
    // have triggered kernel crashes (Qualcomm QCA9377 / RST → 0xD1 / 0x139).
    socket = io(SOCKET_URL, {
      autoConnect: true,
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
