import { X, CheckCircle } from 'lucide-react';
import type { Order } from '../../types';
import type { TableGroup } from './TableGrid';
import { formatPrice } from '../../lib/format';

interface TableDetailModalProps {
  selectedTable: string;
  tableData: TableGroup;
  onClose: () => void;
  onUpdateStatus: (orderId: number, status: string) => Promise<void>;
  onTogglePayment: (orderId: number, currentStatus: boolean) => Promise<void>;
  onCloseTable: (mesa: string, orders: Order[]) => Promise<void>;
  showToast: (msg: string, tone?: 'success' | 'error') => void;
}

export const TableDetailModal = ({
  selectedTable,
  tableData,
  onClose,
  onUpdateStatus,
  onTogglePayment,
  onCloseTable,
  showToast,
}: TableDetailModalProps) => {
  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await onUpdateStatus(orderId, status);
    } catch {
      showToast('Error al actualizar estado del pedido');
    }
  };

  const handleTogglePayment = async (orderId: number, current: boolean) => {
    try {
      await onTogglePayment(orderId, current);
    } catch {
      showToast('Error al actualizar el pago');
    }
  };

  const handleCloseTable = async () => {
    try {
      await onCloseTable(selectedTable, tableData.orders);
      onClose();
      showToast(`Mesa ${selectedTable} cerrada correctamente`, 'success');
    } catch {
      showToast('Error al cerrar la mesa');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[3.5rem] shadow-3xl border border-white/10 flex flex-col overflow-hidden">
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <h5 className="text-4xl font-black text-white italic">{selectedTable}</h5>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Detalle de Mesa</h2>
              <p className="text-gray-500 font-medium">Gestioná los pedidos y cerrá la cuenta.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
          {tableData.orders.map((order) => (
            <div key={order.id} className="bg-black/20 rounded-[2rem] p-6 border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-black text-gray-500 tracking-widest uppercase">Pedido #{order.id}</span>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    order.estado === 'Entregado' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-orange-500/10 text-orange-500 border-orange-500/10'
                  }`}>
                    {order.estado}
                  </div>
                  <button
                    onClick={() => handleTogglePayment(order.id, order.pagoConfirmado)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      order.pagoConfirmado
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white/5 text-gray-500 border-white/10 hover:border-primary/50'
                    }`}
                  >
                    {order.pagoConfirmado ? 'Pagado' : '$ Confirmar'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-bold text-gray-600 uppercase italic">Forma de Pago:</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  order.metodoPago === 'Efectivo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}>
                  {order.metodoPago === 'Efectivo' ? 'EFECTIVO' : 'TARJETA BAC'}
                </span>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <span className="font-black text-primary">{item.cantidad}x</span>
                      <span className="font-bold text-gray-300 text-sm">{item.producto.nombre}</span>
                    </div>
                    <span className="font-black text-white text-sm">{formatPrice(item.precioUnitario * item.cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                {order.estado !== 'Listo' && order.estado !== 'Entregado' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'Listo')} className="flex-1 bg-white hover:bg-gray-200 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                    Marcar Listo
                  </button>
                )}
                {order.estado === 'Listo' && (
                  <button onClick={() => handleUpdateStatus(order.id, 'Entregado')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">
                    Marcar Entregado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-10 bg-black/40 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Total Acumulado</p>
            <p className="text-5xl font-black text-primary tracking-tighter">{formatPrice(tableData.total)}</p>
          </div>
          {tableData.orders.length > 0 && (
            <button
              onClick={handleCloseTable}
              className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-4"
            >
              <CheckCircle size={24} /> Cerrar Mesa y Cobrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
