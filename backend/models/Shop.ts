import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
  shopId: mongoose.Schema.Types.ObjectId;
  roomWidth: number;
  roomDepth: number;
  roomHeight: number;
  walls: Array<{
    id: string;
    position: number[];
    args: number[];
    movable: boolean;
  }>;
  entryPosition: string;
  exitPosition: string;
}

const shopSchema: Schema = new Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomWidth: { type: Number, default: 10 },
  roomDepth: { type: Number, default: 10 },
  roomHeight: { type: Number, default: 3 },
  walls: [{
    id: String,
    position: [Number],
    args: [Number],
    movable: { type: Boolean, default: true }
  }],
  entryPosition: { type: String, default: 'front' },
  exitPosition: { type: String, default: 'back' }
});

export default mongoose.model<IShop>('Shop', shopSchema);
