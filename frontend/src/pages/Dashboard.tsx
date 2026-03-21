import React, { useState, useEffect } from 'react';
import { getDashboardStats, getProducts } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, DollarSign, AlertTriangle, TrendingDown, X } from 'lucide-react';

const formatValue = (val: number) => {
  if (val >= 10_000_000) return `₹${(val / 10_000_000).toFixed(2)}Cr`;
  if (val >= 100_000) return `₹${(val / 100_000).toFixed(2)}L`;
  if (val >= 1_000) return `₹${(val / 1_000).toFixed(1)}K`;
  return `₹${val.toFixed(2)}`;
};

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    loadStats();
    loadProducts();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCardClick = (type: string) => {
    let filtered: any[] = [];
    if (type === 'expiring') {
      const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      filtered = products.filter((p: any) => p.expiryDate && new Date(p.expiryDate) <= sevenDaysLater);
    } else if (type === 'lowStock') {
      filtered = products.filter((p: any) => p.quantity < p.minStockLevel);
    } else if (type === 'all') {
      filtered = products;
    } else if (type === 'value') {
      filtered = [...products].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));
    }
    setFilteredProducts(filtered);
    setModalType(type);
    setShowModal(true);
  };

  if (!stats) return (
    <div style={{ padding: isMobile ? '20px 15px' : '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="skeleton" style={{ height: '44px', width: '260px', marginBottom: '40px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? '16px' : '20px', marginBottom: '36px' }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-panel" style={{ padding: isMobile ? '24px 20px' : '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: isMobile ? 42 : 56, height: isMobile ? 42 : 56, borderRadius: '14px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: '13px', width: '70%', marginBottom: '10px' }} />
              <div className="skeleton" style={{ height: '28px', width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="glass-panel" style={{ padding: isMobile ? '20px 15px' : '30px' }}>
        <div className="skeleton" style={{ height: '22px', width: '200px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: isMobile ? '220px' : '360px', borderRadius: '12px' }} />
      </div>
    </div>
  );

  const chartData = Object.entries(stats.monthlyData || {}).map(([month, count]) => ({
    month,
    products: count
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: isMobile ? '20px 15px' : '30px', maxWidth: '1400px', margin: '0 auto' }}
    >
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="gradient-text" 
        style={{ fontSize: isMobile ? '28px' : '36px', marginBottom: isMobile ? '25px' : '40px', fontWeight: '800' }}
      >
        Dashboard Overview
      </motion.h1>
      
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible" 
        style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? '16px' : '20px', marginBottom: isMobile ? '24px' : '36px' }}
      >
        {[
          { type: 'all', label: 'Total Products', value: stats.totalProducts, icon: <Package size={isMobile ? 26 : 28} />, gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', shadow: 'rgba(17,153,142,0.3)', clickable: true },
          { type: 'value', label: 'Total Revenue', value: formatValue(stats.totalValue || 0), icon: <DollarSign size={isMobile ? 26 : 28} />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102,126,234,0.3)', clickable: true },
          { type: 'expiring', label: 'Expiring Soon', value: stats.expiringSoon, icon: <AlertTriangle size={isMobile ? 26 : 28} />, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shadow: 'rgba(245,87,108,0.3)', clickable: true },
          { type: 'lowStock', label: 'Low Stock', value: stats.lowStock, icon: <TrendingDown size={isMobile ? 26 : 28} />, gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', shadow: 'rgba(244,92,67,0.3)', clickable: true },
        ].map((card) => (
          <motion.div
            key={card.label}
            variants={itemVariants}
            onClick={() => card.clickable && handleCardClick(card.type)}
            className="glass-panel"
            style={{ padding: isMobile ? '24px 20px' : '24px', cursor: card.clickable ? 'pointer' : 'default', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: isMobile ? '20px' : '18px' }}
            whileHover={{ scale: 1.02, y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            whileTap={card.clickable ? { scale: 0.97 } : {}}
          >
            <div style={{ background: card.gradient, padding: isMobile ? '14px' : '14px', borderRadius: '16px', color: 'white', boxShadow: `0 8px 16px ${card.shadow}`, flexShrink: 0 }}>
              {card.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: isMobile ? '14px' : '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.label}</div>
              <div style={{ fontSize: isMobile ? '30px' : '30px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{card.value}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="glass-panel" 
        style={{ padding: isMobile ? '20px 15px' : '30px', marginTop: '10px' }}
      >
        <h3 style={{ marginBottom: '20px', fontSize: isMobile ? '16px' : '20px', fontWeight: '700', color: 'var(--text-primary)' }}>Monthly Stock Activity</h3>
        <div style={{ height: isMobile ? '220px' : '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', color: 'white' }}
                itemStyle={{ color: 'var(--primary)' }}
              />
              <Line 
                type="monotone" 
                dataKey="products" 
                stroke="var(--primary)" 
                strokeWidth={4} 
                dot={{ r: 6, fill: 'var(--primary)', stroke: '#1a1a2e', strokeWidth: 2 }} 
                activeDot={{ r: 8, fill: '#fff', stroke: 'var(--primary)', strokeWidth: 2 }} 
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} 
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', margin: isMobile ? '0' : undefined }} 
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '25px 30px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {modalType === 'all' && <><Package color="var(--primary)" /> All Products</>}
                  {modalType === 'value' && <><DollarSign color="#818cf8" /> Revenue Breakdown</>}
                  {modalType === 'expiring' && <><AlertTriangle color="#f5576c" /> Expiring Soon</>}
                  {modalType === 'lowStock' && <><TrendingDown color="#f45c43" /> Low Stock Items</>}
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)} 
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <div style={{ overflowY: 'auto', overflowX: 'auto', padding: '0', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
                <table style={{ width: '100%', minWidth: isMobile ? '480px' : 'unset', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'rgba(20,20,30,0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Name</th>
                      <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Category</th>
                      <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Stock</th>
                      <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Location</th>
                      {modalType === 'expiring' && <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Expiry</th>}
                      {modalType === 'value' && <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Value</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={p._id} 
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                        onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '16px 20px', fontWeight: '500' }}>{p.productName}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{p.category}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '13px', 
                            fontWeight: '600',
                            background: p.quantity < p.minStockLevel ? 'rgba(244, 92, 67, 0.15)' : 'rgba(17, 153, 142, 0.15)',
                            color: p.quantity < p.minStockLevel ? '#ff8a80' : '#64ffda',
                            border: `1px solid ${p.quantity < p.minStockLevel ? 'rgba(244, 92, 67, 0.3)' : 'rgba(17, 153, 142, 0.3)'}`
                          }}>
                            {p.quantity}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{p.rackId?.rackName || 'Unassigned'}</td>
                        {modalType === 'expiring' && <td style={{ padding: '16px 20px', color: '#ff8a80', fontWeight: '500' }}>{new Date(p.expiryDate).toLocaleDateString()}</td>}
                        {modalType === 'value' && (
                          <td style={{ padding: '16px 20px', fontWeight: '700', color: '#818cf8' }}>
                            ₹{(p.price * p.quantity).toFixed(2)}
                            <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                              ({p.quantity} × ₹{p.price})
                            </span>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No products found in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
