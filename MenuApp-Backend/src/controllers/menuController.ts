import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { emitSafe } from '../lib/socket';

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { producto: true }
        },
        local: {
          select: { linkPago: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      id: order.id,
      mesa: order.mesa,
      estado: order.estado,
      pagoConfirmado: order.pagoConfirmado,
      total: order.total,
      metodoPago: order.metodoPago,
      tipoOrden: order.tipoOrden,
      createdAt: order.createdAt,
      linkPago: order.local.linkPago,
      items: order.items.map((item) => ({
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        producto: { nombre: item.producto.nombre }
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMenuBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;

  try {
    const local = await prisma.local.findUnique({
      where: { slug },
      include: {
        categorias: {
          orderBy: { orden: 'asc' },
          include: {
            productos: {
              where: { activo: true }
            }
          }
        },
        mesas: true
      }
    });

    if (!local) {
      return res.status(404).json({ message: 'Local not found' });
    }

    res.json(local);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  const { localId, mesa, metodoPago, items, total, tipoOrden } = req.body;

  console.log('Order request:', { localId, mesa, metodoPago, total, tipoOrden, items });

  try {
    // Verify local exists
    const local = await prisma.local.findUnique({ where: { id: localId } });
    if (!local) {
      return res.status(400).json({ message: 'Local not found', localId });
    }

    // Verify products exist
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(400).json({ message: 'Product not found', productId: item.productId });
      }
    }

    const order = await prisma.order.create({
      data: {
        localId,
        mesa,
        metodoPago,
        total,
        tipoOrden: tipoOrden ?? 'salon',
        estado: 'Recibido',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            aclaracion: item.aclaracion
          }))
        }
      },
      include: { 
        items: {
          include: { producto: true }
        }
      }
    });

    emitSafe('newOrder', order);

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
};
