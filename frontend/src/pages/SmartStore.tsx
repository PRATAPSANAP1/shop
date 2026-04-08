// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Clock, Map, Zap, PieChart as PieChartIcon, BarChart as BarChartIcon, RefreshCw, ShoppingCart, Eye, Star, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { getSmartStoreDashboardData } from '../services/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const StatCard = ({ label, value, icon: Icon, color, sub }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="glass-panel"
    style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '18px' }}
  >
    <div style={{ background: `${color}20`, padding: '14px', borderRadius: '14px', flexShrink: 0 }}>
      <Icon color={color} size={26} />
    </div>
    <div>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{label}</p>
      <h3 style={{ fontSize: '22px', margin: '3px 0 0 0', fontWeight: '800', color: 'white' }}>{value}</h3>
      {sub && <p style={{ fontSize: '11px', color: color, margin: '2px 0 0 0' }}>{sub}</p>}
    </div>
  </motion.div>
);

const SectionTitle = ({ icon: Icon, color, title }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
    <Icon size={20} color={color} />
    <h3 style={{ margin: 0, color: 'white', fontSize: '16px', fontWeight: '700' }}>{title}</h3>
  </div>
);

const SmartStore: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedZone, setSelectedZone] = useState('Entrance');
  const [prediction, setPrediction] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let _mounted = true;
    setLoading(true);
    getSmartStoreDashboardData().then((res) => {
      if (_mounted) {
        setData(res.data);
        if (res.data?.movementMatrix) {
          const firstZone = Object.keys(res.data.movementMatrix)[0];
          if (firstZone) setSelectedZone(firstZone);
        }
        setLoading(false);
      }
    }).catch(() => {
      if (_mounted) setLoading(false);
    });
    return () => { _mounted = false; };
  }, [refreshKey]);

  const handlePredict = () => {
    setPredicting(true);
    setPrediction('');
    setTimeout(() => {
      if (data && data.movementMatrix) {
        setPrediction(data.movementMatrix[selectedZone] || 'Checkout');
      } else {
        setPrediction('Checkout');
      }
      setPredicting(false);
    }, 900);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#818cf8', gap: '16px' }}>
        <Loader2 size={48} className="animate-spin" />
        <h3 style={{ margin: 0, color: 'white' }}>Generating AI Analytics Dataset...</h3>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        <h2>Failed to load generated AI Dataset.</h2>
        <button onClick={() => setRefreshKey(k => k + 1)}>Retry</button>
      </div>
    );
  }

  const ZONE_TRAFFIC = data.zoneTraffic || [];
  const TRAFFIC_OVER_TIME = data.trafficOverTime || [];
  const DWELL_TIMES = data.dwellTimes || [];
  const RACK_PERFORMANCE = data.rackPerformance || [];
  const CATEGORY_SALES = data.categorySales || [];
  const ZONE_RADAR = data.zoneRadar || [];
  const AI_INSIGHTS = data.aiInsights || [];
  const ZONES = data.movementMatrix ? Object.keys(data.movementMatrix) : [];

  const totalVisitors = ZONE_TRAFFIC.reduce((s: number, z: any) => s + z.visitors, 0);
  const avgDwell = DWELL_TIMES.length ? Math.round(DWELL_TIMES.reduce((s: number, z: any) => s + z.avg_dwell_time_seconds, 0) / DWELL_TIMES.length) : 0;
  const busiestZone = ZONE_TRAFFIC.length > 0 ? ZONE_TRAFFIC[0].zone : 'N/A';
  const coldZone = ZONE_TRAFFIC.length > 0 ? ZONE_TRAFFIC[ZONE_TRAFFIC.length - 1].zone : 'N/A';

  return (
    <div style={{ padding: isMobile ? '15px' : '30px', width: '100%', margin: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', margin: 0 }}>SmartStore AI Analytics</h1>
          <p style={{ color: '#94a3b8', fontSize: isMobile ? '12px' : '14px', marginTop: '6px' }}>Real-time insights from your shop data</p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', color: '#818cf8', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
        >
          Refresh
        </button>
      </div>

      <div key={refreshKey} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '150px' : '220px'}, 1fr))`, gap: '16px' }}>
          <StatCard label="Total Visitors Today" value={totalVisitors} icon={Users} color="#6366f1" sub="+12% vs yesterday" />
          <StatCard label="Avg Products/Rack" value={`${avgDwell}s`} icon={Clock} color="#ec4899" sub="dwell proxy" />
          <StatCard label="Busiest Zone" value={busiestZone} icon={TrendingUp} color="#f59e0b" sub={ZONE_TRAFFIC[0] ? `${ZONE_TRAFFIC[0].visitors} visitors` : ''} />
          <StatCard label="Coldest Zone" value={coldZone} icon={Map} color="#06b6d4" sub="needs attention" />
          <StatCard label="Total Revenue (₹)" value={`₹${RACK_PERFORMANCE.reduce((s: number, r: any) => s + r.sales, 0).toLocaleString('en-IN')}`} icon={ShoppingCart} color="#22c55e" sub="from QR scans" />
          <StatCard label="Low Stock Alerts" value={RACK_PERFORMANCE.reduce((s: number, r: any) => s + r.lowStockAlerts, 0)} icon={AlertTriangle} color="#f43f5e" sub="action required" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={BarChartIcon} color="#818cf8" title="Visitor Traffic by Zone" />
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ZONE_TRAFFIC} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="zone" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey="visitors" radius={[4, 4, 0, 0]}>
                    {ZONE_TRAFFIC.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={TrendingUp} color="#22c55e" title="Hourly Traffic Trend" />
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TRAFFIC_OVER_TIME} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                  <Area type="monotone" dataKey="visitors" stroke="#22c55e" strokeWidth={2} fill="url(#trafficGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={Clock} color="#ec4899" title="Avg Dwell Time per Zone (seconds)" />
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DWELL_TIMES} innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="avg_dwell_time_seconds" nameKey="zone">
                    {DWELL_TIMES.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} formatter={(v: any) => [`${v}s`, 'Dwell']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {DWELL_TIMES.map((d: any, i: number) => (
                <span key={d.zone} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length], border: `1px solid ${COLORS[i % COLORS.length]}40` }}>
                  {d.zone}: {d.avg_dwell_time_seconds}s
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={PieChartIcon} color="#f97316" title="Sales Share by Category (%)" />
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORY_SALES} outerRadius={95} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                    {CATEGORY_SALES.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} formatter={(v: any) => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={BarChartIcon} color="#8b5cf6" title="Rack Performance (Revenue vs Total Qty)" />
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RACK_PERFORMANCE} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="rack" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                  <Bar dataKey="restocks" fill="#22c55e" radius={[4, 4, 0, 0]} name="Total Qty" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={Eye} color="#06b6d4" title="Zone Performance Radar" />
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={ZONE_RADAR}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="zone" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Radar name="Traffic" dataKey="traffic" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                  <Radar name="Dwell" dataKey="dwell" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
                  <Radar name="Sales" dataKey="sales" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
              {[['#6366f1', 'Traffic'], ['#ec4899', 'Dwell'], ['#22c55e', 'Sales']].map(([c, l]) => (
                <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={Zap} color="#eab308" title="Next-Zone Movement Predictor" />
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Select a zone to predict where customers move next.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ZONES.map((z: string) => (
                  <button
                    key={z}
                    onClick={() => { setSelectedZone(z); setPrediction(''); }}
                    style={{ padding: '8px 14px', borderRadius: '20px', border: selectedZone === z ? '2px solid #eab308' : '1px solid rgba(255,255,255,0.1)', background: selectedZone === z ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)', color: selectedZone === z ? '#eab308' : '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: selectedZone === z ? '700' : '400', transition: 'all 0.2s' }}
                  >
                    {z}
                  </button>
                ))}
              </div>
              <button
                onClick={handlePredict}
                disabled={predicting}
                style={{ padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)', color: '#1e1b4b', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: predicting ? 0.7 : 1 }}
              >
                {predicting ? 'AI Thinking...' : 'Predict Next Zone'}
              </button>
              {prediction && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: '20px', background: 'rgba(234,179,8,0.08)', borderRadius: '14px', border: '1px dashed rgba(234,179,8,0.4)', textAlign: 'center' }}
                >
                  <p style={{ color: '#eab308', fontSize: '12px', margin: '0 0 6px 0', letterSpacing: '1px' }}>PREDICTED NEXT AREA</p>
                  <h2 style={{ color: 'white', fontSize: '26px', margin: 0, fontWeight: '800' }}>{prediction}</h2>
                  <p style={{ color: '#94a3b8', fontSize: '12px', margin: '6px 0 0 0' }}>from {selectedZone}</p>
                </motion.div>
              )}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
            <SectionTitle icon={Star} color="#f43f5e" title="AI Optimization Insights" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '340px', overflowY: 'auto' }}>
              {AI_INSIGHTS.map((ins: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                >
                  <div>
                    <p style={{ color: 'white', fontWeight: '600', fontSize: '13px', margin: '0 0 4px 0' }}>{ins.title}</p>
                    <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{ins.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: isMobile ? '15px' : '22px' }}>
          <SectionTitle icon={AlertTriangle} color="#f43f5e" title="Rack Status Overview" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Rack', 'Revenue (₹)', 'Total Qty', 'Low Stock Alerts', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RACK_PERFORMANCE.map((r: any, i: number) => (
                  <tr key={r.rack} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 16px', color: 'white', fontWeight: '600' }}>
                      <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 8 }} />
                      {r.rack}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#22c55e', fontWeight: '700' }}>₹{r.sales.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{r.restocks}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: r.lowStockAlerts > 2 ? '#ef4444' : r.lowStockAlerts > 0 ? '#f59e0b' : '#22c55e', fontWeight: '700' }}>
                        {r.lowStockAlerts > 0 ? r.lowStockAlerts : '0'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: r.lowStockAlerts > 2 ? 'rgba(239,68,68,0.15)' : r.lowStockAlerts > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)', color: r.lowStockAlerts > 2 ? '#ef4444' : r.lowStockAlerts > 0 ? '#f59e0b' : '#22c55e' }}>
                        {r.lowStockAlerts > 2 ? 'Critical' : r.lowStockAlerts > 0 ? 'Warning' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SmartStore;
