import { Request, Response } from 'express';
import Product from '../models/Product';
import Notification from '../models/Notification';
import crypto from 'crypto';
import { sendNotification } from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productName, category, price, quantity, expiryDate, rackId, shelfNumber, columnNumber, minStockLevel } = req.body;
    const qrCode = crypto.randomBytes(16).toString('hex');
    const product = new Product({ productName, category, price, quantity, expiryDate, rackId, shopId: req.userId, qrCode, shelfNumber, columnNumber, minStockLevel });
    await product.save();
    
    if (quantity < (minStockLevel || 10)) {
      await sendNotification(req.userId as string, product._id.toString(), 'lowStock', `${productName} is low on stock (${quantity} left)`);
    }
    
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find({ shopId: req.userId }).populate('rackId');
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsByRack = async (req: AuthRequest, res: Response) => {
  try {
    const products = await Product.find({ rackId: req.params.rackId, shopId: req.userId });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (product && product.quantity < product.minStockLevel) {
      await sendNotification(req.userId as string, product._id.toString(), 'lowStock', `${product.productName} is low on stock (${product.quantity} left)`);
    }
    
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const scanProduct = async (req: Request, res: Response) => {
  try {
    const { qrCode, quantityTaken } = req.body;
    const product = await Product.findOne({ qrCode });
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    product.quantity -= quantityTaken;
    product.totalRevenue = (product.totalRevenue || 0) + (product.price * quantityTaken);
    await product.save();
    
    if (product.quantity < product.minStockLevel) {
      await sendNotification(product.shopId.toString(), product._id.toString(), 'lowStock', `${product.productName} is low on stock (${product.quantity} left)`);
    }
    
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
