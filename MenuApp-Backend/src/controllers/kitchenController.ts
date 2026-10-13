import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getKitchens = async (req: Request, res: Response) => {
  const localId = req.user?.localId;
  
  if (!localId) {
    return res.status(400).json({ message: 'Local ID is required' });
  }

  try {
    const kitchens = await prisma.kitchen.findMany({
      where: { localId: localId },
      orderBy: { nombre: 'asc' }
    });
    res.json(kitchens);
  } catch (err) {
    console.error('Error fetching kitchens:', err);
    res.status(500).json({ message: 'Error fetching kitchens', error: err });
  }
};

export const createKitchen = async (req: Request, res: Response) => {
  const localId = req.user?.localId;
  const { nombre } = req.body;

  if (!localId || !nombre) {
    return res.status(400).json({ message: 'Local ID and Name are required' });
  }

  try {
    const kitchen = await prisma.kitchen.create({
      data: { localId: localId, nombre }
    });
    res.json(kitchen);
  } catch (err) {
    console.error('Error creating kitchen:', err);
    res.status(500).json({ message: 'Error creating kitchen', error: err });
  }
};

export const deleteKitchen = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.kitchen.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Kitchen deleted' });
  } catch (err) {
    console.error('Error deleting kitchen:', err);
    res.status(500).json({ message: 'Error deleting kitchen. Make sure it has no products.', error: err });
  }
};
