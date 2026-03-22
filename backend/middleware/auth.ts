import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  userId?: string;
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const authFactory = (optional = false) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.shop_token;

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
    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    user.token = newToken;
    await user.save();
    res.cookie('shop_token', newToken, COOKIE_OPTS);
    req.userId = String(user._id);
    next();
  } catch (error) {
    if (optional) return next();
    res.status(401).json({ error: 'Invalid token' });
  }
};

const auth: any = authFactory(false);
auth.optional = authFactory(true);

export default auth;
