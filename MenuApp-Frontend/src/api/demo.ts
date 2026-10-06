import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ENTREPANES_LOCAL } from '../data/entrepanes';

// Demo mode (no backend): answers the API from data stored in this browser.
// Orders placed from the menu show up in Caja and Mozo on the same device.

const STORAGE_KEY = 'entrepanes-demo-db';
const BARRA_CATEGORIAS = ['Bebidas calientes', 'Infusiones y té', 'Bebidas frías'];

type DemoOrderItem = {
  id: number;
  productId: number;
  cantidad: number;
  precioUnitario: number;
  aclaracion: string | null;
};

type DemoOrder = {
  id: number;
  localId: number;
  mesa: string;
  estado: string;
  total: number;
  metodoPago: string;
  tipoOrden: string;
  pagoConfirmado: boolean;
  createdAt: string;
  items: DemoOrderItem[];
};

type DemoDb = {
  nextId: number;
  orders: DemoOrder[];
  tables: { id: number; numero: string; localId: number }[];
  kitchens: { id: number; nombre: string; localId: number }[];
  stock: Record<number, number>;
  extraProducts: any[];
  settings: { nombre: string; logo: string; slug: string; cbuAlias: string; linkPago: string };
};

const baseProducts = () =>
  ENTREPANES_LOCAL.categorias.flatMap((cat) =>
    cat.productos.map((p) => ({
      ...p,
      categoryId: cat.id,
      kitchenId: BARRA_CATEGORIAS.includes(cat.nombre) ? 2 : 1,
      activo: true,
    }))
  );

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const createDb = (): DemoDb => {
  const products = baseProducts();
  const pick = (nombre: string) => products.find((p) => p.nombre === nombre) ?? products[0];
  let itemId = 1;
  const order = (
    id: number, mesa: string, estado: string, metodoPago: string, mins: number,
    lines: [string, number][], pagoConfirmado = false
  ): DemoOrder => {
    const items = lines.map(([nombre, cantidad]) => {
      const p = pick(nombre);
      return { id: itemId++, productId: p.id, cantidad, precioUnitario: p.precio, aclaracion: null };
    });
    return {
      id, localId: ENTREPANES_LOCAL.id, mesa, estado, metodoPago, pagoConfirmado,
      tipoOrden: mesa === 'Retirar' ? 'retirar' : 'salon',
      total: Math.round(items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0) * 100) / 100,
      createdAt: minutesAgo(mins),
      items,
    };
  };

  return {
    nextId: 105,
    orders: [
      order(104, '2', 'Recibido', 'Efectivo', 3, [['Desayuno Criollo', 2], ['Latte o Cappuccino 12 oz', 2]]),
      order(103, '5', 'Preparando', 'Tarjeta BAC', 12, [['Hamburguesa clásica', 1], ['Tequeños (6 unidades)', 1]]),
      order(102, 'Retirar', 'Listo', 'Efectivo', 20, [['Pabellón criollo', 1]]),
      order(101, '7', 'Entregado', 'Tarjeta BAC', 35, [['Pancakes', 1], ['Infusión fría', 2]], true),
    ],
    tables: ENTREPANES_LOCAL.mesas.map((m) => ({ id: m.id, numero: m.numero, localId: ENTREPANES_LOCAL.id })),
    kitchens: [
      { id: 1, nombre: 'Cocina', localId: ENTREPANES_LOCAL.id },
      { id: 2, nombre: 'Barra', localId: ENTREPANES_LOCAL.id },
    ],
    stock: Object.fromEntries(products.map((p) => [p.id, 20])),
    extraProducts: [],
    settings: {
      nombre: ENTREPANES_LOCAL.nombre,
      logo: ENTREPANES_LOCAL.logo,
      slug: ENTREPANES_LOCAL.slug,
      cbuAlias: '',
      linkPago: ENTREPANES_LOCAL.linkPago,
    },
  };
};

const load = (): DemoDb => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupt demo data: start over
  }
  const db = createDb();
  save(db);
  return db;
};

const save = (db: DemoDb) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

const allProducts = (db: DemoDb) => {
  const categorias = ENTREPANES_LOCAL.categorias;
  return [...baseProducts(), ...db.extraProducts].map((p) => ({
    ...p,
    stock: db.stock[p.id] ?? 0,
    categoria: categorias.find((c) => c.id === p.categoryId) ?? null,
    kitchen: db.kitchens.find((k) => k.id === p.kitchenId) ?? null,
  }));
};

const withProducts = (db: DemoDb, order: DemoOrder) => {
  const products = allProducts(db);
  return {
    ...order,
    items: order.items.map((i) => ({ ...i, orderId: order.id, producto: products.find((p) => p.id === i.productId) })),
  };
};

