import { Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find({ shopId: req.userId });
    
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p: any) => sum + (p.totalRevenue || 0), 0);
    
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringSoon = products.filter((p: any) => p.expiryDate && new Date(p.expiryDate) <= sevenDaysLater).length;
    
    const lowStock = products.filter((p: any) => p.quantity < 10).length;
    
    const monthlyData: any = {};
    products.forEach((p: any) => {
      const month = p.createdAt.toISOString().slice(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    res.json({ totalProducts, totalValue: totalRevenue, expiringSoon, lowStock, monthlyData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
