import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Helper: look up the real localId from DB using the user email stored in the token.
// Email is stable across DB re-seeds; numeric IDs can change.
async function getRealLocalId(req: Request): Promise<number | null> {
  const tokenUser = (req as any).user;
  const user = await prisma.user.findUnique({
    where: { email: tokenUser.email },
    select: { localId: true }
  });
  return user?.localId ?? null;
}

export const getTables = async (req: Request, res: Response) => {
  try {
    const localId = await getRealLocalId(req);
    if (!localId) return res.status(404).json({ message: 'Local not found for this user' });
    const tables = await prisma.table.findMany({
      where: { localId },
      orderBy: { numero: 'asc' }
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tables' });
  }
};

export const createTable = async (req: Request, res: Response) => {
  const { numero } = req.body;
  try {
    const localId = await getRealLocalId(req);
    if (!localId) return res.status(404).json({ message: 'Local not found for this user' });
    const table = await prisma.table.create({
      data: { numero, localId }
    });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error creating table' });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.table.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting table' });
  }
};
