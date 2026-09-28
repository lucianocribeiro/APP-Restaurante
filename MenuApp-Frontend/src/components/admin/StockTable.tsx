import { Search, Plus, Minus, Utensils } from 'lucide-react';
import type { Product, Kitchen } from '../../types';
import { formatPrice } from '../../lib/format';

interface StockTableProps {
  products: Product[];
  kitchens: Kitchen[];
  searchTerm: string;
  selectedKitchen: string;
  onSearchChange: (v: string) => void;
  onKitchenFilterChange: (v: string) => void;
  onUpdateStock: (productId: number, newStock: number) => Promise<void>;
  onNewProduct: () => void;
  onManageKitchens: () => void;
  showToast: (msg: string, tone?: 'success' | 'error') => void;
}

export const StockTable = ({
  products,
  kitchens,
  searchTerm,
  selectedKitchen,
  onSearchChange,
  onKitchenFilterChange,
  onUpdateStock,
  onNewProduct,
  onManageKitchens,
  showToast,
}: StockTableProps) => {
  const handleStock = async (productId: number, newStock: number) => {
    try {
      await onUpdateStock(productId, newStock);
    } catch {
      showToast('Error al actualizar stock');
    }
  };

  const filteredProducts = products
    .filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((p) => {
      if (selectedKitchen === 'all') return true;
      if (selectedKitchen === 'none') return !p.kitchenId;
      return p.kitchenId?.toString() === selectedKitchen;
    });

  return (
    <div className="max-w-6xl">
      <div className="bg-gray-900 border border-white/5 p-6 rounded-[2rem] shadow-xl mb-10 flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar producto por nombre..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-primary/50 transition-all font-bold"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedKitchen}
            onChange={(e) => onKitchenFilterChange(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all min-w-[150px]"
          >
            <option value="all">Todas las Cocinas</option>
            <option value="none">Sin Cocina / General</option>
            {kitchens.map((k) => <option key={k.id} value={k.id.toString()}>{k.nombre}</option>)}
          </select>
          <button
            onClick={onManageKitchens}
            className="bg-white/5 hover:bg-white/10 text-gray-400 p-4 rounded-xl transition-all border border-white/5"
            title="Gestionar Cocinas"
          >
            <Utensils size={20} />
          </button>
        </div>
        <button
          onClick={onNewProduct}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/20 flex items-center gap-3 shrink-0"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
        {(() => {
          const general = products.filter((p) => !p.kitchenId);
          const totalStock = general.reduce((s, p) => s + p.stock, 0);
          const alerts = general.filter((p) => p.stock <= 5).length;
          return (
            <div className="bg-gray-900 border border-white/5 p-6 rounded-3xl shadow-xl hover:border-primary/20 transition-all">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">General / Sin Cocina</p>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-white">{totalStock} <span className="text-[10px] text-gray-500 uppercase">uds.</span></h3>
                  <p className="text-[10px] font-bold text-gray-500">{general.length} productos</p>
                </div>
                {alerts > 0 && <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse">{alerts} alertas</div>}
              </div>
            </div>
          );
        })()}
        {kitchens.map((k) => {
          const kp = products.filter((p) => p.kitchenId === k.id);
          const total = kp.reduce((s, p) => s + p.stock, 0);
          const alerts = kp.filter((p) => p.stock <= 5).length;
          return (
            <div key={k.id} className="bg-gray-900 border border-white/5 p-6 rounded-3xl shadow-xl hover:border-primary/20 transition-all">
              <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-1">{k.nombre}</p>
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-white">{total} <span className="text-[10px] text-gray-500 uppercase">uds.</span></h3>
                  <p className="text-[10px] font-bold text-gray-500">{kp.length} productos</p>
                </div>
                {alerts > 0 && <div className="bg-red-500/10 text-red-500 px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse">{alerts} alertas</div>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40">
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Producto</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Categoría</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Cocina</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Stock</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-800 border border-white/5 overflow-hidden">
                      <img
                        src={product.imagen || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop&q=60'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        alt={product.nombre}
                      />
                    </div>
                    <div>
                      <p className="font-black text-white italic uppercase tracking-tighter">{product.nombre}</p>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{formatPrice(product.precio)}</p>
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
                    <button onClick={() => handleStock(product.id, product.stock - 1)} className="w-10 h-10 bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/10 rounded-xl flex items-center justify-center transition-all active:scale-90">
                      <Minus size={18} />
                    </button>
                    <button onClick={() => handleStock(product.id, product.stock + 1)} className="w-10 h-10 bg-white/5 hover:bg-primary/10 hover:text-primary border border-white/10 rounded-xl flex items-center justify-center transition-all active:scale-90">
                      <Plus size={18} />
                    </button>
                    <input
                      type="number"
                      className="w-16 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-center text-white focus:outline-none focus:border-primary/50 font-bold"
                      defaultValue={product.stock}
                      onBlur={(e) => handleStock(product.id, parseInt(e.target.value))}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-gray-600 font-bold italic uppercase tracking-widest text-sm">
                  Cargando inventario...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
