import dotenv from 'dotenv';
const result = dotenv.config();
if (result.error) {
  console.warn('Warning: .env file not found or could not be loaded');
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';

import authRoutes from './routes/auth';
import rackRoutes from './routes/racks';
import productRoutes from './routes/products';
import dashboardRoutes from './routes/dashboard';
import publicRoutes from './routes/public';
import notificationRoutes from './routes/notifications';
import shopConfigRoutes from './routes/shopConfig';
import doorRoutes from './routes/doors';
import shopRoutes from './routes/shop';
import smartstoreRoutes from './routes/smartstore';

const app = express();

connectDB();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(o => origin.startsWith(o)) || 
                     origin.endsWith('.vercel.app') ||
                     origin.includes('pratap-sanaps-projects.vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/products', productRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/shop-config', shopConfigRoutes);
app.use('/api/doors', doorRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/smartstore', smartstoreRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
