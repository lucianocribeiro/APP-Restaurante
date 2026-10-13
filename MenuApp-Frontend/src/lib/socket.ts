import { io } from 'socket.io-client';
import { supabase } from './supabase';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

// Poll every 3 seconds for rock-solid sync on all devices
export const POLL_MS = 3000;
export const REALTIME_ENABLED = true;

const SOCKET_URL = BACKEND_URL || 'http://127.0.0.1:3001';

class SupabaseRealtimeBus {
  private listeners: Record<string, Set<Function>> = {};
  public id = 'supabase-realtime';
  public connected = true;

  constructor() {
    this.initSupabase();
  }

  private async fetchFullOrder(orderId: number) {
    try {
      const { data } = await supabase
        .from('Order')
        .select('*, items:OrderItem(*, producto:Product(*))')
        .eq('id', orderId)
        .single();
      return data;
    } catch {
      return null;
    }
  }

  private initSupabase() {
    try {
      supabase
        .channel('public:Order')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'Order' },
          async (payload) => {
            const newRecord = payload.new as any;
            if (!newRecord?.id) return;

            const fullOrder = await this.fetchFullOrder(newRecord.id);
            const orderToSend = fullOrder || newRecord;

            if (payload.eventType === 'INSERT') {
              this.emit('newOrder', orderToSend);
            } else if (payload.eventType === 'UPDATE') {
              this.emit('orderStatusUpdated', orderToSend);
              this.emit('orderPaymentUpdated', orderToSend);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.connected = true;
            this.emit('connect');
          }
        });
    } catch (err) {
      console.warn('Supabase realtime subscription failed, polling will handle sync:', err);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);
    return this;
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event].delete(callback);
    }
    return this;
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`Error in event listener ${event}:`, err);
        }
      });
    }
    return true;
  }
}

let socketInstance: any = null;

export function getSocket(): any {
  if (!socketInstance) {
    if (BACKEND_URL) {
      socketInstance = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 15000,
        randomizationFactor: 0.5,
        timeout: 10000,
        transports: ['polling'],
        upgrade: false,
        withCredentials: false,
      });
    } else {
      socketInstance = new SupabaseRealtimeBus();
    }
  }
  return socketInstance;
}
