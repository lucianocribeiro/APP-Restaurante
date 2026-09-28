import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChefHat, Utensils, ArrowLeft, RotateCcw, Star, Sparkles, CreditCard } from 'lucide-react';
import api from '../api/axios';
import { getSocket } from '../lib/socket';
import { formatPrice } from '../lib/format';

const OrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();

      const socket = getSocket();

      const onStatusUpdated = (updatedOrder: any) => {
        if (updatedOrder.id.toString() === orderId.toString()) {
          setOrder((prev: any) => ({ ...prev, ...updatedOrder, linkPago: prev?.linkPago }));
        }
      };
      const onPaymentUpdated = (updatedOrder: any) => {
        if (updatedOrder.id.toString() === orderId.toString()) {
          setOrder((prev: any) => ({ ...prev, ...updatedOrder, linkPago: prev?.linkPago }));
        }
      };

      socket.on('orderStatusUpdated', onStatusUpdated);
      socket.on('orderPaymentUpdated', onPaymentUpdated);

      return () => {
        socket.off('orderStatusUpdated', onStatusUpdated);
        socket.off('orderPaymentUpdated', onPaymentUpdated);
      };
    }
  }, [orderId]);

  const getStatusDisplay = (estado: string) => {
    switch (estado) {
      case 'Recibido': return { 
        icon: <RotateCcw className="animate-spin-slow" />, 
        text: 'Pedido Recibido', 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/10',
        desc: 'Estamos procesando tu orden.' 
      };
      case 'Preparando': return { 
        icon: <ChefHat className="animate-bounce-subtle" />, 
        text: 'En Cocina', 
        color: 'text-orange-400', 
        bg: 'bg-orange-500/10',
        desc: 'Nuestros chefs están manos a la obra.' 
      };
      case 'Listo': return { 
        icon: <Sparkles className="animate-pulse" />, 
        text: '¡Listo!', 
        color: 'text-green-400', 
        bg: 'bg-green-500/10',
        desc: 'Tu pedido está listo para ser servido.' 
      };
      case 'Entregado': return { 
        icon: <CheckCircle />, 
        text: 'Entregado', 
        color: 'text-gray-400', 
        bg: 'bg-gray-500/10',
        desc: '¡Que disfrutes tu comida!' 
      };
      default: return { 
        icon: <Clock />, 
        text: 'Pendiente', 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/10',
        desc: 'Esperando confirmación.' 
      };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080B10] flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
      <p className="font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Sincronizando Orden...</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[#080B10] p-8 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
        <Utensils size={40} />
      </div>
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">No encontramos tu pedido</h2>
      <p className="text-gray-500 mb-10 font-medium">Verificá que el enlace sea correcto.</p>
      <button 
        onClick={() => navigate('/')}
        className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
      >
        <ArrowLeft size={16} className="inline mr-2" /> Volver al Inicio
      </button>
    </div>
  );

  const status = getStatusDisplay(order.estado);

  return (
    <div className="min-h-screen bg-[#080B10] dot-grid text-gray-100 p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl mx-auto relative z-10 animate-fade-up">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-90"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black uppercase italic tracking-widest leading-none mb-1">Estado de <span className="text-primary">Pedido</span></h1>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Orden #{order.id.toString().slice(-4)}</p>
          </div>
          <div className="w-12 h-12"></div> {/* Spacer */}
        </div>

        {/* Main Status Card */}
        <div className="glass-dark border border-white/8 rounded-[3.5rem] p-10 sm:p-14 text-center mb-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
           {/* Subtle glow behind icon */}
           <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${status.bg} blur-[60px] rounded-full opacity-50`}></div>

           <div className={`w-32 h-32 ${status.bg} ${status.color} rounded-[2.5rem] flex items-center justify-center mb-10 mx-auto border border-white/5 relative z-10 shadow-2xl`}>
             {React.cloneElement(status.icon as React.ReactElement<{ size?: number; strokeWidth?: number }>, { size: 64, strokeWidth: 1.5 })}
           </div>

           <h2 className={`text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none ${status.color}`}>
             {status.text}
           </h2>
           <p className="text-gray-400 text-lg font-medium max-w-xs mx-auto leading-relaxed">
             {status.desc}
           </p>

           {/* Progress simulation (UI only) */}
           <div className="mt-12 max-w-sm mx-auto">
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out`}
                  style={{ 
                    width: order.estado === 'Listo' || order.estado === 'Entregado' ? '100%' : 
                           order.estado === 'Preparando' ? '65%' : '20%' 
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 italic">
                <span>Recibido</span>
                <span>Cocinando</span>
                <span>¡Listo!</span>
              </div>
           </div>
        </div>

        {/* Order Details */}
        <div className="glass border border-white/5 rounded-[3rem] p-10 sm:p-12 mb-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Star className="text-primary" size={20} fill="currentColor" />
            </div>
            <h3 className="text-xl font-black uppercase italic text-white tracking-tight">Detalle de tu orden</h3>
          </div>

          <div className="space-y-6">
            {order.items && order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-black text-primary border border-white/5">
                    {item.cantidad}x
                  </span>
                  <span className="font-bold text-gray-200 uppercase tracking-tight group-hover:text-white transition-colors">{item.producto.nombre}</span>
                </div>
                <span className="font-black text-gray-400">{formatPrice(item.precioUnitario * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-10 border-t border-white/5 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Mesa {order.mesa}</p>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{order.metodoPago}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Total</p>
              <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{formatPrice(order.total)}</p>
            </div>
          </div>

          {order.metodoPago === 'Tarjeta BAC' && (
            order.pagoConfirmado ? (
              <div className="mt-8 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-black text-xs uppercase tracking-widest">
                <CheckCircle size={16} /> Pago confirmado
              </div>
            ) : order.linkPago && (
              <a
                href={order.linkPago}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full bg-gradient-to-r from-primary to-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 transition-all"
              >
                <CreditCard size={18} /> Pagar {formatPrice(order.total)} con tarjeta
              </a>
            )
          )}
        </div>

        {/* Footer info */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">
            <Clock size={12} className="text-primary" /> El estado se actualiza automáticamente
          </div>
          <p className="text-gray-600 text-[11px] font-bold uppercase tracking-[0.2em]">
            © 2026 MenuApp · Buen provecho
          </p>
        </div>

      </div>
    </div>
  );
};

export default OrderStatus;
