import express, { Request, Response } from 'express';
const router = express.Router();
import Product from '../models/Product';
import Rack from '../models/Rack';
import Shop from '../models/Shop';
import User from '../models/User';

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query, shopName } = req.query;
    let filter: any = { productName: { $regex: query, $options: 'i' } };
    
    if (shopName) {
      const user = await User.findOne({ shopName: { $regex: new RegExp(`^${shopName}$`, 'i') } });
      if (user) {
        const racks = await Rack.find({ shopId: user._id });
        filter.rackId = { $in: racks.map((r: any) => r._id) };
      }
    }
    
    const products = await Product.find(filter).populate('rackId');
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/all', async (req: Request, res: Response) => {
  try {
    const products = await Product.find().populate('rackId');
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/racks/:shopName', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ shopName: { $regex: new RegExp(`^${req.params.shopName}$`, 'i') } });
    if (!user) return res.status(404).json({ error: 'Shop not found' });
    
    const racks = await Rack.find({ shopId: user._id });
    res.json(racks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/racks', async (req: Request, res: Response) => {
  try {
    const racks = await Rack.find();
    res.json(racks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/rack/:rackId', async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ rackId: req.params.rackId });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/shop', async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne();
    res.json(shop || { roomWidth: 20, roomDepth: 20, roomHeight: 3 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
