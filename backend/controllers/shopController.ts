import { Response } from 'express';
import Shop from '../models/Shop';
import { AuthRequest } from '../middleware/auth';

export const createShop = async (req: AuthRequest, res: Response) => {
  try {
    const { roomWidth, roomDepth, roomHeight, walls } = req.body;
    const shop = new Shop({ 
      shopId: req.userId, 
      roomWidth, 
      roomDepth, 
      roomHeight, 
      walls 
    });
    await shop.save();
    res.status(201).json(shop);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateShop = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findOneAndUpdate(
      { shopId: req.userId }, 
      req.body, 
      { new: true, upsert: true }
    );
    res.json(shop);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getShop = async (req: AuthRequest, res: Response) => {
  try {
    const shop = await Shop.findOne({ shopId: req.userId });
    res.json(shop);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};