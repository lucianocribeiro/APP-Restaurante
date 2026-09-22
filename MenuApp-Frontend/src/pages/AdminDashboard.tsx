import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Utensils, Settings, LogOut, CheckCircle, Clock, ArrowRight, X, Package, Plus, Minus, Search, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../context/authStore';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../lib/socket';

const AdminDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [allTables, setAllTables] = useState<any[]>([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [activeTab, setActiveTab] = useState<'salon' | 'config' | 'stock'>('salon');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [kitchens, setKitchens] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKitchen, setSelectedKitchen] = useState<string>('all');
    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [showKitchenModal, setShowKitchenModal] = useState(false);
    const [newKitchenName, setNewKitchenName] = useState('');
    const [newProduct, setNewProduct] = useState({
      nombre: '',
      descripcion: '',
      precio: '',
      categoryId: '',
      kitchenId: '',
      imagen: '',
      stock: '0'
    });
    const [localSettings, setLocalSettings] = useState<any>({
      nombre: '',
      logo: '',
      cbuAlias: '',
      mercadoPagoLink: ''
    });
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

    useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchLocalSettings();
    const fetchInitialData = async () => {
      try {
        const catRes = await api.get('/admin/categories');
        setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching categories');
      }
    };
    fetchInitialData();
    fetchKitchens();

    const socket = getSocket();

    const onConnect = () => {
      console.log('🔌 Socket connected:', socket.id);
    };
    const onNewOrder = (order: any) => {
      console.log('🔔 New order received:', order);
      setOrders((prev) => [order, ...prev]);
      fetchTables();
    };
    const onStatusUpdated = (updatedOrder: any) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };
    const onPaymentUpdated = (updatedOrder: any) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    };

    socket.on('connect', onConnect);
    socket.on('newOrder', onNewOrder);
    socket.on('orderStatusUpdated', onStatusUpdated);
    socket.on('orderPaymentUpdated', onPaymentUpdated);

    const interval = setInterval(() => { fetchOrders(); fetchTables(); }, 30000);
    return () => {
      clearInterval(interval);
      socket.off('connect', onConnect);
      socket.off('newOrder', onNewOrder);
      socket.off('orderStatusUpdated', onStatusUpdated);
      socket.off('orderPaymentUpdated', onPaymentUpdated);
    };
  }, []);

  const fetchTables = async () => {
      try {
        const response = await api.get('/admin/tables');
        setAllTables(response.data);
      } catch (err) {
        console.error('Error fetching tables');
      }
    };

    const fetchLocalSettings = async () => {
      try {
        const response = await api.get('/admin/local');
        if (response.data) {
          setLocalSettings(response.data);
        }
      } catch (err) {
        console.error('Error fetching local settings');
      }
    };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      // Filter out orders already 'Cobrado' to keep view clean, 
      // though backend typically handles this, we ensure frontend consistency
      setOrders(response.data.filter((o: any) => o.estado !== 'Cobrado'));
    } catch (err) {
      console.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, nextStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { estado: nextStatus });
      fetchOrders();
    } catch (err) {
      alert('Error al actualizar estado');
    }
  };

  const togglePayment = async (orderId: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/orders/${orderId}/payment`, { pagoConfirmado: !currentStatus });
      fetchOrders();
    } catch (err) {
      alert('Error al actualizar el pago');
    }
  };

  const closeTable = async (tableMesa: string) => {
    if (!window.confirm(`¿Cerrar cuenta de Mesa ${tableMesa} y marcar como pagado?`)) return;
    
    const tableOrders = orders.filter(o => o.mesa === tableMesa);
    try {
      await Promise.all(tableOrders.map(o => 
        api.put(`/admin/orders/${o.id}/status`, { estado: 'Cobrado' })
      ));
      setSelectedTable(null);
      fetchOrders();
    } catch (err) {
      alert('Error al cerrar la mesa');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const addTable = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTableNum) return;
      try {
        await api.post('/admin/tables', { numero: newTableNum });
        setNewTableNum('');
        fetchTables();
      } catch (err) {
        alert('Error al agregar mesa');
      }
    };

    const saveLocalSettings = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await api.put('/admin/local', localSettings);
        alert('Configuración guardada correctamente');
      } catch (err) {
        alert('Error al guardar configuración');
      }
    };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', newProduct);
      setShowNewProductModal(false);
      setNewProduct({ 
        nombre: '', 
        descripcion: '', 
        precio: '', 
        categoryId: '', 
        kitchenId: '', 
        imagen: '', 
        stock: '0' 
      });
      fetchProducts();
    } catch (err) {
      alert('Error al crear producto');
    }
  };

    const fetchKitchens = async () => {
      try {
        const response = await api.get('/admin/kitchens');
        setKitchens(response.data);
      } catch (err) {
        console.error('Error fetching kitchens');
      }
    };

    const addKitchen = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await api.post('/admin/kitchens', { nombre: newKitchenName });
        setNewKitchenName('');
        fetchKitchens();
      } catch (err) {
        alert('Error al agregar cocina');
      }
    };

    const deleteKitchen = async (id: number) => {
      if (!window.confirm('¿Eliminar esta cocina? Asegurate de que no tenga productos asociados.')) return;
      try {
        await api.delete(`/admin/kitchens/${id}`);
        fetchKitchens();
      } catch (err) {
        alert('Error al eliminar cocina. Verificá si tiene productos asociados.');
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await api.get('/admin/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products');
      }
    };

  const deleteTableRecord = async (id: number) => {
    if (!window.confirm('¿Eliminar esta mesa?')) return;
    try {
      await api.delete(`/admin/tables/${id}`);
      fetchTables();
    } catch (err) {
      alert('Error al eliminar mesa');
    }
  };

  const updateStock = async (productId: number, newStock: number) => {
    try {
      await api.put(`/admin/products/${productId}/stock`, { stock: Math.max(0, newStock) });
      fetchProducts();
    } catch (err) {
      alert('Error al actualizar stock');
    }
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchProducts();
      fetchKitchens();
    }
  }, [activeTab]);

  // Enhanced Grouping Logic: Include all configured tables
  const tables = allTables.reduce((acc: any, tableRecord: any) => {
    const mesaNum = tableRecord.numero;
    
    // Find orders for this table
    const tableOrders = orders.filter((o: any) => o.mesa === mesaNum);
    
    acc[mesaNum] = {
      mesa: mesaNum,
      orders: tableOrders,
      total: tableOrders.reduce((sum: number, o: any) => sum + o.total, 0),
      status: tableOrders.length > 0 ? 'Recibido' : 'Libre'
    };

    if (tableOrders.length > 0) {
      // Determine table status based on orders
      const statuses = tableOrders.map((o: any) => o.estado);
      if (statuses.includes('Recibido')) acc[mesaNum].status = 'Recibido';
      else if (statuses.includes('En preparación')) acc[mesaNum].status = 'En preparación';
      else if (statuses.includes('Listo')) acc[mesaNum].status = 'Listo';
      else acc[mesaNum].status = 'Entregado';

      // Track if all orders are paid and what methods are used
      acc[mesaNum].pagoConfirmado = tableOrders.every((o: any) => o.pagoConfirmado);
      acc[mesaNum].metodosPago = Array.from(new Set(tableOrders.map((o: any) => o.metodoPago)));
    } else {
      acc[mesaNum].pagoConfirmado = false;
      acc[mesaNum].metodosPago = [];
    }

    return acc;
  }, {});

  const tableList = Object.values(tables).sort((a: any, b: any) => a.mesa.localeCompare(b.mesa, undefined, {numeric: true}));

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex font-sans">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-3 bg-gray-900 border border-white/10 rounded-xl text-primary shadow-2xl"
        >
          {isSidebarOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-gray-900 border-r border-white/5 flex flex-col fixed inset-y-0 z-40 shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Utensils className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">MenuApp</h1>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">Premium Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-2">
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-4 mb-4">Gestión de Salón</div>
          <button 
            onClick={() => { setActiveTab('salon'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group ${activeTab === 'salon' ? 'bg-primary/10 text-primary border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent'}`}
          >
            <LayoutDashboard size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight">Mesas Activas</span>
          </button>
          <button 
            onClick={() => { setActiveTab('stock'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group ${activeTab === 'stock' ? 'bg-primary/10 text-primary border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent'}`}
          >
            <Package size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight">Gestión Stock</span>
          </button>
          <button 
            onClick={() => { setActiveTab('config'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all border group ${activeTab === 'config' ? 'bg-primary/10 text-primary border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5 border-transparent'}`}
          >
            <Settings size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-tight">Configurar Mesas</span>
          </button>
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-4 mb-6 px-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg">
              {user?.email[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-black text-white truncate">{user?.local?.nombre || 'Mi Local'}</p>
              <p className="text-xs text-gray-500 truncate font-medium">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 p-4 rounded-2xl transition-all text-xs font-black uppercase tracking-widest border border-white/5 hover:border-red-500/20">
            <LogOut size={18} /> Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 sm:p-10 lg:p-14 pt-20 lg:pt-14">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">
                {activeTab === 'salon' ? 'Mesas' : activeTab === 'stock' ? 'Stock' : 'Config'}
              </h2>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest border border-primary/20">
                {activeTab === 'salon' ? 'Activas' : activeTab === 'stock' ? 'Inventario' : 'Ajustes'}
              </div>
            </div>
            <p className="text-gray-500 font-medium">
              {activeTab === 'salon' ? 'Control de cuentas y pedidos por mesa.' : 
               activeTab === 'stock' ? 'Control de disponibilidad de productos en tiempo real.' : 
               'Gestión de mesas y configuración local.'}
            </p>
          </div>
        </header>

        {/* Improved Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-gray-900 border border-white/5 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl">
            <p className="text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Mesas Abiertas</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white">{tableList.length}</h3>
          </div>
          <div className="bg-gray-900 border border-white/5 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl">
            <p className="text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Pedidos Totales</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white">{orders.length}</h3>
          </div>
          <div className="bg-gray-900 border border-white/5 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl sm:col-span-2">
            <p className="text-gray-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Total por Cobrar</p>
            <h3 className="text-2xl sm:text-3xl font-black text-primary">${Object.values(tables).reduce((acc: number, t: any) => acc + t.total, 0)}</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : activeTab === 'salon' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {tableList.length === 0 ? (
              <div className="col-span-full bg-gray-900 rounded-[3rem] p-20 text-center border-2 border-dashed border-white/5">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"><ShoppingBag size={40} className="text-gray-700" /></div>
                <h3 className="text-xl font-black text-gray-500 uppercase tracking-tighter">Salón sin actividad</h3>
              </div>
            ) : (
              tableList.map((table: any) => (
                <div 
                  key={table.mesa} 
                  onClick={() => setSelectedTable(table.mesa)}
                  className={`bg-gray-900 rounded-[2.5rem] p-8 border hover:border-primary/40 transition-all duration-500 group cursor-pointer shadow-xl relative overflow-hidden ${
                    table.status === 'Libre' ? 'border-white/5 opacity-60 hover:opacity-100' : 'border-white/10'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 ${
                    table.status === 'Recibido' ? 'bg-orange-500' : 
                    table.status === 'Listo' ? 'bg-blue-500' : 
                    table.status === 'Libre' ? 'bg-gray-500' : 'bg-green-500'
                  }`}></div>
                  
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
                      <p className={`text-3xl font-black ${table.total > 0 ? 'text-primary' : 'text-gray-700'}`}>${table.total}</p>
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
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-500 uppercase shrink-0">
                        {table.status === 'Libre' ? 'Mesa Libre' : `${table.orders.length} pedidos`}
                      </span>
                      {table.metodosPago.map((metodo: string) => (
                        <span key={metodo} className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md border ${
                                              metodo === 'Efectivo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`}>
                                              {metodo === 'Efectivo' ? '💵 ' : '📱 '}{metodo}
                                            </span>
                      ))}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'stock' ? (
          <div className="max-w-6xl">
            {/* Search and Filters */}
            <div className="bg-gray-900 border border-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl mb-8 sm:mb-10 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex-1 min-w-[250px] relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar producto por nombre..." 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <select 
                  value={selectedKitchen}
                  onChange={(e) => setSelectedKitchen(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all min-w-[150px]"
                >
                  <option value="all">Todas las Cocinas</option>
                  <option value="none">Sin Cocina / General</option>
                  {kitchens.map(k => <option key={k.id} value={k.id.toString()}>{k.nombre}</option>)}
                </select>

                <button 
                  onClick={() => setShowKitchenModal(true)}
                  className="bg-white/5 hover:bg-white/10 text-gray-400 p-4 rounded-xl transition-all border border-white/5 shrink-0"
                  title="Gestionar Cocinas"
                >
                  <Utensils size={20} />
                </button>
              </div>

              <button 
                onClick={() => setShowNewProductModal(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 shrink-0"
              >
                <Plus size={18} /> Nuevo Producto
              </button>
            </div>

            {/* Stock Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gray-900 border border-white/5 p-6 rounded-3xl shadow-xl hover:border-primary/20 transition-all group">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">General / Sin Cocina</p>
                    <div className="flex justify-between items-end">
                        {(() => {
                            const generalProducts = products.filter(p => !p.kitchenId);
                            const totalStock = generalProducts.reduce((sum, p) => sum + p.stock, 0);
                            const lowStockCount = generalProducts.filter(p => p.stock <= 5).length;
                            return (
                                <>
                                    <div>
                                        <h3 className="text-3xl font-black text-white">{totalStock} <span className="text-[10px] text-gray-500 uppercase">uds.</span></h3>
                                        <p className="text-[10px] font-bold text-gray-500">{generalProducts.length} productos</p>
                                    </div>
                                    {lowStockCount > 0 && (
                                        <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse">
                                            {lowStockCount} alertas
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
                {kitchens.map(k => {
                    const kitchenProducts = products.filter(p => p.kitchenId === k.id);
                    const totalStock = kitchenProducts.reduce((sum, p) => sum + p.stock, 0);
                    const lowStockCount = kitchenProducts.filter(p => p.stock <= 5).length;
                    
                    return (
                        <div key={k.id} className="bg-gray-900 border border-white/5 p-6 rounded-3xl shadow-xl hover:border-primary/20 transition-all group">
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">{k.nombre}</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-3xl font-black text-white">{totalStock} <span className="text-[10px] text-gray-500 uppercase">uds.</span></h3>
                                    <p className="text-[10px] font-bold text-gray-500">{kitchenProducts.length} productos</p>
                                </div>
                                {lowStockCount > 0 && (
                                    <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse">
                                        {lowStockCount} alertas
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Inventory Table */}
            <div className="bg-gray-900 rounded-2xl sm:rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden overflow-x-auto">
              <div className="min-w-[800px]">
                <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Producto</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Categoría</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-left">Cocina</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Stock Actual</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products
                    .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .filter(p => {
                        if (selectedKitchen === 'all') return true;
                        if (selectedKitchen === 'none') return !p.kitchenId;
                        return p.kitchenId?.toString() === selectedKitchen;
                    })
                    .map((product) => (
                    <tr key={product.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-800 border border-white/5 overflow-hidden">
                            <img src={product.imagen || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-black text-white italic uppercase tracking-tighter">{product.nombre}</p>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">${product.precio}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">
                          {product.categoria?.nombre}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/10">
                          {product.kitchen?.nombre || 'General'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`text-2xl font-black italic tracking-tight ${product.stock <= 5 ? 'text-red-500' : 'text-primary'}`}>
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => updateStock(product.id, product.stock - 1)}
                            className="w-10 h-10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                          >
                            <Minus size={18} />
                          </button>
                          <button 
                            onClick={() => updateStock(product.id, product.stock + 1)}
                            className="w-10 h-10 bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                          >
                            <Plus size={18} />
                          </button>
                          <input 
                            type="number"
                            className="w-16 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-center text-white focus:outline-none focus:border-primary/50 font-bold"
                            defaultValue={product.stock}
                            onBlur={(e) => updateStock(product.id, parseInt(e.target.value))}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-600 font-bold italic uppercase tracking-widest text-sm">
                        Cargando inventario...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Configuración de Pagos */}
            <div className="bg-gray-900 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-white/5 shadow-2xl mb-8 sm:mb-10">
              <h3 className="text-xl sm:text-2xl font-black text-white mb-6 italic uppercase tracking-tighter">Configuración de Pagos</h3>
              <form onSubmit={saveLocalSettings} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">CBU o Alias para transferencias</label>
                  <input 
                    type="text" 
                    placeholder="Ej: 1234567890123456789012 o mi.alias"
                    value={localSettings.cbuAlias || ''}
                    onChange={(e) => setLocalSettings({...localSettings, cbuAlias: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Link de Mercado Pago</label>
                  <input 
                    type="text" 
                    placeholder="Ej: https://mpago.la/xxxxxx"
                    value={localSettings.mercadoPagoLink || ''}
                    onChange={(e) => setLocalSettings({...localSettings, mercadoPagoLink: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20"
                >
                  Guardar Configuración
                </button>
              </form>
            </div>

            {/* Configuración de Mesas */}
            <div className="bg-gray-900 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-10 border border-white/5 shadow-2xl mb-8 sm:mb-10">
              <h3 className="text-xl sm:text-2xl font-black text-white mb-6 italic uppercase tracking-tighter">Agregar Nueva Mesa</h3>
              <form onSubmit={addTable} className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Número de mesa (Ej: 1, 10, VIP-A)" 
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                />
                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20"
                >
                  Agregar Mesa
                </button>
              </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allTables.map((table) => (
                <div key={table.id} className="bg-gray-900 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center group relative overflow-hidden">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Mesa</span>
                  <h4 className="text-4xl font-black text-white italic">{table.numero}</h4>
                  <button 
                    onClick={() => deleteTableRecord(table.id)}
                    className="mt-4 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              {allTables.length === 0 && (
                <p className="col-span-full text-gray-500 text-center font-bold py-10">No hay mesas configuradas aún.</p>
              )}
            </div>
          </div>
        )}

        {/* Table Detail Modal */}
        {selectedTable && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-[2rem] sm:rounded-[3.5rem] shadow-3xl border border-white/10 flex flex-col overflow-hidden">
              <div className="p-6 sm:p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-primary rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 shrink-0">
                    <h5 className="text-2xl sm:text-4xl font-black text-white italic">{selectedTable}</h5>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">Detalle de Mesa</h2>
                    <p className="hidden sm:block text-gray-500 font-medium">Gestioná los pedidos y cerrá la cuenta.</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTable(null)} className="w-10 h-10 sm:w-14 sm:h-14 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                {tables[selectedTable].orders.map((order: any) => (
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
                          onClick={() => togglePayment(order.id, order.pagoConfirmado)}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            order.pagoConfirmado 
                            ? 'bg-green-500 text-white border-green-500' 
                            : 'bg-white/5 text-gray-500 border-white/10 hover:border-primary/50'
                          }`}
                        >
                          {order.pagoConfirmado ? '✓ Pagado' : '$ Confirmar'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold text-gray-600 uppercase italic">Forma de Pago:</span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                            order.metodoPago === 'Efectivo' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                          }`}>
                                            {order.metodoPago === 'Efectivo' ? '💵 EFECTIVO' : '📱 MERCADO PAGO'}
                                          </span>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-primary">{item.cantidad}x</span>
                            <span className="font-bold text-gray-300 text-sm">{item.producto.nombre}</span>
                          </div>
                          <span className="font-black text-white text-sm">${item.precioUnitario * item.cantidad}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex gap-3">
                      {order.estado !== 'Listo' && order.estado !== 'Entregado' && (
                        <button onClick={() => updateStatus(order.id, 'Listo')} className="flex-1 bg-white hover:bg-gray-200 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Marcar Listo</button>
                      )}
                      {order.estado === 'Listo' && (
                        <button onClick={() => updateStatus(order.id, 'Entregado')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Marcar Entregado</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 sm:p-10 bg-black/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">Total Acumulado</p>
                  <p className="text-4xl sm:text-5xl font-black text-primary tracking-tighter leading-none">${tables[selectedTable].total}</p>
                </div>
                {tables[selectedTable].orders.length > 0 && (
                  <button 
                    onClick={() => closeTable(selectedTable)}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-8 sm:px-12 py-5 sm:py-6 rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 sm:gap-4"
                  >
                    <CheckCircle size={20} /> Cerrar Mesa y Cobrar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* New Product Modal */}
        {showNewProductModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-gray-900 w-full max-w-2xl rounded-[3.5rem] shadow-3xl border border-white/10 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">Nuevo Producto</h2>
                <button onClick={() => setShowNewProductModal(false)} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateProduct} className="p-10 space-y-8 overflow-y-auto max-h-[70vh] no-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Nombre del Producto</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej: Hamburguesa Especial"
                      value={newProduct.nombre}
                      onChange={(e) => setNewProduct({...newProduct, nombre: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all font-bold text-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Categoría</label>
                    <select 
                      required
                      value={newProduct.categoryId}
                      onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all font-bold appearance-none"
                    >
                      <option value="">Seleccionar...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Cocina</label>
                    <select 
                      required
                      value={newProduct.kitchenId}
                      onChange={(e) => setNewProduct({...newProduct, kitchenId: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all font-bold appearance-none"
                    >
                      <option value="">General / Ninguna</option>
                      {kitchens.map(k => <option key={k.id} value={k.id}>{k.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Precio ($)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      value={newProduct.precio}
                      onChange={(e) => setNewProduct({...newProduct, precio: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Stock Inicial</label>
                    <input 
                      required
                      type="number" 
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">URL de Imagen (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..."
                      value={newProduct.imagen}
                      onChange={(e) => setNewProduct({...newProduct, imagen: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all font-bold text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-3">Descripción (Opcional)</label>
                    <textarea 
                      placeholder="Breve descripción del producto..."
                      value={newProduct.descripcion}
                      onChange={(e) => setNewProduct({...newProduct, descripcion: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-primary/50 transition-all font-bold h-32 resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowNewProductModal(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-6 rounded-3xl font-black uppercase tracking-widest text-xs transition-all border border-white/5"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] bg-primary hover:bg-primary-dark text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 transition-all active:scale-95"
                  >
                    Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Kitchen Management Modal */}
        {showKitchenModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-gray-900 w-full max-w-lg rounded-[3.5rem] shadow-3xl border border-white/10 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20">
                <h2 className="text-3xl font-black text-white tracking-tight italic uppercase">Gestión de Cocinas</h2>
                <button onClick={() => setShowKitchenModal(false)} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="p-10 space-y-8">
                <form onSubmit={addKitchen} className="flex gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder="Nombre de la cocina..."
                    value={newKitchenName}
                    onChange={(e) => setNewKitchenName(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
                  />
                  <button type="submit" className="bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl transition-all">
                    <Plus size={24} />
                  </button>
                </form>

                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                  {kitchens.map(kitchen => (
                    <div key={kitchen.id} className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <Utensils className="text-primary" size={20} />
                        <span className="font-bold text-white uppercase tracking-tight">{kitchen.nombre}</span>
                      </div>
                      <button 
                        onClick={() => deleteKitchen(kitchen.id)}
                        className="text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {kitchens.length === 0 && (
                    <p className="text-center text-gray-600 italic py-8">No hay cocinas registradas.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
