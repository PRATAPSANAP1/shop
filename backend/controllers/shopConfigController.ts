import { Request, Response } from 'express';
import ShopConfig from '../models/ShopConfig';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const saveShopConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { width, depth } = req.body;
    let config = await ShopConfig.findOne({ shopId: req.userId });
    
    if (config) {
      config.width = width;
      config.depth = depth;
      await config.save();
    } else {
      config = new ShopConfig({ shopId: req.userId, width, depth });
      await config.save();
    }
    
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getShopConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await ShopConfig.findOne({ shopId: req.userId });
    res.json(config || { width: 20, depth: 20 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listPublicShops = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({ shopName: { $exists: true, $ne: '' } }, 'shopName -_id');
    res.json(users.map((u) => u.shopName));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicShopConfig = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ shopName: { $regex: new RegExp(`^${req.params.shopName}$`, 'i') } });
    if (!user) return res.status(404).json({ error: 'Shop not found' });
    
    const config = await ShopConfig.findOne({ shopId: user._id });
    res.json({ config: config || { width: 20, depth: 20 }, shopId: user._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
