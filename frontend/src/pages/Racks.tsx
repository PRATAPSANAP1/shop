// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getRacks, createRack, updateRack, deleteRack } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Maximize2, Layers, Columns, Edit, Trash2, Plus, X, Move } from 'lucide-react';
const showToast = (msg: string, type: 'success' | 'error' = 'success') => (window as any).__showToast?.(msg, type);

const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#795548'];
const BORDER_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#22c55e'];

const EMPTY = { rackName: '', positionX: 0, positionY: 0, positionZ: 0, width: 2, height: 3, shelves: 4, columns: 3, orientation: 'vertical', color: '#4CAF50' };

const IconInput = ({ label, children, icon: Icon }: any) => {
  const [windowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 480;
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {!isMobile && Icon && <Icon size={18} color="#6366f1" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />}
        {React.cloneElement(children, { 
          style: { 
            ...children.props.style, 
            width: '100%', 
            padding: isMobile ? '12px 14px' : (Icon ? '12px 12px 12px 42px' : '12px 14px'), 
            background: 'rgba(255,255,255,0.04)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '10px', 
            color: 'white',
            outline: 'none'
          },
          className: 'rack-input'
        })}
      </div>
    </div>
  );
};

const Racks = () => {
  const [racks, setRacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRack, setEditingRack] = useState<any>(null);
  const [formData, setFormData] = useState<any>(EMPTY);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    loadRacks();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadRacks = async () => {
    try { const { data } = await getRacks(); setRacks(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const set = (key: string, val: any) => setFormData((p: any) => ({ ...p, [key]: val }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      editingRack ? await updateRack(editingRack._id, formData) : await createRack(formData);
      setShowForm(false); setEditingRack(null); setFormData(EMPTY);
      showToast(editingRack ? 'Rack updated!' : 'Rack added!', 'success');
      loadRacks();
    } catch (error: any) { showToast(error.response?.data?.error || 'Error saving rack', 'error'); }
  };

  const handleEdit = (rack: any) => {
    setEditingRack(rack);
    setFormData({ rackName: rack.rackName, positionX: rack.positionX, positionY: rack.positionY, positionZ: rack.positionZ, width: rack.width || 2, height: rack.height || 3, shelves: rack.shelves || 4, columns: rack.columns || 3, orientation: rack.orientation || 'vertical', color: rack.color || '#4CAF50' });
    setShowForm(true);
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Delete rack?')) { await deleteRack(id); loadRacks(); }
  };

  const statusColor = (s: string) => s === 'lowStock' ? '#ef4444' : s === 'expiring' ? '#fbbf24' : '#10b981';

  return (
    <div style={{ padding: isMobile ? '15px' : '30px', width: '100%', margin: '0', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', overflow: 'hidden' }}>
      <style>{`
        .rack-input:focus { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="gradient-text" style={{ fontSize: isMobile ? '26px' : '32px', margin: 0 }}>Racks</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditingRack(null); setFormData(EMPTY); }}
          className="btn btn-success"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Rack</>}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            onSubmit={handleSubmit}
            className="glass-panel"
            style={{ padding: '24px', marginBottom: '28px' }}
          >
            <h3 style={{ marginBottom: '20px', color: 'white', fontSize: '18px' }}>{editingRack ? 'Edit Rack' : 'Add New Rack'}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <IconInput label="Rack Name" icon={Tag}>
                <input type="text" placeholder="e.g. Dairy Shelf A" value={formData.rackName} onChange={e => set('rackName', e.target.value)} required />
              </IconInput>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <IconInput label="Width (m)" icon={Maximize2}>
                  <input type="number" placeholder="2" value={formData.width} onChange={e => set('width', parseFloat(e.target.value))} min="0.5" max="10" step="0.5" required />
                </IconInput>
                <IconInput label="Height (m)" icon={Maximize2}>
                  <input type="number" placeholder="3" value={formData.height} onChange={e => set('height', parseFloat(e.target.value))} min="0.5" max="5" step="0.5" required />
                </IconInput>
                <IconInput label="Shelves" icon={Layers}>
                  <input type="number" placeholder="4" value={formData.shelves} onChange={e => set('shelves', parseInt(e.target.value))} min="1" max="10" required />
                </IconInput>
                <IconInput label="Columns" icon={Columns}>
                  <input type="number" placeholder="3" value={formData.columns} onChange={e => set('columns', parseInt(e.target.value))} min="1" max="10" required />
                </IconInput>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Orientation</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['vertical', 'horizontal'].map(o => (
                    <button key={o} type="button" onClick={() => set('orientation', o)}
                      style={{ flex: 1, padding: '11px', border: formData.orientation === o ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', background: formData.orientation === o ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: formData.orientation === o ? '#818cf8' : '#94a3b8', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s' }}>
                      {o === 'vertical' ? 'Vertical' : 'Horizontal'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>Rack Color</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {colors.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)}
                      style={{ width: '44px', height: '44px', borderRadius: '10px', background: c, border: formData.color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer', boxShadow: formData.color === c ? `0 0 12px ${c}80` : 'none', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Move size={15} color="#64748b" />
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>3D Position</label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  {[['positionX', 'X', -10, 10], ['positionY', 'Y', 0, 5], ['positionZ', 'Z', -10, 10]].map(([k, label, min, max]) => (
                    <div key={k as string}>
                      <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>{label}: {formData[k as string]}</label>
                      <input type="range" min={min} max={max} value={formData[k as string]} onChange={e => set(k as string, parseInt(e.target.value))} style={{ width: '100%', accentColor: '#6366f1' }} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                {editingRack ? 'Update Rack' : 'Add Rack'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="skeleton" style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: '17px', width: '140px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '13px', width: '70px', borderRadius: '20px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 90px)', gap: '8px', flex: 2 }}>
                  {[...Array(5)].map((_, j) => <div key={j} className="skeleton" style={{ height: '48px' }} />)}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="skeleton" style={{ width: '72px', height: '36px', borderRadius: '10px' }} />
                  <div className="skeleton" style={{ width: '44px', height: '36px', borderRadius: '10px' }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence>
          {racks.map((rack: any, idx: number) => (
            <motion.div
              key={rack._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="glass-panel"
              style={{ padding: '20px', borderLeft: `5px solid ${BORDER_COLORS[idx % BORDER_COLORS.length]}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: rack.color || '#4CAF50', flexShrink: 0, boxShadow: `0 4px 12px ${rack.color || '#4CAF50'}60` }} />
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: '17px', margin: '0 0 4px 0', color: 'white', fontWeight: '700' }}>{rack.rackName}</h3>
                    <span style={{ fontSize: '12px', padding: '2px 10px', borderRadius: '20px', background: `${statusColor(rack.status)}20`, color: statusColor(rack.status), fontWeight: '600' }}>
                      {rack.status || 'normal'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '8px', flex: 2, minWidth: isMobile ? '100%' : '320px' }}>
                  {[
                    ['Size', `${rack.width || 2}m × ${rack.height || 3}m`],
                    ['Orient', rack.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'],
                    ['Shelves', rack.shelves || 4],
                    ['Columns', rack.columns || 3],
                    ['X/Y/Z', `${rack.positionX}, ${rack.positionY}, ${rack.positionZ}`],
                  ].map(([label, val]) => (
                    <div key={label as string} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>{val}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleEdit(rack)} style={{ padding: '9px 16px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => handleDelete(rack._id)} style={{ padding: '9px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
        {!loading && racks.length === 0 && (
          <div className="glass-panel" style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '16px' }}>No racks yet. Add your first rack above.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Racks;
