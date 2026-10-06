import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Plus, Minus, X, Utensils, CheckCircle, ArrowRight, Clock, CreditCard, MessageCircle, Instagram } from 'lucide-react';
import api, { HAS_BACKEND } from '../api/axios';
import { useCartStore } from '../context/cartStore';
import { formatPrice } from '../lib/format';
import { ENTREPANES_LOCAL } from '../data/entrepanes';
import type { PaymentMethod } from '../types';

type LastOrder = {
  id: number | null;
  total: number;
  metodoPago: PaymentMethod;
  whatsappUrl: string | null;
};

const Menu = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mesaParam = searchParams.get('mesa');
  const isMozo = searchParams.get('mozo') === 'true';

  const [local, setLocal] = useState<any>(null);
  const [isStatic, setIsStatic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedTableNum, setSelectedTableNum] = useState<string>(mesaParam || '');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [tipoOrden, setTipoOrden] = useState<'salon' | 'retirar'>('salon');

  const { items, addItem, removeItem, total, clearCart } = useCartStore();

  useEffect(() => {
    const loadStaticMenu = () => {
      if (slug !== ENTREPANES_LOCAL.slug) {
        setError('No se pudo cargar el menú. Verifica el enlace.');
        return;
      }
      setLocal(ENTREPANES_LOCAL);
      setIsStatic(true);
      setSelectedCategory(ENTREPANES_LOCAL.categorias[0].id);
    };

    const fetchMenu = async () => {
      if (!HAS_BACKEND) {
        loadStaticMenu();
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/menu/${slug}`);
        setLocal({ ...ENTREPANES_LOCAL, ...response.data });
        if (response.data.categorias.length > 0) {
          setSelectedCategory(response.data.categorias[0].id);
        }
      } catch (err) {
        loadStaticMenu();
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [slug]);

  const buildWhatsappUrl = (orderTotal: number) => {
    const lines = items.map(
      (item) => `• ${item.cantidad} x ${item.nombre} — ${formatPrice(item.precio * item.cantidad)}`
    );
    const destino = tipoOrden === 'retirar' ? 'Para retirar' : `Mesa ${selectedTableNum}`;
    const message = [
      `Hola ${local.nombre}, quiero hacer este pedido:`,
      '',
      ...lines,
      '',
      `Total: ${formatPrice(orderTotal)}`,
      destino,
      `Pago: ${paymentMethod === 'Tarjeta BAC' ? 'Tarjeta (link BAC)' : 'Efectivo'}`,
    ].join('\n');
    return `https://wa.me/${local.whatsapp}?text=${encodeURIComponent(message)}`;
  };

  const handlePlaceOrder = async () => {
    if (!selectedTableNum && tipoOrden === 'salon') {
      alert('Por favor elige una mesa para continuar.');
      return;
    }

    const orderTotal = total();

    if (isStatic) {
      let demoOrderId: number | null = null;
      if (!HAS_BACKEND) {
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
          demoOrderId = response.data.id;
        } catch {
          // Demo store unavailable: the WhatsApp order still works
        }
      }
      setLastOrder({
        id: demoOrderId,
        total: orderTotal,
        metodoPago: paymentMethod,
        whatsappUrl: local.whatsapp ? buildWhatsappUrl(orderTotal) : null,
      });
      setIsOrderSuccess(true);
      setIsCartOpen(false);
      clearCart();
      return;
    }

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
      setLastOrder({ id: response.data.id, total: orderTotal, metodoPago: paymentMethod, whatsappUrl: null });
      setIsOrderSuccess(true);
      setIsCartOpen(false);
      clearCart();
    } catch (err) {
      alert('Error al enviar el pedido. Por favor intenta de nuevo.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-cream text-brand">
        <div className="w-12 h-12 border-4 border-peach border-t-brand rounded-full animate-spin mb-4"></div>
        <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Cargando menú...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-cream p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 border border-red-100">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-black text-brand mb-2">¡Ups! Algo salió mal</h2>
        <p className="text-gray-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!local) return null;

  if (isOrderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-fade-up w-full max-w-sm">
          <img src={local.logo} alt={local.nombre} className="w-24 h-24 object-contain mx-auto mb-6" />
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto border border-green-100">
            <CheckCircle size={32} strokeWidth={1.75} />
          </div>
          <h2 className="text-3xl font-black text-brand mb-3 leading-tight">
            {isStatic ? '¡Pedido listo!' : '¡Pedido enviado!'}
          </h2>
          <p className="text-gray-600 mb-8 font-medium leading-relaxed">
            {isStatic
              ? <>Envíalo por WhatsApp o muéstraselo al mesero.</>
              : <>
                  Estamos preparando tu pedido
                  {tipoOrden === 'salon' && selectedTableNum
                    ? <> para la <span className="text-brand font-bold">Mesa {selectedTableNum}</span></>
                    : <> para <span className="text-brand font-bold">retirar</span></>
                  }.
                </>
            }
          </p>

          <div className="bg-white border border-peach rounded-3xl p-6 mb-6 shadow-sm">
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Total a pagar</p>
            <p className="text-4xl font-black text-brand tracking-tight mb-5">{lastOrder ? formatPrice(lastOrder.total) : ''}</p>

            <div className="space-y-3">
              {lastOrder?.whatsappUrl && (
                <a
                  href={lastOrder.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <MessageCircle size={18} /> Enviar pedido por WhatsApp
                </a>
              )}
              {lastOrder?.metodoPago === 'Tarjeta BAC' && local.linkPago && (
                <>
                  <a
                    href={local.linkPago}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-brand hover:bg-brand-dark text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <CreditCard size={18} /> Pagar con tarjeta
                  </a>
                  <p className="text-gray-500 text-xs font-medium leading-relaxed">
                    Se abre la billetera de BAC Credomatic. Ingresa ese monto y el local confirma tu pago.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {!isMozo && lastOrder?.id && (
              <button
                onClick={() => navigate(`/status/${lastOrder.id}`)}
                className="bg-brand text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Seguir mi pedido <ArrowRight size={16} />
              </button>
            )}
            <button
              onClick={() => isMozo ? navigate('/mozo/dashboard') : setIsOrderSuccess(false)}
              className="text-brand px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs border border-peach bg-white active:scale-95 transition-all"
            >
              {isMozo ? 'Volver al panel' : 'Volver al menú'}
            </button>
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
    <div className="min-h-screen bg-cream pb-32 text-gray-800 selection:bg-brand selection:text-white">

      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-b from-white via-white to-cream">
        <div className="absolute inset-0 opacity-[0.07]">
          <img src={`/images/${local.slug}/cover.jpg`} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-8 pb-6 max-w-3xl mx-auto">
          {local.logo && (
            <img
              src={local.logo}
              alt={local.nombre}
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-sm"
            />
          )}
          <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-brand leading-none">
            {local.nombre}
          </h1>
          {local.subtitulo && (
            <p className="mt-1 text-brand/80 font-semibold text-sm sm:text-base">{local.subtitulo}</p>
          )}
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-brand/60">Menú digital</p>

          {local.horarioApertura && (
            <div className="flex items-center gap-1.5 mt-3">
              <Clock size={12} className="text-green-700 shrink-0" />
              <span className="text-green-700 font-semibold text-xs">
                {local.diasAtencion ? `${local.diasAtencion} de ` : ''}{local.horarioApertura}
                {local.horarioCierre ? ` a ${local.horarioCierre}` : ''}
              </span>
            </div>
          )}
          {local.direccion && (
            <p className="mt-1 text-gray-500 font-medium text-xs">{local.direccion}</p>
          )}
        </div>
      </header>

      {/* Salón / Retirar */}
      {!isMozo && (
        <div className="px-4 sm:px-8 pt-2 pb-1 max-w-3xl mx-auto flex justify-center">
          <div className="flex gap-1 bg-white rounded-2xl p-1 border border-peach shadow-sm">
            {(['salon', 'retirar'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setTipoOrden(tipo)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${tipoOrden === tipo
                  ? 'bg-brand text-white shadow'
                  : 'text-brand/60 hover:text-brand'
                  }`}
              >
                {tipo === 'salon' ? 'Salón' : 'Retirar'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="px-4 sm:px-8 py-3 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-peach shadow-sm focus-within:border-brand/50 transition-all">
          <Search size={16} className="text-brand/50 shrink-0" />
          <input
            type="text"
            placeholder="¿Qué te gustaría comer?"
            className="bg-transparent border-none outline-none w-full placeholder:text-gray-400 text-sm font-medium text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categorías */}
      <nav className="sticky top-0 bg-cream/95 backdrop-blur-xl z-30 border-b border-peach overflow-x-auto no-scrollbar py-3 flex gap-2 px-4 sm:px-8">
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
            className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === cat.id
              ? 'bg-brand text-white shadow'
              : 'bg-white text-brand/70 border border-peach hover:text-brand'
              }`}
          >
            {cat.nombre}
          </button>
        ))}
      </nav>

      {/* Secciones del menú */}
      <main className="px-4 sm:px-8 mt-6 space-y-10 max-w-3xl mx-auto">
        {filteredCategories.map((cat: any) => (
          <section key={cat.id} id={`cat-${cat.id}`}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-brand">
                {cat.nombre}
              </h2>
              <div className="flex-1 h-px bg-peach"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.productos.map((prod: any) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-peach/70 shadow-sm hover:shadow-md transition-all p-3 flex gap-3 items-start"
                >
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <h3 className="font-bold text-[15px] text-gray-900 leading-snug">
                        {prod.nombre}
                      </h3>
                      {prod.descripcion && (
                        <p className="text-xs text-gray-500 leading-snug mt-1 line-clamp-3">
                          {prod.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <span className="text-brand font-black text-base">
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
                        className="flex items-center gap-1 bg-peach/60 hover:bg-brand text-brand hover:text-white px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all active:scale-95 shrink-0"
                      >
                        <Plus size={12} /> Agregar
                      </button>
                    </div>
                  </div>

                  {prod.imagen && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-cream">
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Pie con redes */}
      {(local.instagram || local.whatsapp) && (
        <footer className="mt-14 bg-brand text-white">
          <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col items-center gap-3 text-sm font-medium">
            {local.instagram && (
              <a href={`https://instagram.com/${local.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-peach">
                <Instagram size={18} /> {local.instagram}
              </a>
            )}
            {local.whatsapp && (
              <a href={`https://wa.me/${local.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-peach">
                <MessageCircle size={18} /> {local.whatsappLabel || local.whatsapp}
              </a>
            )}
          </div>
        </footer>
      )}

      {/* Botón flotante del carrito */}
      {items.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4 flex justify-center">
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-brand hover:bg-brand-dark text-white px-5 py-4 rounded-2xl shadow-2xl shadow-brand/30 flex items-center gap-4 w-full max-w-sm transition-colors"
          >
            <div className="relative shrink-0">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-white text-brand text-[9px] font-black px-1.5 py-0.5 rounded-md">
                {items.reduce((acc, i) => acc + i.cantidad, 0)}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70 leading-none mb-1">Ver pedido</p>
              <p className="text-lg font-black leading-none">{formatPrice(total())}</p>
            </div>
            <ArrowRight size={18} className="shrink-0" />
          </button>
        </div>
      )}

      {/* Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>

          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white flex flex-col shadow-2xl overflow-hidden">

            <div className="p-5 border-b border-peach flex justify-between items-center bg-cream">
              <div>
                <div className="flex items-center gap-2 text-brand/70 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                  <ShoppingCart size={11} /> Tu selección
                </div>
                <h2 className="text-2xl font-black text-brand leading-none">Tu pedido</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-10 h-10 bg-white hover:bg-peach/40 rounded-xl flex items-center justify-center text-brand transition-all active:scale-90 border border-peach"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-10">
                  <Utensils size={48} className="mb-4" strokeWidth={1} />
                  <p className="font-bold text-base">Tu pedido está vacío</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-cream overflow-hidden shrink-0 border border-peach flex items-center justify-center">
                        {item.imagen
                          ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                          : <Utensils size={18} className="text-brand/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{item.nombre}</h4>
                        <p className="text-brand font-bold text-sm">{formatPrice(item.precio)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-cream rounded-xl p-1 border border-peach shrink-0">
                        <button onClick={() => removeItem(item.productId)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg text-brand transition-colors"><Minus size={12} /></button>
                        <span className="font-black text-sm min-w-[16px] text-center text-gray-900">{item.cantidad}</span>
                        <button onClick={() => addItem({ ...item, cantidad: 1 })} className="w-7 h-7 flex items-center justify-center bg-brand text-white hover:bg-brand-dark rounded-lg transition-colors"><Plus size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <div className="space-y-5 pt-5 border-t border-peach">
                  <div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Tipo de pedido</p>
                    <div className="flex gap-1 bg-cream rounded-xl p-1 border border-peach w-fit">
                      {(['salon', 'retirar'] as const).map((tipo) => (
                        <button
                          key={tipo}
                          onClick={() => setTipoOrden(tipo)}
                          className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${tipoOrden === tipo ? 'bg-brand text-white' : 'text-brand/60'}`}
                        >
                          {tipo === 'salon' ? 'Salón' : 'Retirar'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {tipoOrden === 'salon' && (
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Elige tu mesa</p>
                      <div className="flex flex-wrap gap-2">
                        {local.mesas && local.mesas.map((mesa: any) => (
                          <button
                            key={mesa.id}
                            disabled={isMozo && !!mesaParam}
                            onClick={() => setSelectedTableNum(mesa.numero)}
                            className={`py-2.5 px-4 rounded-xl border-2 transition-all font-bold text-sm ${selectedTableNum === mesa.numero
                              ? 'border-brand bg-brand text-white'
                              : 'border-peach bg-white text-brand/70 hover:border-brand/40'
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
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">Método de pago</p>
                      <div className={`grid gap-2 ${local.linkPago ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {([
                          ['Efectivo', '💵 Efectivo'],
                          ...(local.linkPago ? [['Tarjeta BAC', '💳 Tarjeta']] : []),
                        ] as [PaymentMethod, string][]).map(([metodo, label]) => (
                          <button
                            key={metodo}
                            onClick={() => setPaymentMethod(metodo)}
                            className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-bold text-[11px] uppercase tracking-widest ${paymentMethod === metodo
                              ? 'bg-brand/5 border-brand text-brand'
                              : 'bg-white border-peach text-gray-500 hover:border-brand/40'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 bg-cream border-t border-peach shrink-0">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-brand tracking-tight leading-none">{formatPrice(total())}</span>
              </div>
              <button
                disabled={placingOrder || items.length === 0}
                onClick={handlePlaceOrder}
                className={`w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 ${placingOrder || items.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/30 active:scale-95'
                  }`}
              >
                {placingOrder ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <>Confirmar pedido <ArrowRight size={18} /></>
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