const reply = (config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse => {
  if (status >= 400) {
    const error: any = new Error(`Demo API ${status}`);
    error.response = { data, status, statusText: '', headers: {}, config };
    error.config = config;
    throw error;
  }
  return { data, status, statusText: 'OK', headers: {}, config };
};

export const demoAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').replace(/^\/api/, '').split('?')[0];
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data || {};
  const db = load();
  let m: RegExpMatchArray | null;

  if (method === 'post' && url === '/auth/login') {
    const email = String(body.email || 'caja@entrepanes.com');
    return reply(config, { token: 'demo', user: demoUser(email.includes('mozo') ? 'mozo' : 'owner', email) });
  }

  if (method === 'get' && (m = url.match(/^\/menu\/([^/]+)$/))) {
    if (m[1] !== ENTREPANES_LOCAL.slug) return reply(config, { message: 'Local not found' }, 404);
    return reply(config, { ...ENTREPANES_LOCAL, ...db.settings, mesas: db.tables });
  }

  if (method === 'post' && url === '/orders') {
    const order: DemoOrder = {
      id: db.nextId++,
      localId: ENTREPANES_LOCAL.id,
      mesa: body.mesa,
      estado: 'Recibido',
      total: body.total,
      metodoPago: body.metodoPago,
      tipoOrden: body.tipoOrden ?? 'salon',
      pagoConfirmado: false,
      createdAt: new Date().toISOString(),
      items: (body.items || []).map((i: any, idx: number) => ({
        id: Date.now() + idx,
        productId: i.productId,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        aclaracion: i.aclaracion || null,
      })),
    };
    db.orders.unshift(order);
    save(db);
    return reply(config, withProducts(db, order), 201);
  }

  if (method === 'get' && (m = url.match(/^\/orders\/(\d+)$/))) {
    const order = db.orders.find((o) => o.id === Number(m![1]));
    if (!order) return reply(config, { message: 'Order not found' }, 404);
    const full = withProducts(db, order);
    return reply(config, {
      ...full,
      linkPago: db.settings.linkPago,
      items: full.items.map((i) => ({ cantidad: i.cantidad, precioUnitario: i.precioUnitario, producto: { nombre: i.producto?.nombre } })),
    });
  }

  if (method === 'get' && url === '/admin/orders') {
    return reply(config, db.orders.map((o) => withProducts(db, o)));
  }

  if (method === 'put' && (m = url.match(/^\/admin\/orders\/(\d+)\/(status|payment)$/))) {
    const order = db.orders.find((o) => o.id === Number(m![1]));
    if (!order) return reply(config, { message: 'Order not found' }, 404);
    if (m[2] === 'status') order.estado = body.estado;
    else order.pagoConfirmado = Boolean(body.pagoConfirmado);
    save(db);
    return reply(config, withProducts(db, order));
  }

  if (method === 'get' && url === '/admin/categories') {
    return reply(config, ENTREPANES_LOCAL.categorias.map(({ id, nombre, orden }) => ({ id, nombre, orden, localId: ENTREPANES_LOCAL.id })));
  }

  if (method === 'get' && url === '/admin/products') {
    return reply(config, allProducts(db).sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  if (method === 'post' && url === '/admin/products') {
    const product = {
      id: Date.now(),
      nombre: body.nombre,
      descripcion: body.descripcion,
      precio: parseFloat(body.precio) || 0,
      imagen: body.imagen,
      categoryId: parseInt(body.categoryId),
      kitchenId: body.kitchenId ? parseInt(body.kitchenId) : null,
      activo: true,
    };
    db.extraProducts.push(product);
    db.stock[product.id] = parseInt(body.stock) || 0;
    save(db);
    return reply(config, product);
  }

  if (method === 'put' && (m = url.match(/^\/admin\/products\/(\d+)\/stock$/))) {
    db.stock[Number(m[1])] = parseInt(body.stock) || 0;
    save(db);
    return reply(config, { id: Number(m[1]), stock: db.stock[Number(m[1])] });
  }

  if (url === '/admin/kitchens') {
    if (method === 'post') {
      const kitchen = { id: Date.now(), nombre: body.nombre, localId: ENTREPANES_LOCAL.id };
      db.kitchens.push(kitchen);
      save(db);
      return reply(config, kitchen);
    }
    return reply(config, db.kitchens);
  }

  if (method === 'delete' && (m = url.match(/^\/admin\/kitchens\/(\d+)$/))) {
    db.kitchens = db.kitchens.filter((k) => k.id !== Number(m![1]));
    save(db);
    return reply(config, { ok: true });
  }

  if (url === '/admin/tables') {
    if (method === 'post') {
      const table = { id: Date.now(), numero: String(body.numero), localId: ENTREPANES_LOCAL.id };
      db.tables.push(table);
      save(db);
      return reply(config, table);
    }
    return reply(config, db.tables);
  }

  if (method === 'delete' && (m = url.match(/^\/admin\/tables\/(\d+)$/))) {
    db.tables = db.tables.filter((t) => t.id !== Number(m![1]));
    save(db);
    return reply(config, { ok: true });
  }

  if (url === '/admin/local') {
    if (method === 'put') {
      db.settings = { ...db.settings, ...body };
      save(db);
    }
    return reply(config, db.settings);
  }

  return reply(config, { message: 'API route not found', path: url }, 404);
};

export const demoUser = (rol: 'owner' | 'mozo', email = rol === 'mozo' ? 'mozo@entrepanes.com' : 'caja@entrepanes.com') => ({
  id: rol === 'mozo' ? 2 : 1,
  email,
  rol,
  local: { id: ENTREPANES_LOCAL.id, nombre: ENTREPANES_LOCAL.nombre, slug: ENTREPANES_LOCAL.slug, logo: ENTREPANES_LOCAL.logo },
});
