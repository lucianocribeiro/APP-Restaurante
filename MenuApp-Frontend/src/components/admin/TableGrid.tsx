import { ShoppingBag, Utensils, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import type { Order, Table } from '../../types';
import { formatPrice } from '../../lib/format';

interface TableGroup {
  mesa: string;
  orders: Order[];
  total: number;
  status: string;
  pagoConfirmado: boolean;
  metodosPago: string[];
}

interface TableGridProps {
  tableList: TableGroup[];
  onSelect: (mesa: string) => void;
}

export const TableGrid = ({ tableList, onSelect }: TableGridProps) => {
  if (tableList.length === 0) {
    return (
      <div className="col-span-full bg-gray-900 rounded-[3rem] p-20 text-center border-2 border-dashed border-white/5">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-gray-700" />
        </div>
        <h3 className="text-xl font-black text-gray-500 uppercase tracking-tighter">Salón sin actividad</h3>
      </div>
    );
  }

  return (
    <>
      {tableList.map((table) => (
        <div
          key={table.mesa}
          onClick={() => onSelect(table.mesa)}
          className={`bg-gray-900 rounded-[2.5rem] p-8 border hover:border-primary/40 transition-all duration-500 group cursor-pointer shadow-xl relative overflow-hidden ${
            table.status === 'Libre' ? 'border-white/5 opacity-60 hover:opacity-100' : 'border-white/10'
          }`}
        >
          <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 ${
            table.status === 'Recibido' ? 'bg-orange-500' :
            table.status === 'Listo' ? 'bg-blue-500' :
            table.status === 'Libre' ? 'bg-gray-500' : 'bg-green-500'
          }`} />

          <div className="flex justify-between items-start mb-6 relative">
            <div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mesa</span>
              <h4 className="text-5xl font-black text-white leading-none italic">{table.mesa}</h4>
            </div>
            <div className={`p-2 rounded-xl ${
              table.status === 'Recibido' ? 'text-orange-500 bg-orange-500/10' :
              table.status === 'Listo' ? 'text-blue-500 bg-blue-500/10' :
              table.status === 'Libre' ? 'text-gray-600 bg-gray-800/50' : 'text-gray-500 bg-gray-800'
            }`}>
              {table.status === 'Recibido' ? <Clock size={20} /> : table.status === 'Libre' ? <Utensils size={20} /> : <CheckCircle size={20} />}
            </div>
          </div>

          <div className="space-y-1 mb-8">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Cuenta Actual</p>
            <div className="flex items-center gap-3">
              <p className={`text-3xl font-black ${table.total > 0 ? 'text-primary' : 'text-gray-700'}`}>{formatPrice(table.total)}</p>
              {table.total > 0 && (
                <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                  table.pagoConfirmado ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {table.pagoConfirmado ? 'Pagado' : 'Pendiente'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">
                {table.status === 'Libre' ? 'Mesa Libre' : `${table.orders.length} pedidos`}
              </span>
              {table.metodosPago.map((metodo) => (
                <span key={metodo} className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                  metodo === 'Efectivo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }`}>
                  {metodo}
                </span>
              ))}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export type { TableGroup };
export type { Table };
