// Order code shown to customers and staff: S1-001 (salón, mesa 1), R-001 (retirar), D-001 (delivery).
// The sequence is counted per prefix, so each table and each order type has its own numbering.

export const orderCodePrefix = (tipoOrden: string | undefined, mesa: string) => {
  if (tipoOrden === 'retirar' || mesa === 'Retirar') return 'R';
  if (tipoOrden === 'delivery' || mesa === 'Delivery') return 'D';
  return `S${mesa.toUpperCase().replace(/\s+/g, '')}`;
};

export const nextOrderCode = (prefix: string, existingCodes: (string | undefined)[]) => {
  const last = existingCodes.reduce((max, code) => {
    if (!code?.startsWith(`${prefix}-`)) return max;
    return Math.max(max, Number(code.slice(prefix.length + 1)) || 0);
  }, 0);
  return `${prefix}-${String(last + 1).padStart(3, '0')}`;
};

// Orders from a backend that does not send `codigo` yet fall back to their numeric id.
export const orderNumber = (order: { id: number; codigo?: string | null }) =>
  order.codigo || String(order.id);
