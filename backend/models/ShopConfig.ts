import mongoose, { Schema, Document } from 'mongoose';

export interface IShopConfig extends Document {
  shopId: mongoose.Schema.Types.ObjectId;
  width: number;
  depth: number;
}

const shopConfigSchema: Schema = new Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  width: { type: Number, default: 20 },
  depth: { type: Number, default: 20 }
});

export default mongoose.model<IShopConfig>('ShopConfig', shopConfigSchema);
