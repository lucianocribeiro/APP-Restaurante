import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, POLL_MS } from '../lib/socket';
import api from '../api/axios';
import type { Order } from '../types';

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const socketConnected = useRef(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get<Order[]>('/admin/orders');
      setOrders(response.data.filter((o) => o.estado !== 'Cobrado'));
    } catch {
      // Silently retain previous data on fetch error
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (orderId: number, nextStatus: string) => {
    await api.put(`/admin/orders/${orderId}/status`, { estado: nextStatus });
    await fetchOrders();
  }, [fetchOrders]);

  const togglePayment = useCallback(async (orderId: number, currentStatus: boolean) => {
    await api.put(`/admin/orders/${orderId}/payment`, { pagoConfirmado: !currentStatus });
    await fetchOrders();
  }, [fetchOrders]);

  const closeTable = useCallback(async (_tableMesa: string, tableOrders: Order[]) => {
    await Promise.all(
      tableOrders.map((o) => api.put(`/admin/orders/${o.id}/status`, { estado: 'Cobrado' }))
    );
    await fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();

    const onConnect = () => { socketConnected.current = true; };
    const onDisconnect = () => { socketConnected.current = false; };
    const onNewOrder = (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('newOrder', onNewOrder);
    if (socket.connected) socketConnected.current = true;

    const interval = setInterval(() => {
      if (!socketConnected.current) fetchOrders();
    }, POLL_MS);

    return () => {
      clearInterval(interval);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('newOrder', onNewOrder);
    };
  }, [fetchOrders]);

  return { orders, loading, fetchOrders, updateStatus, togglePayment, closeTable };
}
