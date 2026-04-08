import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  shopId: mongoose.Schema.Types.ObjectId;
  productId?: mongoose.Schema.Types.ObjectId;
  type: 'lowStock' | 'expiring' | 'outOfStock';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema: Schema = new Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: { type: String, enum: ['lowStock', 'expiring', 'outOfStock'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INotification>('Notification', notificationSchema);
