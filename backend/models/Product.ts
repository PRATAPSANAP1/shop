import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  productName: string;
  category: string;
  price: number;
  quantity: number;
  expiryDate?: Date;
  rackId: mongoose.Schema.Types.ObjectId;
  shopId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  qrCode?: string;
  shelfNumber: number;
  columnNumber: number;
  minStockLevel: number;
  size?: string;
  weight?: string;
  color?: string;
  brand?: string;
  totalRevenue: number;
}

const productSchema: Schema = new Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date },
  rackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rack', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  qrCode: { type: String, unique: true },
  shelfNumber: { type: Number, default: 1 },
  columnNumber: { type: Number, default: 1 },
  minStockLevel: { type: Number, default: 10 },
  size: { type: String },
  weight: { type: String },
  color: { type: String },
  brand: { type: String },
  totalRevenue: { type: Number, default: 0 }
});

export default mongoose.model<IProduct>('Product', productSchema);
