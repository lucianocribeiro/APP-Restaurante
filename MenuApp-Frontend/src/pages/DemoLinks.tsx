import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, LayoutDashboard, ArrowRight, Sparkles, Star, Zap, ClipboardList } from 'lucide-react';

const DemoLinks: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080B10] dot-grid flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative">

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-hero-glow absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,77,28,0.22) 0%, transparent 70%)' }} />
        <div className="animate-hero-glow absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,159,67,0.04) 0%, transparent 60%)' }} />
      </div>

      {/* Floating decorative icons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
        <Star className="absolute top-[12%] left-[8%] text-amber-400 animate-float" size={18} style={{ animationDelay: '0s' }} />
        <Zap  className="absolute top-[20%] right-[10%] text-orange-400 animate-float" size={14} style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute bottom-[18%] left-[12%] text-blue-400 animate-float" size={16} style={{ animationDelay: '1.5s' }} />
        <Star className="absolute bottom-[25%] right-[8%] text-primary animate-float" size={20} style={{ animationDelay: '0.5s' }} />
      </div>

      {/* Hero text */}
      <div className="relative z-10 text-center mb-14 animate-fade-up" style={{ animationDelay: '0ms' }}>
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass border border-white/10 text-[11px] font-black uppercase tracking-[0.18em] text-orange-400 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400" />
          </span>
          Demo Experience
        </div>

        <h1 className="text-5xl sm:text-8xl font-black italic tracking-tighter uppercase leading-none mb-6">
          <span className="text-white">Menu</span>
          <span className="gradient-text">App</span>
        </h1>
        <p className="text-gray-400 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed">
          Menú digital con pedidos en tiempo real.<br />
          <span className="text-gray-300 font-semibold">Elegí cómo querés explorar la app.</span>
        </p>
      </div>

      {/* Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">

        {/* Card Cliente */}
        <div
          onClick={() => navigate('/m/entrepanes')}
          className="group relative glass rounded-[2rem] p-8 sm:p-10 cursor-pointer border border-white/8 overflow-hidden transition-all duration-500
            hover:border-orange-500/40 hover:shadow-[0_30px_80px_rgba(255,77,28,0.18)] hover:scale-[1.025]
            animate-card-in"
          style={{ animationDelay: '100ms' }}
        >
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              style={{ background: 'linear-gradient(135deg, rgba(255,77,28,0.25), rgba(255,159,67,0.15))', border: '1px solid rgba(255,77,28,0.3)' }}>
              <ChefHat className="text-orange-400" size={30} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mb-3 flex items-center gap-3">
              Vista Cliente
              <ArrowRight className="text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1.5 transition-all duration-300" size={22} />
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed text-sm flex-grow mb-8">
              Explorá el menú digital de <span className="text-orange-300 font-semibold">Entrepanes</span>. Agregá productos al carrito y realizá tu pedido en segundos.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {['Entradas', 'Burgers', 'Bebidas'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/10 border border-orange-500/20 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300">
                <ArrowRight className="text-orange-400 group-hover:text-white transition-colors" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Card Admin */}
        <div
          onClick={() => navigate('/admin/login')}
          className="group relative glass rounded-[2rem] p-8 sm:p-10 cursor-pointer border border-white/8 overflow-hidden transition-all duration-500
            hover:border-blue-500/40 hover:shadow-[0_30px_80px_rgba(59,130,246,0.15)] hover:scale-[1.025]
            animate-card-in"
          style={{ animationDelay: '220ms' }}
        >
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15))', border: '1px solid rgba(59,130,246,0.3)' }}>
              <LayoutDashboard className="text-blue-400" size={30} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mb-3 flex items-center gap-3">
              Panel Admin
              <ArrowRight className="text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1.5 transition-all duration-300" size={22} />
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed text-sm flex-grow mb-8">
              Gestioná pedidos, stock y mesas en <span className="text-blue-300 font-semibold">tiempo real</span>. Dashboard completo con notificaciones instantáneas.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {['Pedidos', 'Stock', 'Mesas'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all duration-300">
                <ArrowRight className="text-blue-400 group-hover:text-white transition-colors" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Card Mozo */}
        <div
          onClick={() => navigate('/admin/login')}
          className="group relative glass rounded-[2rem] p-8 sm:p-10 cursor-pointer border border-white/8 overflow-hidden transition-all duration-500
            hover:border-green-500/40 hover:shadow-[0_30px_80px_rgba(34,197,94,0.15)] hover:scale-[1.025]
            animate-card-in"
          style={{ animationDelay: '340ms' }}
        >
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" />
          {/* Top accent line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.15))', border: '1px solid rgba(34,197,94,0.3)' }}>
              <ClipboardList className="text-green-400" size={30} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight mb-3 flex items-center gap-3">
              Vista Mozo
              <ArrowRight className="text-gray-500 group-hover:text-green-400 group-hover:translate-x-1.5 transition-all duration-300" size={22} />
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed text-sm flex-grow mb-8">
              Visualizá mesas, pedidos activos y tomá <span className="text-green-300 font-semibold">nuevos pedidos</span> rápidamente desde el panel de salón.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {['Salón', 'Pedidos', 'Mesas'].map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-500 border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10 border border-green-500/20 group-hover:bg-green-500 group-hover:border-green-500 transition-all duration-300">
                <ArrowRight className="text-green-400 group-hover:text-white transition-colors" size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-16 text-center animate-fade-up" style={{ animationDelay: '400ms' }}>
        <p className="text-gray-600 text-[11px] font-bold uppercase tracking-[0.2em]">
          © 2026 MenuApp · Hecho para restaurantes modernos
        </p>
      </div>
    </div>
  );
};

export default DemoLinks;
