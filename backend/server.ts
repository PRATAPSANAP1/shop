import dotenv from 'dotenv';
dotenv.config();
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

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
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
