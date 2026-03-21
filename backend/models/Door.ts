import mongoose, { Schema, Document } from 'mongoose';

export interface IDoor extends Document {
  shopId: mongoose.Schema.Types.ObjectId;
  doorType: 'entry' | 'exit';
  positionX: number;
  positionZ: number;
  rotation: number;
  width: number;
  height: number;
}

const doorSchema: Schema = new Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doorType: { type: String, enum: ['entry', 'exit'], required: true },
  positionX: { type: Number, required: true },
  positionZ: { type: Number, required: true },
  rotation: { type: Number, default: 0 },
  width: { type: Number, default: 1.5 },
  height: { type: Number, default: 2.5 }
});

export default mongoose.model<IDoor>('Door', doorSchema);
