import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
}

const authFactory = (optional = false) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.shop_token;
  
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    if (optional) return next();
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      if (optional) return next();
      return res.status(401).json({ error: 'User not found' });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (optional) return next();
    res.status(401).json({ error: 'Invalid token' });
  }
};

const auth: any = authFactory(false);
auth.optional = authFactory(true);

export default auth;
