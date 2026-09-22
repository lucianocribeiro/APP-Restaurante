import { useState, useEffect } from 'react';
import { Utensils, LogOut, CheckCircle, Clock, ArrowRight, X, Plus, MapPin, Search } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../context/authStore';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';

const MozoDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [allTables, setAllTables] = useState<any[]>([]);
  const [local, setLocal] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchLocalData();

    const socket = getSocket();

    const onNewOrder = (order: any) => {
      setOrders((prev) => [order, ...prev]);
      fetchTables();
    };
    const onStatusUpdated = (updatedOrder: any) => {
      setOrders(prev => {
        if (updatedOrder.estado === 'Cobrado') {
          return prev.filter(o => o.id !== updatedOrder.id);
        }
        return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o);
      });
    };
    const onPaymentUpdated = (updatedOrder: any) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    socket.on('newOrder', onNewOrder);
    socket.on('orderStatusUpdated', onStatusUpdated);
    socket.on('orderPaymentUpdated', onPaymentUpdated);

    const interval = setInterval(() => { fetchOrders(); fetchTables(); }, 30000);
    return () => {
      clearInterval(interval);
      socket.off('newOrder', onNewOrder);
      socket.off('orderStatusUpdated', onStatusUpdated);
      socket.off('orderPaymentUpdated', onPaymentUpdated);
    };
  }, []);

  const fetchLocalData = async () => {
    try {
      // Usamos el slug por defecto o el del local del usuario
      const slug = user?.local?.slug || 'chilligarden';
      const response = await api.get(`/menu/${slug}`);
      setLocal(response.data);
    } catch (err) {
      console.error('Error fetching local data');
    }
  };

  const fetchTables = async () => {
    try {
      const response = await api.get('/admin/tables');
      setAllTables(response.data);
    } catch (err) {
      console.error('Error fetching tables');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.filter((o: any) => o.estado !== 'Cobrado'));
    } catch (err) {
      console.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTomarPedido = (mesaNum: string) => {
    const slug = user?.local?.slug || 'chilligarden';
    navigate(`/m/${slug}?mesa=${mesaNum}&mozo=true`);
  };

  const tables = allTables.reduce((acc: any, tableRecord: any) => {
    const mesaNum = tableRecord.numero;
    const tableOrders = orders.filter((o: any) => o.mesa === mesaNum);
    
    acc[mesaNum] = {
      mesa: mesaNum,
      orders: tableOrders,
      total: tableOrders.reduce((sum: number, o: any) => sum + o.total, 0),
      status: tableOrders.length > 0 ? 'Recibido' : 'Libre'
    };

    if (tableOrders.length > 0) {
      const statuses = tableOrders.map((o: any) => o.estado);
      if (statuses.includes('Recibido')) acc[mesaNum].status = 'Recibido';
      else if (statuses.includes('En preparación')) acc[mesaNum].status = 'En preparación';
      else if (statuses.includes('Listo')) acc[mesaNum].status = 'Listo';
      else acc[mesaNum].status = 'Entregado';
    }

    return acc;
  }, {});

  const tableList = Object.values(tables)
    .filter((t: any) => t.mesa.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a: any, b: any) => a.mesa.localeCompare(b.mesa, undefined, {numeric: true}));

  if (loading || !local) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#080B10] text-white">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Cargando Salón...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B10] pb-32 text-gray-100 selection:bg-primary selection:text-white">
      
      {/* Hero Header (Exact same as Menu.tsx) */}
      <div className="relative h-[300px] sm:h-[400px] overflow-hidden">
        {local.logo && (
          <div className="absolute inset-0">
            <img src={local.logo} alt="" className="w-full h-full object-cover opacity-40 blur-[2px] scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/40 to-transparent"></div>
          </div>
        )}
        
        <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-8 max-w-7xl mx-auto w-full animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {local.logo && (
                <div className="p-1 bg-gradient-to-br from-primary to-accent rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl w-fit animate-float">
                  <img src={local.logo} alt={local.nombre} className="w-16 h-16 sm:w-32 sm:h-32 rounded-[1.2rem] sm:rounded-[2.2rem] object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-primary font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mb-2 sm:mb-3">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-pulse"></span>
                  Panel Mozo Activo
                </div>
                <h1 className="text-3xl sm:text-7xl font-black tracking-tighter text-white mb-3 sm:mb-4 uppercase italic leading-none">{local.nombre}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 font-semibold text-[10px] sm:text-sm">
                  <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/5">
                    <MapPin size={12} className="text-primary" /> Salón Principal
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/5">
                    <Utensils size={12} className="text-orange-400" /> {tableList.length} Mesas
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="glass-dark px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5 hover:border-red-500/20 flex items-center gap-2"
            >
              <LogOut size={16} /> Cerrar Sesión
            </button>
          </div>
          
          <div className="mt-6 sm:mt-12 relative max-w-lg">
            <div className="glass-dark rounded-2xl sm:rounded-[2rem] px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-2xl border border-white/10 group focus-within:border-primary/50 transition-all">
              <Search size={18} className="text-gray-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar mesa..." 
                className="bg-transparent border-none outline-none w-full placeholder:text-gray-600 text-sm sm:text-base font-semibold text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-8 mt-12 sm:mt-16 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12 animate-fade-up">
          <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3 sm:gap-4">
            <span className="w-8 sm:w-12 h-[2px] sm:h-[3px] bg-primary rounded-full"></span>
            Gestión de Salón
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {tableList.map((table: any, idx: number) => (
            <div 
              key={table.mesa} 
              onClick={() => setSelectedTable(table.mesa)}
              className="group glass-dark rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-700 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col h-full relative animate-fade-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full blur-3xl opacity-10 transition-opacity duration-700 group-hover:opacity-30 ${
                table.status === 'Recibido' ? 'bg-orange-500' : 
                table.status === 'Listo' ? 'bg-blue-500' : 
                table.status === 'Libre' ? 'bg-gray-500' : 'bg-green-500'
              }`}></div>

              <div className="p-6 sm:p-8 flex flex-col flex-1 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 block">Mesa</span>
                    <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none group-hover:text-primary transition-colors">{table.mesa}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 ${
                    table.status === 'Recibido' ? 'text-orange-400 bg-orange-400/10' : 
                    table.status === 'Listo' ? 'text-blue-400 bg-blue-400/10' : 
                    table.status === 'Libre' ? 'text-gray-600 bg-white/5' : 'text-green-400 bg-green-400/10'
                  }`}>
                    {table.status === 'Recibido' ? <Clock size={24} /> : table.status === 'Libre' ? <Utensils size={24} /> : <CheckCircle size={24} />}
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Estado</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                      table.status === 'Recibido' ? 'text-orange-500 border-orange-500/20 bg-orange-500/5' : 
                      table.status === 'Listo' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5' : 
                      table.status === 'Libre' ? 'text-gray-500 border-white/5 bg-white/5' : 'text-green-500 border-green-500/20 bg-green-500/5'
                    }`}>
                      {table.status}
                    </span>
                  </div>
                  {table.total > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cuenta</span>
                      <span className="text-xl font-black text-white italic tracking-tight">${table.total}</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTomarPedido(table.mesa);
                  }}
                  className="w-full shimmer-btn relative overflow-hidden bg-white/5 hover:bg-primary text-gray-300 hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/5 hover:border-primary shadow-xl"
                >
                  <Plus size={16} /> TOMAR PEDIDO
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Detail Modal (Styled like Cart Modal) */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedTable(null)}></div>
          
          <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-[#080B10] flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.8)] border-l border-white/5 animate-in slide-in-from-right duration-500 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 sm:p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20">
                   <h2 className="text-3xl font-black text-white italic">{selectedTable}</h2>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                    <Utensils size={12} /> Detalle de Mesa
                  </div>
                  <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Mesa {selectedTable}</h2>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTable(null)} 
                className="w-10 h-10 sm:w-14 sm:h-14 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90 border border-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 custom-scrollbar">
              {tables[selectedTable].orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                  <Utensils size={60} className="mb-6 text-gray-600" strokeWidth={1} />
                  <p className="font-black text-xl uppercase italic tracking-widest text-gray-500">Mesa libre sin pedidos</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {tables[selectedTable].orders.map((order: any) => (
                    <div key={order.id} className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full"></div>
                      
                      <div className="flex justify-between items-center mb-8 relative z-10">
                        <span className="text-[10px] font-black text-gray-600 tracking-[0.2em] uppercase">Pedido #{order.id}</span>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          order.estado === 'Entregado' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 
                          order.estado === 'Listo' ? 'bg-blue-500/10 text-blue-500 border-blue-500/10' :
                          'bg-orange-500/10 text-orange-500 border-orange-500/10'
                        }`}>
                          {order.estado}
                        </span>
                      </div>

                      <div className="space-y-4 mb-8">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl group-hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="font-black text-primary text-sm bg-primary/10 w-8 h-8 flex items-center justify-center rounded-lg">{item.cantidad}x</span>
                              <span className="font-bold text-gray-300 text-sm uppercase italic">{item.producto.nombre}</span>
                            </div>
                            <span className="font-black text-white text-sm italic tracking-tight">${item.precioUnitario * item.cantidad}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Subtotal Pedido</span>
                        <span className="text-2xl font-black text-white italic tracking-tighter">${order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-10 bg-black/40 border-t border-white/5 shrink-0">
               <div className="flex justify-between items-end mb-8">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total Mesa</span>
                  <span className="text-4xl font-black text-primary italic tracking-tighter leading-none">${tables[selectedTable].total}</span>
                </div>
              <button 
                onClick={() => handleTomarPedido(selectedTable)}
                className="w-full py-6 rounded-[2.5rem] bg-gradient-to-r from-primary to-orange-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(255,77,28,0.4)] hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center justify-center gap-4 shimmer-btn relative overflow-hidden"
              >
                <Plus size={20} />
                TOMAR NUEVO PEDIDO
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MozoDashboard;
