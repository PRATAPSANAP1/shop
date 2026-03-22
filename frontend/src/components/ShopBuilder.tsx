// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Text, Plane, Cone } from '@react-three/drei';
import { getRacks, createRack, updateRack, deleteRack, getProductsByRack, saveShopConfig, getShopConfig, createDoor, getDoors, deleteDoor } from '../services/api';

const AxisArrows = () => (
  <group>
    <group>
      <Box args={[3, 0.1, 0.1]} position={[1.5, 0, 0]}><meshBasicMaterial color="#ff0000" /></Box>
      <Cone args={[0.2, 0.5]} position={[3, 0, 0]} rotation={[0, 0, -Math.PI/2]}><meshBasicMaterial color="#ff0000" /></Cone>
      <Text position={[3.5, 0, 0]} fontSize={0.3} color="#ff0000">X</Text>
    </group>
    <group>
      <Box args={[0.1, 3, 0.1]} position={[0, 1.5, 0]}><meshBasicMaterial color="#00ff00" /></Box>
      <Cone args={[0.2, 0.5]} position={[0, 3, 0]}><meshBasicMaterial color="#00ff00" /></Cone>
      <Text position={[0, 3.5, 0]} fontSize={0.3} color="#00ff00">Y</Text>
    </group>
    <group>
      <Box args={[0.1, 0.1, 3]} position={[0, 0, 1.5]}><meshBasicMaterial color="#0000ff" /></Box>
      <Cone args={[0.2, 0.5]} position={[0, 0, 3]} rotation={[Math.PI/2, 0, 0]}><meshBasicMaterial color="#0000ff" /></Cone>
      <Text position={[0, 0, 3.5]} fontSize={0.3} color="#0000ff">Z</Text>
    </group>
  </group>
);

const Rack3D = ({ rack, products, isPreview = false }: any) => {
  const getColor = () => {
    if (isPreview) return '#ffeb3b';
    if (rack.status === 'lowStock') return '#ff4444';
    if (rack.status === 'expiring') return '#ffaa00';
    return rack.color || '#8e8e8e';
  };
  const width = rack.width || 2;
  const height = rack.height || 3;
  const depth = 0.3;
  const shelves = rack.shelves || 4;
  const columns = rack.columns || 3;
  const shelfHeight = height / shelves;
  const columnWidth = width / columns;

  return (
    <group position={[rack.positionX, rack.positionY, rack.positionZ]} rotation={[0, (rack.rotation || 0) * Math.PI / 180, 0]}>
      <Box args={[width, height, depth]} castShadow>
        <meshStandardMaterial color={getColor()} transparent opacity={isPreview ? 0.7 : 0.3} wireframe={isPreview} />
      </Box>
      {Array.from({ length: shelves }).map((_, i) => (
        <Plane key={i} args={[width, depth]} position={[0, -height/2 + shelfHeight * (i + 0.5), 0]} rotation={[-Math.PI/2, 0, 0]}>
          <meshStandardMaterial color={isPreview ? '#fff176' : '#d4d4d4'} transparent opacity={isPreview ? 0.5 : 1} />
        </Plane>
      ))}
      {!isPreview && products.map((product: any, index: number) => {
        const si = Math.floor(index / columns);
        const ci = index % columns;
        if (si >= shelves) return null;
        return (
          <group key={product._id} position={[-width/2 + columnWidth * (ci + 0.5), -height/2 + shelfHeight * (si + 0.5) + 0.1, 0]}>
            <Box args={[columnWidth * 0.8, 0.3, 0.2]}>
              <meshStandardMaterial color={product.quantity < 5 ? '#ff6b6b' : '#4ecdc4'} />
            </Box>
          </group>
        );
      })}
      <Text position={[0, height/2 + 0.3, 0]} fontSize={0.4} color={isPreview ? '#f57f17' : 'black'}>
        {rack.rackName || 'Preview'}
      </Text>
    </group>
  );
};

