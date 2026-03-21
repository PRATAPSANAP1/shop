import { Request, Response } from 'express';
import Rack from '../models/Rack';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createRack = async (req: AuthRequest, res: Response) => {
  try {
    const { rackName, positionX, positionY, positionZ, rotation, width, height, shelves, columns, rackType, orientation, color } = req.body;
    const rack = new Rack({ rackName, positionX, positionY, positionZ, rotation, width, height, shopId: req.userId, shelves, columns, rackType, orientation, color });
    await rack.save();
    res.status(201).json(rack);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRack = async (req: Request, res: Response) => {
  try {
    const rack = await Rack.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(rack);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRacks = async (req: AuthRequest, res: Response) => {
  try {
    const racks = await Rack.find({ shopId: req.userId });
    
    const racksWithStatus = await Promise.all(racks.map(async (rack: any) => {
      const products = await Product.find({ rackId: rack._id });
      
      let status = 'normal';
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const hasLowStock = products.some((p: any) => p.quantity < 10);
      const hasExpiringSoon = products.some((p: any) => p.expiryDate && new Date(p.expiryDate) <= sevenDaysLater);
      
      if (hasLowStock) status = 'lowStock';
      if (hasExpiringSoon) status = 'expiring';
      
      return { ...rack.toObject(), status };
    }));
    
    res.json(racksWithStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRack = async (req: Request, res: Response) => {
  try {
    await Rack.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rack deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
