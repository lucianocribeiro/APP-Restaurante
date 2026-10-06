import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardList, Wallet, ArrowRight } from 'lucide-react';
import { ENTREPANES_LOCAL } from '../data/entrepanes';

const VISTAS = [
  {
    to: `/m/${ENTREPANES_LOCAL.slug}`,
    titulo: 'Menú del cliente',
    descripcion: 'Lo que ve el cliente al escanear el QR: menú completo, carrito y pedido.',
    icon: BookOpen,
  },
  {
    to: '/mozo',
    titulo: 'Vista del mozo',
    descripcion: 'Mesas del salón, pedidos activos y toma de pedidos en la mesa.',
    icon: ClipboardList,
  },
  {
    to: '/caja',
    titulo: 'Vista de caja',
    descripcion: 'Pedidos en curso, cobros, cierre de mesas, stock y configuración.',
    icon: Wallet,
  },
];

const DemoLinks: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-cream flex flex-col items-center justify-center px-5 py-10 text-gray-800">
    <div className="text-center mb-10">
      <img src={ENTREPANES_LOCAL.logo} alt={ENTREPANES_LOCAL.nombre} className="w-28 h-28 object-contain mx-auto" />
      <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight text-brand leading-none">
        {ENTREPANES_LOCAL.nombre}
      </h1>
      <p className="mt-1 text-brand/80 font-semibold">{ENTREPANES_LOCAL.subtitulo}</p>
      <p className="mt-4 text-gray-500 font-medium">Elige qué vista quieres ver</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
      {VISTAS.map(({ to, titulo, descripcion, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="group bg-white rounded-3xl border border-peach shadow-sm hover:shadow-lg hover:border-brand/40 transition-all p-6 flex flex-col"
        >
          <div className="w-14 h-14 rounded-2xl bg-peach/60 text-brand flex items-center justify-center mb-5 group-hover:bg-brand group-hover:text-white transition-colors">
            <Icon size={26} />
          </div>
          <h2 className="text-xl font-black text-brand mb-2">{titulo}</h2>
          <p className="text-sm text-gray-500 leading-relaxed flex-grow">{descripcion}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand">
            Entrar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>
      ))}
    </div>

    <p className="mt-10 text-xs text-gray-400 font-medium text-center max-w-md">
      Versión de muestra: los pedidos de ejemplo y los que hagas se guardan solo en este dispositivo.
    </p>
  </div>
);

export default DemoLinks;
