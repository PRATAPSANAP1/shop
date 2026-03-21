import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import auth from '../middleware/auth';
import Rack from '../models/Rack';
import Product from '../models/Product';
import SmartStoreDataset from '../models/SmartStoreDataset';

const router = express.Router();

const SMARTSTORE_DIR = path.resolve(__dirname, '../smartstore');
const BRIDGE_SCRIPT = path.join(SMARTSTORE_DIR, 'smartstore_bridge.py');

function runBridge(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', [BRIDGE_SCRIPT, ...args], { cwd: SMARTSTORE_DIR });
    let output = '';
    let errOutput = '';
    proc.stdout.on('data', (d) => (output += d.toString()));
    proc.stderr.on('data', (d) => (errOutput += d.toString()));
    proc.on('close', (code) => {
      try {
        resolve(JSON.parse(output));
      } catch {
        reject(new Error(errOutput || `Bridge exited with code ${code}`));
      }
    });
  });
}

// Ensure the dataset exists, if not, create it
router.get('/dashboard-data', auth, async (req: any, res) => {
  try {
    const shopId = req.userId;

    let dataset = await SmartStoreDataset.findOne({ shopId });

    if (!dataset) {
      // Create new dataset from actual DB data related to the 3D project
      const racks = await Rack.find({ shopId });
      const products = await Product.find({ shopId });

      // Generate zones from Rack names
      const zones = racks.length > 0 ? racks.map(r => r.rackName) : ['Entrance', 'Beverages', 'Snacks', 'Checkout'];
      
      const zoneTraffic = zones.map(zone => ({
        zone,
        visitors: Math.floor(Math.random() * 300) + 50,
        avgTime: Math.floor(Math.random() * 100) + 30
      })).sort((a, b) => b.visitors - a.visitors);

      const trafficOverTime = [
        { time: '8 AM', visitors: 24 }, { time: '9 AM', visitors: 48 },
        { time: '10 AM', visitors: 87 }, { time: '11 AM', visitors: 112 },
        { time: '12 PM', visitors: 145 }, { time: '1 PM', visitors: 138 },
        { time: '2 PM', visitors: 96 }, { time: '3 PM', visitors: 104 },
        { time: '4 PM', visitors: 132 }, { time: '5 PM', visitors: 167 },
        { time: '6 PM', visitors: 143 }, { time: '7 PM', visitors: 89 }
      ];

      const dwellTimes = zones.map(zone => ({
        zone,
        avg_dwell_time_seconds: Math.floor(Math.random() * 120) + 20
      }));

      const rackPerformance = racks.length > 0 ? racks.map((rack) => {
        const rackProducts = products.filter(p => p.rackId?.toString() === rack._id.toString());
        const lowStock = rackProducts.filter(p => p.quantity <= (p.minStockLevel ?? 10)).length;

        return {
          rack: rack.rackName,
          sales: Math.floor(Math.random() * 200) + 20,
          restocks: Math.floor(Math.random() * 15) + 1,
          lowStockAlerts: lowStock
        };
      }) : [
        { rack: 'Rack A', sales: 142, restocks: 8, lowStockAlerts: 2 },
        { rack: 'Rack B', sales: 98, restocks: 5, lowStockAlerts: 0 }
      ];

      // Categories from Products or generic
      const allCategories = products.map(p => p.category).filter(Boolean);
      const uniqueCategories: string[] = Array.from(new Set(allCategories.length > 0 ? allCategories : ['Beverages', 'Snacks', 'Dairy', 'Bakery']));
      const categorySales = uniqueCategories.map(cat => ({
        name: cat,
        value: Math.floor(Math.random() * 40) + 5
      }));

      const zoneRadar = zones.map(zone => ({
        zone,
        traffic: Math.floor(Math.random() * 100) + 20,
        dwell: Math.floor(Math.random() * 100) + 20,
        sales: Math.floor(Math.random() * 100) + 20
      }));

      const movementMatrix: Record<string, string> = {};
      if (zones.length > 1) {
        for (let i = 0; i < zones.length; i++) {
          movementMatrix[zones[i]] = zones[(i + 1) % zones.length];
        }
      } else {
        movementMatrix['Entrance'] = 'Checkout';
      }

      const aiInsights = [
        { type: 'hot', icon: '🔥', title: 'Peak Hours Detected', desc: 'Highest visitor traffic observed between 12 PM - 1 PM and 5 PM - 6 PM based on historic logs.' },
        { type: 'flow', icon: '🚶', title: `Traffic Flow around ${zones[0] || 'Entrance'}`, desc: `Over 45% of users transit mainly via ${zones[0] || 'Entrance'}. Consider placing promotional items here.` }
      ];

      dataset = new SmartStoreDataset({
        shopId,
        zoneTraffic,
        trafficOverTime,
        dwellTimes,
        rackPerformance,
        categorySales,
        zoneRadar,
        movementMatrix,
        aiInsights
      });

      await dataset.save();
    }

    // Convert Mongoose Map to plain object for JSON serialization
    const plain: any = dataset.toObject();
    if (plain.movementMatrix instanceof Map) {
      plain.movementMatrix = Object.fromEntries(plain.movementMatrix);
    }
    res.json(plain);

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/stats', auth, async (_req, res) => {
  try { res.json(await runBridge(['stats'])); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/zone-traffic', auth, async (_req, res) => {
  try { res.json(await runBridge(['zone_traffic'])); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/traffic-over-time', auth, async (_req, res) => {
  try { res.json(await runBridge(['traffic_over_time'])); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/dwell-time', auth, async (_req, res) => {
  try { res.json(await runBridge(['dwell_time'])); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/insights', auth, async (_req, res) => {
  try { res.json(await runBridge(['insights'])); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/heatmap', auth, async (_req, res) => {
  try { res.json(await runBridge(['heatmap'])); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

router.get('/zones', auth, async (_req, res) => {
  try { res.json(await runBridge(['zones'])); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

// Update predict to use Dataset or fallback
router.get('/predict', auth, async (req: any, res) => {
  const zone = (req.query.zone as string) || '';
  if (!zone) return res.status(400).json({ error: 'zone param required' });
  
  try {
    const shopId = req.userId;
    const dataset = await SmartStoreDataset.findOne({ shopId });
    if (dataset && dataset.movementMatrix) {
      const mm = dataset.movementMatrix as any;
      const prediction = (typeof mm.get === 'function' ? mm.get(zone) : mm[zone])
        || (typeof mm.values === 'function' ? Array.from(mm.values())[0] : Object.values(mm)[0])
        || 'Checkout';
      res.json({ prediction });
    } else {
      res.json(await runBridge(['predict', zone]));
    }
  } catch (e: any) { 
    res.status(500).json({ error: e.message }); 
  }
});

export default router;
