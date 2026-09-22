import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN || ''
});

export const createPreference = async (req: Request, res: Response) => {
  const { items, localId, orderId } = req.body;

  if (!MP_ACCESS_TOKEN) {
    return res.status(500).json({ message: 'Payment provider not configured' });
  }

  try {
    const local = await prisma.local.findUnique({ where: { id: localId } });
    if (!local) {
      return res.status(404).json({ message: 'Local not found' });
    }

    const payload = {
      items: items.map((item: any) => ({
        title: item.nombre,
        unit_price: Number(item.precioUnitario),
        quantity: Number(item.cantidad),
        currency_id: 'ARS'
      })),
      back_urls: {
        success: `${BASE_URL}/success`,
        failure: `${BASE_URL}/failure`,
        pending: `${BASE_URL}/pending`
      },
      auto_return: 'approved',
      external_reference: orderId ? String(orderId) : `local_${localId}`
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: 'Error creating payment preference',
        error: data
      });
    }

    res.json({
      preferenceId: data.id,
      initPoint: data.init_point
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error in payment controller',
      error: error.message
    });
  }
};

export const webhook = async (req: Request, res: Response) => {
  const { type, data } = req.body;

  try {
    if (type === 'payment' && data?.id) {
      const paymentId = data.id;
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: String(paymentId) });

      if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
        const orderId = parseInt(paymentInfo.external_reference, 10);
        if (!isNaN(orderId)) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              pagoConfirmado: true,
              estado: 'Recibido'
            }
          });
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ message: 'Webhook error', error: error.message });
  }
};
