import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Plus, Minus, X, Utensils, CheckCircle, ArrowRight, Clock, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { useCartStore } from '../context/cartStore';
import { formatPrice } from '../lib/format';
import type { PaymentMethod } from '../types';

const Menu = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mesaParam = searchParams.get('mesa');
  const isMozo = searchParams.get('mozo') === 'true';

  const [local, setLocal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedTableNum, setSelectedTableNum] = useState<string>(mesaParam || '');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ id: number; total: number; metodoPago: PaymentMethod } | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [tipoOrden, setTipoOrden] = useState<'salon' | 'retirar'>('salon');

  const { items, addItem, removeItem, total, clearCart } = useCartStore();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get(`/menu/${slug}`);
        setLocal(response.data);
        if (response.data.categorias.length > 0) {
          setSelectedCategory(response.data.categorias[0].id);
        }
      } catch (err) {
        setError('No se pudo cargar el menú. Verificá el enlace.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  const handlePlaceOrder = async () => {
    if (!selectedTableNum && tipoOrden === 'salon') {
      alert('Por favor elegí una mesa para continuar.');
      return;
    }

    const orderTotal = total();
    setPlacingOrder(true);
    try {
      const response = await api.post('/orders', {
        localId: local.id,
        mesa: tipoOrden === 'retirar' ? 'Retirar' : selectedTableNum,
        metodoPago: paymentMethod,
        total: orderTotal,
        tipoOrden,
        items: items.map(item => ({
          productId: item.productId,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
          aclaracion: ''
        }))
      });
      setLastOrder({ id: response.data.id, total: orderTotal, metodoPago: paymentMethod });
      setIsOrderSuccess(true);
      clearCart();
    } catch (err) {
      alert('Error al enviar el pedido. Por favor intentá de nuevo.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#080B10] text-white">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Cargando Experiencia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#080B10] p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-black text-white mb-2 uppercase italic">¡Ups! Algo salió mal</h2>
        <p className="text-gray-400 font-medium">{error}</p>
      </div>
    );
  }

  if (!local) return null;

  if (isOrderSuccess) {
    return (
      <div className="min-h-screen bg-[#080B10] dot-grid flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 animate-fade-up">
          <div className="w-28 h-28 bg-green-500/10 text-green-500 rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto border border-green-500/20 shadow-2xl shadow-green-500/10">
            <CheckCircle size={56} strokeWidth={1.5} />
          </div>
          <h2 className="text-5xl font-black text-white mb-4 italic uppercase tracking-tighter leading-none">
            ¡Pedido <span className="text-primary">Enviado!</span>
          </h2>
          <p className="text-gray-400 max-w-sm mb-12 font-medium leading-relaxed mx-auto text-lg">
            Estamos preparando tu pedido de <span className="text-white font-bold">{local.nombre}</span>
            {tipoOrden === 'salon' && selectedTableNum
              ? <> para la <span className="text-primary font-black uppercase">Mesa {selectedTableNum}</span></>
              : <> para <span className="text-primary font-black uppercase">Retirar</span></>
            }.
          </p>
          {lastOrder?.metodoPago === 'Tarjeta BAC' && local.linkPago && (
            <div className="glass-dark border border-white/10 rounded-[2rem] p-6 mb-10 max-w-sm mx-auto">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total a pagar</p>
              <p className="text-4xl font-black text-white italic tracking-tighter mb-5">{formatPrice(lastOrder.total)}</p>
              <a
                href={local.linkPago}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-primary to-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all"
              >
                <CreditCard size={18} /> Pagar con tarjeta
              </a>
              <p className="text-gray-500 text-xs font-medium mt-4 leading-relaxed">
                Se abre la billetera de BAC Credomatic. Ingresá ese monto y el local confirma tu pago.
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => isMozo ? navigate('/mozo/dashboard') : setIsOrderSuccess(false)}
              className="bg-white/5 text-white px-8 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 border border-white/10"
            >
              {isMozo ? 'Volver al Panel Mozo' : 'Cerrar'}
            </button>
            {!isMozo && lastOrder && (
              <button
                onClick={() => navigate(`/status/${lastOrder.id}`)}
                className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
              >
                Seguir mi Pedido <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filteredCategories = local.categorias.map((cat: any) => ({
    ...cat,
    productos: cat.productos.filter((p: any) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter((cat: any) => cat.productos.length > 0);


  return (
    <div className="min-h-screen bg-[#080B10] pb-32 text-gray-100 selection:bg-primary selection:text-white">

      {/* Hero Header */}
      <div className="relative h-[200px] sm:h-[260px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={`/images/${local.slug}/cover.jpg`} alt="" className="w-full h-full object-cover opacity-40 blur-[2px] scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080B10] via-[#080B10]/50 to-transparent"></div>
        </div>
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-8 pb-5 max-w-3xl mx-auto w-full">
          <div className="flex items-end gap-4">
            {local.logo && (
              <img
                src={local.logo}
                alt={local.nombre}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-white p-1 border-2 border-white/10 shadow-xl shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic leading-none truncate">
                {local.nombre}
              </h1>
              {local.horarioApertura && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock size={12} className="text-green-400 shrink-0" />
                  <span className="text-green-400 font-bold text-xs">
                    {local.diasAtencion ? `${local.diasAtencion} de ` : ''}{local.horarioApertura}
                    {local.horarioCierre ? ` a ${local.horarioCierre}` : ''}
                  </span>
                </div>
              )}
              {local.direccion && (
                <div className="flex items-center gap-1.5 mt-1">
                  <svg className="text-gray-400 shrink-0 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="text-gray-400 font-bold text-xs">{local.direccion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Retirar / Salón Tabs */}
      {!isMozo && (
        <div className="px-4 sm:px-8 pt-4 pb-1 max-w-3xl mx-auto">
          <div className="flex gap-1 bg-white/5 rounded-2xl p-1 border border-white/5 w-fit">
            <button
              onClick={() => setTipoOrden('salon')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tipoOrden === 'salon'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Salón
            </button>
            <button
              onClick={() => setTipoOrden('retirar')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${tipoOrden === 'retirar'
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              Retirar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 sm:px-8 py-3 max-w-3xl mx-auto">
        <div className="glass-dark rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 group focus-within:border-primary/50 transition-all">
          <Search size={16} className="text-gray-500 group-focus-within:text-primary transition-colors shrink-0" />
          <input
            type="text"
            placeholder="¿Qué te gustaría comer?"
            className="bg-transparent border-none outline-none w-full placeholder:text-gray-600 text-sm font-medium text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="sticky top-0 bg-[#080B10]/90 backdrop-blur-2xl z-30 border-b border-white/5 overflow-x-auto no-scrollbar py-3 flex gap-2 px-4 sm:px-8">
        {local.categorias.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              const element = document.getElementById(`cat-${cat.id}`);
              if (element) {
                const y = element.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-300 whitespace-nowrap ${selectedCategory === cat.id
              ? 'bg-primary text-white shadow-[0_6px_20px_rgba(255,77,28,0.3)]'
              : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/5'
              }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Menu Sections */}
      <div className="px-4 sm:px-8 mt-6 space-y-10 max-w-3xl mx-auto">
        {filteredCategories.map((cat: any, idx: number) => (
          <div key={cat.id} id={`cat-${cat.id}`} className="animate-fade-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white">
                {cat.nombre}
              </h2>
              <span className="text-gray-600 font-bold text-[10px] bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 uppercase tracking-widest">
                {cat.productos.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.productos.map((prod: any) => (
                <div
                  key={prod.id}
                  className="group glass-dark rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-300 p-3 flex gap-3 items-start"
                >
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-sm text-white uppercase italic leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {prod.nombre}
                      </h3>
                      {prod.descripcion && (
                        <p className="text-[11px] text-gray-500 font-medium leading-snug mt-1 line-clamp-2">
                          {prod.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2.5 gap-2">
                      <span className="text-primary font-black text-sm">
                        {formatPrice(prod.precio)}
                      </span>
                      <button
                        onClick={() => addItem({
                          productId: prod.id,
                          nombre: prod.nombre,
                          precio: prod.precio,
                          cantidad: 1,
                          imagen: prod.imagen
                        })}
                        className="flex items-center gap-1 bg-white/5 hover:bg-primary text-gray-400 hover:text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 border border-white/5 hover:border-primary shrink-0"
                      >
                        <Plus size={12} /> Agregar
                      </button>
                    </div>
                  </div>

                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-900 border border-white/5">
                    {prod.imagen ? (
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Utensils className="text-white/10" size={24} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {items.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4 flex justify-center">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-gradient-to-r from-primary to-orange-600 text-white px-5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center gap-4 ring-4 ring-[#080B10] group backdrop-blur-xl w-full max-w-sm"
          >
            <div className="relative shrink-0">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xl">
                {items.reduce((acc, i) => acc + i.cantidad, 0)}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/70 leading-none mb-1">Revisar Pedido</p>
              <p className="text-lg font-black leading-none">{formatPrice(total())}</p>
            </div>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsCartOpen(false)}></div>

          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-[#080B10] flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.8)] border-l border-white/5 animate-in slide-in-from-right duration-500 overflow-hidden">

            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-black/20">
              <div>
                <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-[0.2em] mb-1">
                  <ShoppingCart size={11} /> Tu Selección
                </div>
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Carrito</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-90 border border-white/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                  <Utensils size={48} className="mb-4" strokeWidth={1} />
                  <p className="font-bold text-base uppercase italic tracking-widest">El carrito está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-xl bg-gray-900 overflow-hidden shrink-0 border border-white/5">
                        {item.imagen && <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm text-white uppercase italic truncate">{item.nombre}</h4>
                        <p className="text-primary font-black text-sm">{formatPrice(item.precio)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10 shrink-0">
                        <button onClick={() => removeItem(item.productId)} className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"><Minus size={12} /></button>
                        <span className="font-black text-sm min-w-[16px] text-center text-white">{item.cantidad}</span>
                        <button onClick={() => addItem(item)} className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="space-y-5 pt-5 border-t border-white/5">
                  <div>
                    <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3">Tipo de pedido</p>
                    <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5 w-fit">
                      <button
                        onClick={() => setTipoOrden('salon')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${tipoOrden === 'salon' ? 'bg-primary text-white' : 'text-gray-500'
                          }`}
                      >Salón</button>
                      <button
                        onClick={() => setTipoOrden('retirar')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${tipoOrden === 'retirar' ? 'bg-primary text-white' : 'text-gray-500'
                          }`}
                      >Retirar</button>
                    </div>
                  </div>

                  {tipoOrden === 'salon' && (
                    <div>
                      <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3">Elegí tu mesa</p>
                      <div className="flex flex-wrap gap-2">
                        {local.mesas && local.mesas.map((mesa: any) => (
                          <button
                            key={mesa.id}
                            disabled={isMozo && !!mesaParam}
                            onClick={() => setSelectedTableNum(mesa.numero)}
                            className={`py-2.5 px-4 rounded-xl border-2 transition-all font-black text-sm ${selectedTableNum === mesa.numero
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20'
                              }`}
                          >
                            {mesa.numero}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isMozo && (
                    <div>
                      <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3">Método de pago</p>
                      <div className={`grid gap-2 ${local.linkPago ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <button
                          onClick={() => setPaymentMethod('Efectivo')}
                          className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${paymentMethod === 'Efectivo'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-white/5 border-white/5 text-gray-600 hover:bg-white/10'
                            }`}
                        >
                          💵 Efectivo
                        </button>
                        {local.linkPago && (
                          <button
                            onClick={() => setPaymentMethod('Tarjeta BAC')}
                            className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${paymentMethod === 'Tarjeta BAC'
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-white/5 border-white/5 text-gray-600 hover:bg-white/10'
                              }`}
                          >
                            💳 Tarjeta
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 bg-black/40 border-t border-white/5 shrink-0">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-white italic tracking-tighter leading-none">{formatPrice(total())}</span>
              </div>
              <button
                disabled={placingOrder || items.length === 0}
                onClick={handlePlaceOrder}
                className={`w-full py-5 rounded-[1.8rem] font-black text-sm tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-3 ${placingOrder || items.length === 0
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-primary to-orange-600 text-white shadow-[0_10px_30px_rgba(255,77,28,0.4)] hover:scale-[1.02] active:scale-95'
                  }`}
              >
                {placingOrder ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>ENVIANDO...</span>
                  </div>
                ) : (
                  <>CONFIRMAR PEDIDO <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;