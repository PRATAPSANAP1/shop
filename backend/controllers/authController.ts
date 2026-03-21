import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const COOKIE_NAME = 'shop_token';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const sendOTP = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.mobile) return res.status(400).json({ error: 'Please set your mobile number in your Profile first before changing your password.' });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log(`[OTP SIMULATION] Sent OTP ${otp} to ${user.mobile}`);
    res.json({ message: `OTP sent successfully to your mobile number ${user.mobile} (Simulated OTP: ${otp})` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, shopName, mobile } = req.body;
    
    if (!email || !password || !name || !shopName || !mobile) {
      return res.status(400).json({ error: 'All fields are required including mobile number' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, shopName, mobile });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    user.token = token;
    await user.save();

    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    res.status(201).json({ userId: user._id, shopName: user.shopName, mobile: user.mobile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    user.token = token;
    await user.save();

    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    res.json({ userId: user._id, shopName: user.shopName });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.userId, { token: null });
    res.clearCookie(COOKIE_NAME);
    res.json({ message: 'Logged out' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password -token -otp -otpExpires');
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password -token -otp -otpExpires');
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { shopName, email, password, otp, mobile } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (shopName) user.shopName = shopName;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    if (password) {
      if (!otp) return res.status(400).json({ error: 'OTP is required to change password' });
      
      if (!user.otp || !user.otpExpires || user.otpExpires < new Date()) {
        return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
      }

      if (user.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      user.password = await bcrypt.hash(password, 10);
      user.otp = undefined;
      user.otpExpires = undefined;
    }

    await user.save();
    const updatedUser = await User.findById(req.userId).select('-password -token -otp -otpExpires');
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
