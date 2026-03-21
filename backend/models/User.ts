import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  shopName: string;
  mobile: string;
  otp?: string;
  otpExpires?: Date;
  token?: string;
  createdAt: Date;
}

const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shopName: { type: String, required: true },
  mobile: { type: String, default: '' },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  token: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema);
