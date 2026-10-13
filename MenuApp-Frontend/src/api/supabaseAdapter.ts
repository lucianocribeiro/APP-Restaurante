import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase';
import { nextOrderCode, orderCodePrefix } from '../lib/orderCode';
import { ENTREPANES_LOCAL } from '../data/entrepanes';

const reply = (config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse => {
  if (status >= 400) {
    const error: any = new Error(`Supabase API ${status}`);
    error.response = { data, status, statusText: '', headers: {}, config };
    error.config = config;
    throw error;
  }
  return { data, status, statusText: 'OK', headers: {}, config };
};

export const supabaseAdapter: AxiosAdapter = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').replace(/^\/api/, '').split('?')[0];
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data || {};
  let m: RegExpMatchArray | null;

  try {
    // 1. Auth Login
    if (method === 'post' && url === '/auth/login') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      const { data: user, error } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return reply(config, { message: 'Credenciales inválidas' }, 401);
      }

      let valid = false;
      try {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          valid = bcrypt.compareSync(password, user.password);
        } else {
          valid = user.password === password;
        }
      } catch {
        valid = user.password === password;
      }

      if (!valid) {
        return reply(config, { message: 'Credenciales inválidas' }, 401);
      }

      return reply(config, {
        token: `sb_token_${user.id}_${Date.now()}`,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre || (user.rol === 'mozo' ? 'Mozo' : 'Caja'),
          rol: user.rol,
          local: {
            id: ENTREPANES_LOCAL.id,
            nombre: ENTREPANES_LOCAL.nombre,
            slug: ENTREPANES_LOCAL.slug,
            logo: ENTREPANES_LOCAL.logo,
          },
        },
      });
    }

    // 2. Menu data for public customer
    if (method === 'get' && (m = url.match(/^\/menu\/([^/]+)$/))) {
      const slug = m[1];
      const { data: localData } = await supabase.from('Local').select('*').eq('slug', slug).single();
      const { data: tables } = await supabase.from('Table').select('*').order('id', { ascending: true });
      const { data: categories } = await supabase.from('Category').select('*').order('orden', { ascending: true });
      const { data: products } = await supabase.from('Product').select('*').eq('activo', true);

      const local = localData || ENTREPANES_LOCAL;
      const cats = (categories || ENTREPANES_LOCAL.categorias).map((cat) => ({
        ...cat,
        productos: (products || []).filter((p) => p.categoryId === cat.id),
      }));

      return reply(config, {
        ...local,
        linkPago: local.linkPago || local.mercadoPagoLink || ENTREPANES_LOCAL.linkPago,
        mesas: tables && tables.length > 0 ? tables : ENTREPANES_LOCAL.mesas,
        categorias: cats,
      });
    }

    // 3. Create Order
    if (method === 'post' && url === '/orders') {
      const tipoOrden = body.tipoOrden ?? 'salon';
      const mesa = String(body.mesa || '1');

      // Fetch existing codes to compute sequence
      const { data: recentOrders } = await supabase
        .from('Order')
        .select('codigo')
        .order('id', { ascending: false })
        .limit(200);

      const existingCodes = (recentOrders || []).map((o) => o.codigo);
      const codigo = nextOrderCode(orderCodePrefix(tipoOrden, mesa), existingCodes);

      const { data: order, error: orderErr } = await supabase
        .from('Order')
        .insert({
          localId: body.localId || 1,
          codigo,
          mesa,
          estado: 'Recibido',
          total: body.total,
          metodoPago: body.metodoPago,
          tipoOrden,
          pagoConfirmado: false,
        })
        .select()
        .single();

      if (orderErr || !order) {
        return reply(config, { message: 'Error al crear el pedido', detail: orderErr }, 500);
      }

      // Insert OrderItems
      if (body.items && body.items.length > 0) {
        const orderItems = body.items.map((i: any) => ({
          orderId: order.id,
          productId: i.productId,
          cantidad: i.cantidad,
          precioUnitario: i.precioUnitario,
          aclaracion: i.aclaracion || null,
        }));
        await supabase.from('OrderItem').insert(orderItems);
      }

      // Return full order with items and product details
      const { data: fullOrder } = await supabase
        .from('Order')
        .select('*, items:OrderItem(*, producto:Product(*))')
        .eq('id', order.id)
        .single();

      return reply(config, fullOrder || order, 201);
    }

    // 4. Get Single Order
    if (method === 'get' && (m = url.match(/^\/orders\/(\d+)$/))) {
      const orderId = Number(m[1]);
      const { data: order, error } = await supabase
        .from('Order')
        .select('*, items:OrderItem(*, producto:Product(*))')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        return reply(config, { message: 'Orden no encontrada' }, 404);
      }

      const { data: local } = await supabase.from('Local').select('linkPago, mercadoPagoLink').eq('id', order.localId || 1).single();
      const linkPago = local?.linkPago || local?.mercadoPagoLink || ENTREPANES_LOCAL.linkPago;

      return reply(config, {
        ...order,
        linkPago,
        items: (order.items || []).map((i: any) => ({
          ...i,
          producto: {
            nombre: i.producto?.nombre || 'Producto',
          },
        })),
      });
    }

    // 5. Admin/Mozo: Get all active orders
    if (method === 'get' && url === '/admin/orders') {
      const { data: orders, error } = await supabase
        .from('Order')
        .select('*, items:OrderItem(*, producto:Product(*))')
        .order('id', { ascending: false });

      if (error) {
        return reply(config, { message: 'Error fetching orders' }, 500);
      }

      return reply(config, orders || []);
    }

    // 6. Admin/Mozo: Update order status or payment
    if (method === 'put' && (m = url.match(/^\/admin\/orders\/(\d+)\/(status|payment)$/))) {
      const orderId = Number(m[1]);
      const field = m[2];

      const updateData: any = {};
      if (field === 'status') {
        updateData.estado = body.estado;
      } else {
        updateData.pagoConfirmado = Boolean(body.pagoConfirmado);
      }

      const { data: updated, error } = await supabase
        .from('Order')
        .update(updateData)
        .eq('id', orderId)
        .select('*, items:OrderItem(*, producto:Product(*))')
        .single();

      if (error || !updated) {
        return reply(config, { message: 'Error updating order' }, 500);
      }

      return reply(config, updated);
    }

    // 7. Categories
    if (method === 'get' && url === '/admin/categories') {
      const { data: cats } = await supabase
        .from('Category')
        .select('*')
        .order('orden', { ascending: true });
      return reply(config, cats || []);
    }

    // 8. Products
    if (method === 'get' && url === '/admin/products') {
      const { data: prods } = await supabase
        .from('Product')
        .select('*, categoria:Category(*), kitchen:Kitchen(*)')
        .order('nombre', { ascending: true });
      return reply(config, prods || []);
    }

    if (method === 'post' && url === '/admin/products') {
      const { data: prod, error } = await supabase
        .from('Product')
        .insert({
          nombre: body.nombre,
          descripcion: body.descripcion || null,
          precio: parseFloat(body.precio) || 0,
          imagen: body.imagen || null,
          categoryId: parseInt(body.categoryId),
          kitchenId: body.kitchenId ? parseInt(body.kitchenId) : null,
          activo: true,
          stock: parseInt(body.stock) || 20,
        })
        .select()
        .single();

      if (error) return reply(config, { message: 'Error creating product' }, 500);
      return reply(config, prod, 201);
    }

    if (method === 'put' && (m = url.match(/^\/admin\/products\/(\d+)\/stock$/))) {
      const prodId = Number(m[1]);
      const { data: updated, error } = await supabase
        .from('Product')
        .update({ stock: parseInt(body.stock) || 0 })
        .eq('id', prodId)
        .select()
        .single();

      if (error) return reply(config, { message: 'Error updating stock' }, 500);
      return reply(config, updated);
    }

    // 9. Kitchens
    if (url === '/admin/kitchens') {
      if (method === 'post') {
        const { data: k, error } = await supabase
          .from('Kitchen')
          .insert({ nombre: body.nombre, localId: 1 })
          .select()
          .single();
        if (error) return reply(config, { message: 'Error creating kitchen' }, 500);
        return reply(config, k, 201);
      }
      const { data: kitchens } = await supabase.from('Kitchen').select('*');
      return reply(config, kitchens || []);
    }

    if (method === 'delete' && (m = url.match(/^\/admin\/kitchens\/(\d+)$/))) {
      const kId = Number(m[1]);
      await supabase.from('Kitchen').delete().eq('id', kId);
      return reply(config, { ok: true });
    }

    // 10. Tables
    if (url === '/admin/tables') {
      if (method === 'post') {
        const { data: table, error } = await supabase
          .from('Table')
          .insert({ numero: String(body.numero), localId: 1 })
          .select()
          .single();
        if (error) return reply(config, { message: 'Error creating table' }, 500);
        return reply(config, table, 201);
      }
      const { data: tables } = await supabase.from('Table').select('*').order('id', { ascending: true });
      return reply(config, tables || []);
    }

    if (method === 'delete' && (m = url.match(/^\/admin\/tables\/(\d+)$/))) {
      const tId = Number(m[1]);
      await supabase.from('Table').delete().eq('id', tId);
      return reply(config, { ok: true });
    }

    // 11. Users
    if (url === '/admin/users') {
      if (method === 'post') {
        const email = String(body.email || '').trim().toLowerCase();
        const rawPass = String(body.password || '');
        if (!email || !rawPass) {
          return reply(config, { message: 'Email y contraseña son obligatorios' }, 400);
        }
        const hashedPassword = bcrypt.hashSync(rawPass, 10);
        const { data: newUser, error } = await supabase
          .from('User')
          .insert({
            nombre: String(body.nombre || '').trim(),
            email,
            password: hashedPassword,
            rol: body.rol === 'owner' ? 'owner' : 'mozo',
            localId: 1,
          })
          .select('id, email, nombre, rol, localId, createdAt')
          .single();

        if (error) return reply(config, { message: 'Error al crear usuario o email ya existe' }, 409);
        return reply(config, newUser, 201);
      }
      const { data: users } = await supabase.from('User').select('id, email, nombre, rol, localId, createdAt');
      return reply(config, users || []);
    }

    if (method === 'delete' && (m = url.match(/^\/admin\/users\/(\d+)$/))) {
      const uId = Number(m[1]);
      const { data: allUsers } = await supabase.from('User').select('id, rol');
      const owners = (allUsers || []).filter((u) => u.rol === 'owner');
      const target = (allUsers || []).find((u) => u.id === uId);

      if (target?.rol === 'owner' && owners.length <= 1) {
        return reply(config, { message: 'Debe quedar al menos un usuario de Caja/Admin' }, 400);
      }

      await supabase.from('User').delete().eq('id', uId);
      return reply(config, { ok: true });
    }

    // 12. Local Settings
    if (url === '/admin/local') {
      if (method === 'put') {
        await supabase
          .from('Local')
          .update({
            nombre: body.nombre,
            logo: body.logo,
            cbuAlias: body.cbuAlias,
            linkPago: body.linkPago,
            mercadoPagoLink: body.linkPago,
          })
          .eq('id', 1);
      }
      const { data: local } = await supabase.from('Local').select('*').eq('id', 1).single();
      return reply(config, local || ENTREPANES_LOCAL);
    }

    return reply(config, { message: 'Ruta no encontrada', path: url }, 404);
  } catch (err: any) {
    return reply(config, { message: err?.message || 'Error en Supabase Adapter' }, 500);
  }
};
