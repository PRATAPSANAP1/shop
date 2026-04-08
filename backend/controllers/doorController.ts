import { Request, Response } from 'express';
import Door from '../models/Door';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createDoor = async (req: AuthRequest, res: Response) => {
  try {
    const { doorType, positionX, positionZ, rotation, width, height } = req.body;
    const door = new Door({ shopId: req.userId, doorType, positionX, positionZ, rotation, width, height });
    await door.save();
    res.status(201).json(door);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDoors = async (req: AuthRequest, res: Response) => {
  try {
    const doors = await Door.find({ shopId: req.userId });
    res.json(doors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDoor = async (req: Request, res: Response) => {
  try {
    await Door.findByIdAndDelete(req.params.id);
    res.json({ message: 'Door deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicDoors = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ shopName: { $regex: new RegExp(`^${req.params.shopName}$`, 'i') } });
    if (!user) return res.status(404).json({ error: 'Shop not found' });
    
    const doors = await Door.find({ shopId: user._id });
    res.json(doors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
