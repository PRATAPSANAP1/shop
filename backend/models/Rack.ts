import mongoose, { Schema, Document } from 'mongoose';

export interface IRack extends Document {
  rackName: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  rotation: number;
  width: number;
  height: number;
  shopId: mongoose.Schema.Types.ObjectId;
  shelves: number;
  columns: number;
  rackType: string;
  orientation: 'horizontal' | 'vertical';
  color: string;
}

const rackSchema: Schema = new Schema({
  rackName: { type: String, required: true },
  positionX: { type: Number, required: true },
  positionY: { type: Number, required: true },
  positionZ: { type: Number, required: true },
  rotation: { type: Number, default: 0 },
  width: { type: Number, required: true, default: 2 },
  height: { type: Number, required: true, default: 3 },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shelves: { type: Number, default: 4 },
  columns: { type: Number, default: 3 },
  rackType: { type: String, default: 'standard' },
  orientation: { type: String, enum: ['horizontal', 'vertical'], default: 'vertical' },
  color: { type: String, default: '#4CAF50' }
});

export default mongoose.model<IRack>('Rack', rackSchema);
