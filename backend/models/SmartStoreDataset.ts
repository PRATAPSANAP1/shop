import mongoose, { Schema, Document } from 'mongoose';

export interface ISmartStoreDataset extends Document {
  shopId: mongoose.Schema.Types.ObjectId;
  zoneTraffic: Array<{ zone: string; visitors: number; avgTime: number }>;
  trafficOverTime: Array<{ time: string; visitors: number }>;
  dwellTimes: Array<{ zone: string; avg_dwell_time_seconds: number }>;
  rackPerformance: Array<{ rack: string; sales: number; restocks: number; lowStockAlerts: number }>;
  categorySales: Array<{ name: string; value: number }>;
  zoneRadar: Array<{ zone: string; traffic: number; dwell: number; sales: number }>;
  movementMatrix: Map<string, string>;
  aiInsights: Array<{ type: string; icon: string; title: string; desc: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const smartStoreDatasetSchema = new Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  zoneTraffic: [{ zone: String, visitors: Number, avgTime: Number }],
  trafficOverTime: [{ time: String, visitors: Number }],
  dwellTimes: [{ zone: String, avg_dwell_time_seconds: Number }],
  rackPerformance: [{ rack: String, sales: Number, restocks: Number, lowStockAlerts: Number }],
  categorySales: [{ name: String, value: Number }],
  zoneRadar: [{ zone: String, traffic: Number, dwell: Number, sales: Number }],
  movementMatrix: { type: Map, of: String },
  aiInsights: [{ type: { type: String }, icon: String, title: String, desc: String }],
}, { timestamps: true });

export default mongoose.model<ISmartStoreDataset>('SmartStoreDataset', smartStoreDatasetSchema);