const ShopBuilder = () => {
  const [racks, setRacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRack, setEditingRack] = useState(null);
  const [formData, setFormData] = useState({ rackName: '', positionX: 0, positionY: 0, positionZ: 0, rotation: 0, width: 2, height: 3, shelves: 4, columns: 3, color: '#4CAF50' });
  const [shopDimensions, setShopDimensions] = useState({ width: 20, depth: 20 });
  const [rackProducts, setRackProducts] = useState({});
  const [doors, setDoors] = useState([]);
  const [showDoorForm, setShowDoorForm] = useState(false);
  const [doorFormData, setDoorFormData] = useState({ doorType: 'entry', positionX: 0, positionZ: 0, rotation: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { loadRacks(); loadShopConfig(); loadDoors(); }, []);

  const loadDoors = async () => { try { const { data } = await getDoors(); setDoors(data); } catch {} };
  const loadShopConfig = async () => { try { const { data } = await getShopConfig(); if (data?.width) setShopDimensions({ width: data.width, depth: data.depth }); } catch {} };
  const loadRacks = async () => {
    try {
      const { data } = await getRacks();
      setRacks(data);
      const map: any = {};
      for (const rack of data) {
        try { const { data: p } = await getProductsByRack(rack._id); map[rack._id] = p; } catch { map[rack._id] = []; }
      }
      setRackProducts(map);
    } catch {}
  };

  const handleSaveShopDimensions = async () => {
    try { await saveShopConfig(shopDimensions); alert('Saved!'); } catch { alert('Error'); }
  };

  const handleAddDoor = async (e: any) => {
    e.preventDefault();
    try { await createDoor(doorFormData); setShowDoorForm(false); setDoorFormData({ doorType: 'entry', positionX: 0, positionZ: 0, rotation: 0 }); loadDoors(); } catch { alert('Error'); }
  };

  const handleDeleteDoor = async (id: any) => {
    if (window.confirm('Delete door?')) { await deleteDoor(id); loadDoors(); }
  };

  const handleAddRack = async (e: any) => {
    e.preventDefault();
    try {
      if (editingRack) { await updateRack(editingRack._id, formData); } else { await createRack(formData); }
      setShowForm(false); setEditingRack(null);
      setFormData({ rackName: '', positionX: 0, positionY: 0, positionZ: 0, rotation: 0, width: 2, height: 3, shelves: 4, columns: 3, color: '#4CAF50' });
      loadRacks();
    } catch (err: any) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleEdit = (rack: any) => {
    setEditingRack(rack);
    setFormData({ rackName: rack.rackName, positionX: rack.positionX, positionY: rack.positionY, positionZ: rack.positionZ, rotation: rack.rotation || 0, width: rack.width || 2, height: rack.height || 3, shelves: rack.shelves || 4, columns: rack.columns || 3, color: rack.color || '#4CAF50' });
    setShowForm(true);
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Delete rack?')) { await deleteRack(id); loadRacks(); }
  };

  const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white', fontSize: '13px', boxSizing: 'border-box' as const };
  const labelStyle = { color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '3px' };
  const sectionStyle = { background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '12px', marginBottom: '12px' };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', width: '100%', height: '100%', background: '#0f172a', overflow: isMobile ? 'auto' : 'hidden' }}>

      {/* 3D Canvas */}
      <div style={{ position: 'relative', width: isMobile ? '100%' : '55%', height: isMobile ? '45vw' : '100%', minHeight: isMobile ? '240px' : 'unset', flexShrink: 0 }}>
        <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }} style={{ width: '100%', height: '100%' }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 15, 5]} castShadow intensity={0.8} />
          <Plane args={[shopDimensions.width, shopDimensions.depth]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#f8f8f8" roughness={0.8} />
          </Plane>
          <Box args={[0.2, 4, shopDimensions.depth]} position={[-shopDimensions.width/2, 2, 0]}><meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} /></Box>
          <Box args={[0.2, 4, shopDimensions.depth]} position={[shopDimensions.width/2, 2, 0]}><meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} /></Box>
          <Box args={[shopDimensions.width, 4, 0.2]} position={[0, 2, -shopDimensions.depth/2]}><meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} /></Box>
          <Box args={[shopDimensions.width, 4, 0.2]} position={[0, 2, shopDimensions.depth/2]}><meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} /></Box>
          <gridHelper args={[shopDimensions.width, Math.floor(shopDimensions.width/2)]} position={[0, 0.01, 0]} />
          <AxisArrows />
          {doors.map((door: any) => (
            <group key={door._id} position={[door.positionX, (door.height || 2.5)/2, door.positionZ]} rotation={[0, (door.rotation || 0) * Math.PI / 180, 0]}>
              <Box args={[door.width || 1.5, door.height || 2.5, 0.1]}><meshStandardMaterial color={door.doorType === 'entry' ? '#4CAF50' : '#f44336'} transparent opacity={0.7} /></Box>
              <Text position={[0, 0, 0.06]} fontSize={0.3} color="white">{door.doorType === 'entry' ? 'ENTRY' : 'EXIT'}</Text>
            </group>
          ))}
          {showDoorForm && (
            <group position={[doorFormData.positionX, 1.25, doorFormData.positionZ]} rotation={[0, doorFormData.rotation * Math.PI / 180, 0]}>
              <Box args={[1.5, 2.5, 0.1]}><meshStandardMaterial color={doorFormData.doorType === 'entry' ? '#4CAF50' : '#f44336'} transparent opacity={0.5} wireframe /></Box>
              <Text position={[0, 0, 0.06]} fontSize={0.3} color="#ffeb3b">PREVIEW</Text>
            </group>
          )}
          {racks.map((rack: any) => {
            if (editingRack && rack._id === editingRack._id) return null;
            return <Rack3D key={rack._id} rack={rack} products={rackProducts[rack._id] || []} />;
          })}
          {showForm && <Rack3D key="preview" rack={formData} products={[]} isPreview />}
          <OrbitControls target={[0, 0, 0]} minDistance={5} maxDistance={100} />
        </Canvas>
        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 12px', borderRadius: '10px', pointerEvents: 'none' }}>
          <p style={{ margin: 0, color: 'white', fontSize: '12px', fontWeight: '600' }}>3D View</p>
          {!isMobile && <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '11px' }}>Drag · Scroll · Right-drag</p>}
        </div>
      </div>

      {/* Controls Panel */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', padding: '12px', background: 'rgba(15,23,42,0.97)', borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)', borderTop: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>

        <div style={sectionStyle}>
          <h3 style={{ color: 'white', fontSize: '13px', marginBottom: '10px' }}>Shop Dimensions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label style={labelStyle}>Width (m)</label>
              <input type="number" value={shopDimensions.width} onChange={(e) => setShopDimensions({ ...shopDimensions, width: parseInt(e.target.value) || 20 })} style={inputStyle} min="5" max="100" />
            </div>
            <div>
              <label style={labelStyle}>Length (m)</label>
              <input type="number" value={shopDimensions.depth} onChange={(e) => setShopDimensions({ ...shopDimensions, depth: parseInt(e.target.value) || 20 })} style={inputStyle} min="5" max="100" />
            </div>
          </div>
          <button onClick={handleSaveShopDimensions} className="btn btn-primary" style={{ width: '100%', padding: '9px' }}>Save Dimensions</button>
        </div>

        <div style={sectionStyle}>
          <h3 style={{ color: 'white', fontSize: '13px', marginBottom: '10px' }}>Doors ({doors.length})</h3>
          <button onClick={() => setShowDoorForm(!showDoorForm)} className="btn btn-success" style={{ width: '100%', padding: '9px', marginBottom: '8px' }}>
            {showDoorForm ? 'Cancel' : '+ Add Door'}
          </button>
          {showDoorForm && (
            <form onSubmit={handleAddDoor}>
              <select value={doorFormData.doorType} onChange={(e) => setDoorFormData({ ...doorFormData, doorType: e.target.value })} style={{ ...inputStyle, marginBottom: '8px' }}>
                <option value="entry">Entry Door</option>
                <option value="exit">Exit Door</option>
              </select>
              <label style={labelStyle}>Position X: {doorFormData.positionX}</label>
              <input type="range" min={-shopDimensions.width/2} max={shopDimensions.width/2} step="0.5" value={doorFormData.positionX} onChange={(e) => setDoorFormData({ ...doorFormData, positionX: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              <label style={labelStyle}>Position Z: {doorFormData.positionZ}</label>
              <input type="range" min={-shopDimensions.depth/2} max={shopDimensions.depth/2} step="0.5" value={doorFormData.positionZ} onChange={(e) => setDoorFormData({ ...doorFormData, positionZ: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              <label style={labelStyle}>Rotation: {doorFormData.rotation}°</label>
              <input type="range" min="0" max="360" value={doorFormData.rotation} onChange={(e) => setDoorFormData({ ...doorFormData, rotation: parseInt(e.target.value) })} style={{ width: '100%' }} />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '9px' }}>Add Door</button>
            </form>
          )}
          {doors.map((door: any) => (
            <div key={door._id} style={{ background: 'rgba(15,23,42,0.6)', padding: '8px 10px', margin: '6px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#cbd5e1', fontSize: '12px', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{door.doorType === 'entry' ? '🟢' : '🔴'} ({door.positionX}, {door.positionZ}) {door.rotation}°</span>
              <button onClick={() => handleDeleteDoor(door._id)} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}>Del</button>
            </div>
          ))}
        </div>

        <button onClick={() => { setShowForm(!showForm); setEditingRack(null); setFormData({ rackName: '', positionX: 0, positionY: 0, positionZ: 0, rotation: 0, width: 2, height: 3, shelves: 4, columns: 3, color: '#4CAF50' }); }} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '12px', fontWeight: '600', fontSize: '13px' }}>
          {showForm ? 'Cancel' : '+ Add Rack'}
        </button>

        {showForm && (
          <form onSubmit={handleAddRack} style={sectionStyle}>
            <h3 style={{ marginBottom: '10px', color: 'white', fontSize: '13px' }}>{editingRack ? 'Edit Rack' : 'New Rack'}</h3>
            <input type="text" placeholder="Rack Name" value={formData.rackName} onChange={(e) => setFormData({ ...formData, rackName: e.target.value })} style={{ ...inputStyle, marginBottom: '8px' }} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '6px' }}>
              <div><label style={labelStyle}>Width: {formData.width}m</label><input type="range" min="0.5" max="5" step="0.5" value={formData.width} onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })} style={{ width: '100%' }} /></div>
              <div><label style={labelStyle}>Height: {formData.height}m</label><input type="range" min="1" max="4" step="0.5" value={formData.height} onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })} style={{ width: '100%' }} /></div>
              <div><label style={labelStyle}>Shelves: {formData.shelves}</label><input type="range" min="2" max="8" value={formData.shelves} onChange={(e) => setFormData({ ...formData, shelves: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
              <div><label style={labelStyle}>Columns: {formData.columns}</label><input type="range" min="2" max="6" value={formData.columns} onChange={(e) => setFormData({ ...formData, columns: parseInt(e.target.value) })} style={{ width: '100%' }} /></div>
            </div>
            <label style={labelStyle}>Pos X: {formData.positionX}</label>
            <input type="range" min={-shopDimensions.width/2} max={shopDimensions.width/2} step="0.5" value={formData.positionX} onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) })} style={{ width: '100%' }} />
            <label style={labelStyle}>Pos Y: {formData.positionY}</label>
            <input type="range" min="0" max="5" step="0.5" value={formData.positionY} onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) })} style={{ width: '100%' }} />
            <label style={labelStyle}>Pos Z: {formData.positionZ}</label>
            <input type="range" min={-shopDimensions.depth/2} max={shopDimensions.depth/2} step="0.5" value={formData.positionZ} onChange={(e) => setFormData({ ...formData, positionZ: parseFloat(e.target.value) })} style={{ width: '100%' }} />
            <label style={labelStyle}>Rotation: {formData.rotation}°</label>
            <input type="range" min="0" max="360" value={formData.rotation} onChange={(e) => setFormData({ ...formData, rotation: parseInt(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
            <button type="submit" style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
              {editingRack ? 'Update Rack' : 'Add Rack'}
            </button>
          </form>
        )}

        <div>
          <h3 style={{ color: 'white', fontSize: '13px', marginBottom: '8px' }}>Racks ({racks.length})</h3>
          {racks.map((rack: any) => (
            <div key={rack._id} style={{ background: 'rgba(30,41,59,0.8)', padding: '10px', margin: '6px 0', borderRadius: '10px', borderLeft: `3px solid ${rack.color || '#4f46e5'}` }}>
              <div style={{ fontWeight: '600', marginBottom: '4px', color: 'white', fontSize: '13px' }}>{rack.rackName}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>{rack.width||2}m×{rack.height||3}m · {rack.shelves||4} shelves · ({rack.positionX},{rack.positionY},{rack.positionZ})</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEdit(rack)} style={{ flex: 1, padding: '5px', background: 'rgba(79,70,229,0.3)', color: '#a5b4fc', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                <button onClick={() => handleDelete(rack._id)} style={{ flex: 1, padding: '5px', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopBuilder;
