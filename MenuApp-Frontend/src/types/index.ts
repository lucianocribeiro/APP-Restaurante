// Domain entity types shared across the frontend

export interface Kitchen {
  id: number;
  nombre: string;
  localId: number;
}

export interface Table {
  id: number;
  numero: string;
  localId: number;
}

export interface Product {
  id: number;
  categoryId: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen?: string;
  activo: boolean;
  stock: number;
  kitchenId?: number;
  categoria?: { nombre: string };
  kitchen?: Kitchen;
}

export interface Category {
  id: number;
  localId: number;
  nombre: string;
  orden: number;
  productos: Product[];
}

export interface Local {
  id: number;
  nombre: string;
  logo?: string;
  slug: string;
  cbuAlias?: string;
  linkPago?: string;
  horarioApertura?: string;
  horarioCierre?: string;
  categorias: Category[];
  mesas: Table[];
}

export interface LocalSettings {
  nombre: string;
  logo?: string;
  slug: string;
  cbuAlias?: string;
  linkPago?: string;
}

export interface User {
  id: number;
  email: string;
  rol: string;
  local?: Local;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  cantidad: number;
  precioUnitario: number;
  aclaracion?: string;
  producto: { nombre: string; precio: number; imagen?: string };
}

export interface Order {
  id: number;
  localId: number;
  mesa: string;
  estado: string;
  total: number;
  metodoPago: string;
  tipoOrden?: string;
  pagoConfirmado: boolean;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  aclaracion?: string;
  imagen?: string;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta BAC';
