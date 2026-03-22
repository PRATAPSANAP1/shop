// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Text, Plane, Cone } from '@react-three/drei';
import { getRacks, createRack, updateRack, deleteRack, getProductsByRack, saveShopConfig, getShopConfig, createDoor, getDoors, deleteDoor } from '../services/api';
import * as THREE from 'three';

const AxisArrows = () => {
  return (
    <group position={[0, 0, 0]}>
      <group>
        <Box args={[3, 0.1, 0.1]} position={[1.5, 0, 0]}>
          <meshBasicMaterial color="#ff0000" />
        </Box>
        <Cone args={[0.2, 0.5]} position={[3, 0, 0]} rotation={[0, 0, -Math.PI/2]}>
          <meshBasicMaterial color="#ff0000" />
        </Cone>
        <Text position={[3.5, 0, 0]} fontSize={0.3} color="#ff0000" fontWeight="bold">
          X
        </Text>
      </group>
      <group>
        <Box args={[0.1, 3, 0.1]} position={[0, 1.5, 0]}>
          <meshBasicMaterial color="#00ff00" />
        </Box>
        <Cone args={[0.2, 0.5]} position={[0, 3, 0]}>
          <meshBasicMaterial color="#00ff00" />
        </Cone>
        <Text position={[0, 3.5, 0]} fontSize={0.3} color="#00ff00" fontWeight="bold">
          Y
        </Text>
      </group>
      <group>
        <Box args={[0.1, 0.1, 3]} position={[0, 0, 1.5]}>
          <meshBasicMaterial color="#0000ff" />
        </Box>
        <Cone args={[0.2, 0.5]} position={[0, 0, 3]} rotation={[Math.PI/2, 0, 0]}>
          <meshBasicMaterial color="#0000ff" />
        </Cone>
        <Text position={[0, 0, 3.5]} fontSize={0.3} color="#0000ff" fontWeight="bold">
          Z
        </Text>
      </group>
    </group>
  );
};

const ProductBox = ({ product, position, size }: any) => {
  return (
    <group position={position}>
      <Box args={size}>
        <meshStandardMaterial color={product.quantity < 5 ? '#ff6b6b' : '#4ecdc4'} />
      </Box>
      <Text 
        position={[0, size[1]/2 + 0.1, 0]} 
        fontSize={0.15} 
        color="black"
        maxWidth={size[0]}
      >
        {product.productName}
      </Text>
      <Text 
        position={[0, -size[1]/2 - 0.1, 0]} 
        fontSize={0.1} 
        color="#666"
      >
        Qty: {product.quantity}
      </Text>
    </group>
  );
};

const Rack3D = ({ rack, products, onDelete, isPreview = false }: any) => {
  const getColor = () => {
    if (isPreview) return '#ffeb3b';
    if (rack.status === 'lowStock') return '#ff4444';
    if (rack.status === 'expiring') return '#ffaa00';
    return rack.color || '#8e8e8e';
  };

  const width = rack.width || 2;
  const height = rack.height || 3;
  const depth = 0.3;
  const dimensions = [width, height, depth];
  const shelves = rack.shelves || 4;
  const columns = rack.columns || 3;
  const shelfHeight = height / shelves;
  const columnWidth = width / columns;
  
  return (
    <group position={[rack.positionX, rack.positionY, rack.positionZ]} rotation={[0, (rack.rotation || 0) * Math.PI / 180, 0]}>
      <Box args={dimensions} castShadow>
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={isPreview ? 0.7 : 0.3}
          wireframe={isPreview}
        />
      </Box>
      
      {Array.from({ length: shelves }).map((_, shelfIndex) => {
        const shelfY = -height/2 + shelfHeight * (shelfIndex + 0.5);
        return (
          <Plane 
            key={`shelf-${shelfIndex}`}
            args={[width, depth]} 
            position={[0, shelfY, 0]} 
            rotation={[-Math.PI/2, 0, 0]}
          >
            <meshStandardMaterial 
              color={isPreview ? '#fff176' : '#d4d4d4'} 
              transparent
              opacity={isPreview ? 0.5 : 1}
            />
          </Plane>
        );
      })}
      
      {!isPreview && products.map((product, index) => {
        const shelfIndex = Math.floor(index / columns);
        const columnIndex = index % columns;
        
        if (shelfIndex >= shelves) return null;
        
        const productX = -width/2 + columnWidth * (columnIndex + 0.5);
        const productY = -height/2 + shelfHeight * (shelfIndex + 0.5) + 0.1;
        const productZ = 0;
        
        const productSize = [columnWidth * 0.8, 0.3, 0.2];
        
        return (
          <ProductBox 
            key={product._id}
            product={product}
            position={[productX, productY, productZ]}
            size={productSize}
          />
        );
      })}
      
      <Text 
        position={[0, height/2 + 0.3, 0]} 
        fontSize={0.4} 
        color={isPreview ? '#f57f17' : 'black'}
        fontWeight="bold"
      >
        {rack.rackName || 'Preview'}
      </Text>
      
      <Text 
        position={[0, -height/2 - 0.3, 0]} 
        fontSize={0.2} 
        color={isPreview ? '#f57f17' : '#666'}
      >
        {width}m × {height}m
      </Text>
    </group>
  );
};

const ShopBuilder = () => {
  const [racks, setRacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRack, setEditingRack] = useState(null);
  const [formData, setFormData] = useState({ rackName: '', positionX: 0, positionY: 0, positionZ: 0, rotation: 0, width: 2, height: 3, shelves: 4, columns: 3, orientation: 'vertical', color: '#4CAF50' });
  const [shopDimensions, setShopDimensions] = useState({ width: 20, depth: 20 });
  const [rackProducts, setRackProducts] = useState({});
  const [doors, setDoors] = useState([]);
  const [showDoorForm, setShowDoorForm] = useState(false);
  const [doorFormData, setDoorFormData] = useState({ doorType: 'entry', positionX: 0, positionZ: 0, rotation: 0 });
  const [shopPoints, setShopPoints] = useState([]);
  const [isCreatingShop, setIsCreatingShop] = useState(false);
  const [shopCreated, setShopCreated] = useState(true);
  const [draggedPointIndex, setDraggedPointIndex] = useState(null);

  useEffect(() => {
    loadRacks();
    loadShopConfig();
    loadDoors();
    generateBorderPoints();
  }, []);

  useEffect(() => {
    generateBorderPoints();
  }, [shopDimensions]);

  const loadDoors = async () => {
    try {
      const { data } = await getDoors();
      setDoors(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddDoor = async (e: any) => {
    e.preventDefault();
    try {
      await createDoor(doorFormData);
      setShowDoorForm(false);
      setDoorFormData({ doorType: 'entry', positionX: 0, positionZ: 0, rotation: 0 });
      loadDoors();
    } catch (error) {
      alert('Error adding door');
    }
  };

  const handleDeleteDoor = async (id: any) => {
    if (window.confirm('Delete door?')) {
      await deleteDoor(id);
      loadDoors();
    }
  };

  const generateBorderPoints = () => {
    const { width, depth } = shopDimensions;
    const points = [];
    
    for (let i = 0; i < 5; i++) {
      points.push({ x: -width/2 + (i * width/4), z: -depth/2 });
    }
    for (let i = 1; i < 4; i++) {
      points.push({ x: width/2, z: -depth/2 + (i * depth/3) });
    }
    for (let i = 1; i < 4; i++) {
      points.push({ x: width/2 - (i * width/3), z: depth/2 });
    }
    for (let i = 1; i < 5; i++) {
      points.push({ x: -width/2, z: depth/2 - (i * depth/4) });
    }
    
    setShopPoints(points);
  };

  const loadShopConfig = async () => {
    try {
      const { data } = await getShopConfig();
      if (data.width && data.depth) {
        setShopDimensions({ width: data.width, depth: data.depth });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveShopDimensions = async () => {
    try {
      await saveShopConfig(shopDimensions);
      alert('Shop dimensions saved!');
    } catch (error) {
      alert('Error saving dimensions');
    }
  };

  const loadRacks = async () => {
    try {
      const { data } = await getRacks();
      setRacks(data);
      
      const productsMap = {};
      for (const rack of data) {
        try {
          const { data: products } = await getProductsByRack(rack._id);
          productsMap[rack._id] = products;
        } catch (error) {
          productsMap[rack._id] = [];
        }
      }
      setRackProducts(productsMap);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddRack = async (e: any) => {
    e.preventDefault();
    try {
      if (editingRack) {
        await updateRack(editingRack._id, formData);
      } else {
        await createRack(formData);
      }
      setShowForm(false);
      setEditingRack(null);
      setFormData({ rackName: '', positionX: 0, positionY: 0, positionZ: 0, rotation: 0, width: 2, height: 3, shelves: 4, columns: 3, orientation: 'vertical', color: '#4CAF50' });
      loadRacks();
    } catch (error) {
      alert(error.response?.data?.error || 'Error');
    }
  };

  const handleEdit = (rack: any) => {
    setEditingRack(rack);
    setFormData({
      rackName: rack.rackName,
      positionX: rack.positionX,
      positionY: rack.positionY,
      positionZ: rack.positionZ,
      rotation: rack.rotation || 0,
      width: rack.width || 2,
      height: rack.height || 3,
      shelves: rack.shelves || 4,
      columns: rack.columns || 3,
      orientation: rack.orientation || 'vertical',
      color: rack.color || '#4CAF50'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: any) => {
    if (window.confirm('Delete rack?')) {
      await deleteRack(id);
      loadRacks();
    }
  };

  const handleCanvasClick = (event: any) => {
    if (!isCreatingShop) return;
    
    event.stopPropagation();
    const canvas = event.target.closest('canvas');
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const z = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const worldX = x * shopDimensions.width / 2;
    const worldZ = z * shopDimensions.depth / 2;
    
    setShopPoints([...shopPoints, { x: worldX, z: worldZ }]);
  };

  const handlePointDrag = (index: number, event: any) => {
    if (!event.point) return;
    const newPoints = [...shopPoints];
    newPoints[index] = { x: event.point.x, z: event.point.z };
    setShopPoints(newPoints);
  };

  const undoLastPoint = () => {
    setShopPoints(shopPoints.slice(0, -1));
  };

  const createShopFromPoints = () => {
    if (shopPoints.length < 3) {
      alert('Need at least 3 points to create a shop');
      return;
    }
    setShopCreated(true);
    setIsCreatingShop(false);
  };

  const resetShop = () => {
    setShopPoints([]);
    setShopCreated(false);
    setIsCreatingShop(false);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: '#0f172a', overflow: 'hidden' }}>
      <div style={{ flex: '0 0 50%', position: 'relative', minHeight: isMobile ? '40vh' : 'unset' }}>
        <Canvas 
          shadows 
          camera={{ position: [15, 15, 15], fov: 50 }}
          onClick={handleCanvasClick}
        >
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[10, 15, 5]} 
            castShadow 
            intensity={0.8}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <Plane args={[shopDimensions.width, shopDimensions.depth]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#f8f8f8" roughness={0.8} />
          </Plane>
          
          <Box args={[0.2, 4, shopDimensions.depth]} position={[-shopDimensions.width/2, 2, 0]}>
            <meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} />
          </Box>
          <Box args={[0.2, 4, shopDimensions.depth]} position={[shopDimensions.width/2, 2, 0]}>
            <meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} />
          </Box>
          <Box args={[shopDimensions.width, 4, 0.2]} position={[0, 2, -shopDimensions.depth/2]}>
            <meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} />
          </Box>
          <Box args={[shopDimensions.width, 4, 0.2]} position={[0, 2, shopDimensions.depth/2]}>
            <meshStandardMaterial color="#e0e0e0" transparent opacity={0.3} />
          </Box>
          
          <gridHelper args={[shopDimensions.width, Math.floor(shopDimensions.width/2)]} position={[0, 0.01, 0]} />
          
          <AxisArrows />
          
          {doors.map((door) => (
            <group key={door._id} position={[door.positionX, (door.height || 2.5)/2, door.positionZ]} rotation={[0, (door.rotation || 0) * Math.PI / 180, 0]}>
              <Box args={[door.width || 1.5, door.height || 2.5, 0.1]}>
                <meshStandardMaterial color={door.doorType === 'entry' ? '#4CAF50' : '#f44336'} transparent opacity={0.7} />
              </Box>
              <Text position={[0, 0, 0.06]} fontSize={0.3} color="white">
                {door.doorType === 'entry' ? 'ENTRY' : 'EXIT'}
              </Text>
            </group>
          ))}
          
          {showDoorForm && (
            <group position={[doorFormData.positionX, 1.25, doorFormData.positionZ]} rotation={[0, doorFormData.rotation * Math.PI / 180, 0]}>
              <Box args={[1.5, 2.5, 0.1]}>
                <meshStandardMaterial color={doorFormData.doorType === 'entry' ? '#4CAF50' : '#f44336'} transparent opacity={0.5} wireframe />
              </Box>
              <Text position={[0, 0, 0.06]} fontSize={0.3} color="#ffeb3b">
                PREVIEW
              </Text>
            </group>
          )}

          {racks.map((rack: any) => {
            if (editingRack && rack._id === editingRack._id) return null;
            return (
              <Rack3D 
                key={rack._id} 
                rack={rack} 
                products={rackProducts[rack._id] || []} 
                onDelete={handleDelete} 
              />
            );
          })}
          
          {showForm && (
            <Rack3D 
              key="preview"
              rack={formData}
              products={[]}
              isPreview={true}
            />
          )}
          
          <OrbitControls 
            target={[0, 0, 0]}
            enablePan={!isCreatingShop}
            enableZoom={!isCreatingShop}
            enableRotate={!isCreatingShop}
            minDistance={5}
            maxDistance={100}
          />
        </Canvas>

        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '10px 12px' : '16px 20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: isMobile ? '13px' : '15px' }}>Shop Builder</h3>
          {!isMobile && (
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              <p style={{ margin: '3px 0' }}>Drag: Rotate | Right-drag: Pan</p>
              <p style={{ margin: '3px 0' }}>Scroll: Zoom | Live preview</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: '0 0 50%', height: isMobile ? '60vh' : '100%', padding: '12px', background: 'rgba(15,23,42,0.95)', borderTop: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none', borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <h2 style={{ color: 'white', fontSize: '18px', marginBottom: '16px' }}>Shop Builder</h2>
        
        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '15px', borderRadius: '12px', marginBottom: '16px' }}>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>Shop Dimensions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px' }}>Width (m):</label>
              <input type="number" value={shopDimensions.width} onChange={(e) => setShopDimensions({ ...shopDimensions, width: parseInt(e.target.value) || 20 })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }} min="5" max="100" />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px' }}>Length (m):</label>
              <input type="number" value={shopDimensions.depth} onChange={(e) => setShopDimensions({ ...shopDimensions, depth: parseInt(e.target.value) || 20 })} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }} min="5" max="100" />
            </div>
          </div>
          <button onClick={handleSaveShopDimensions} className="btn btn-primary" style={{ width: '100%' }}>
            Save Dimensions
          </button>
        </div>

        <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '15px', borderRadius: '12px', marginBottom: '16px' }}>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '12px' }}>Doors ({doors.length})</h3>
          <button onClick={() => setShowDoorForm(!showDoorForm)} className="btn btn-success" style={{ width: '100%', marginBottom: '10px' }}>
            {showDoorForm ? 'Cancel' : '+ Add Door'}
          </button>
          
          {showDoorForm && (
            <form onSubmit={handleAddDoor} style={{ marginBottom: '15px' }}>
              <select value={doorFormData.doorType} onChange={(e) => setDoorFormData({ ...doorFormData, doorType: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.8)', color: 'white' }}>
                <option value="entry">Entry Door</option>
                <option value="exit">Exit Door</option>
              </select>
              <label style={{ color: '#94a3b8', fontSize: '12px' }}>Position X: {doorFormData.positionX}</label>
              <input type="range" min={-shopDimensions.width/2} max={shopDimensions.width/2} step="0.5" value={doorFormData.positionX} onChange={(e) => setDoorFormData({ ...doorFormData, positionX: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              <label style={{ color: '#94a3b8', fontSize: '12px' }}>Position Z: {doorFormData.positionZ}</label>
              <input type="range" min={-shopDimensions.depth/2} max={shopDimensions.depth/2} step="0.5" value={doorFormData.positionZ} onChange={(e) => setDoorFormData({ ...doorFormData, positionZ: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              <label style={{ color: '#94a3b8', fontSize: '12px' }}>Rotation: {doorFormData.rotation}°</label>
              <input type="range" min="0" max="360" value={doorFormData.rotation} onChange={(e) => setDoorFormData({ ...doorFormData, rotation: parseInt(e.target.value) })} style={{ width: '100%' }} />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Add Door</button>
            </form>
          )}
          
          {doors.map((door: any) => (
            <div key={door._id} style={{ background: 'rgba(15,23,42,0.6)', padding: '10px', margin: '5px 0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{door.doorType === 'entry' ? 'Entry' : 'Exit'} ({door.positionX}, {door.positionZ}) {door.rotation}°</span>
              <button onClick={() => handleDeleteDoor(door._id)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: '12px' }}>Delete</button>
            </div>
          ))}
        </div>

        <button onClick={() => { setShowForm(!showForm); setEditingRack(null); setFormData({ rackName: '', positionX: 0, positionY: 0, positionZ: 0, rotation: 0, width: 2, height: 3, shelves: 4, columns: 3, orientation: 'vertical', color: '#4CAF50' }); }} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginBottom: '16px', fontWeight: '600' }}>
          {showForm ? 'Cancel' : '+ Add Rack'}
        </button>

        {showForm && (
          <form onSubmit={handleAddRack} style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '15px', borderRadius: '12px', marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '12px', color: 'white', fontSize: '14px' }}>{editingRack ? 'Edit Rack' : 'Add New Rack'}</h3>
            <input type="text" placeholder="Rack Name" value={formData.rackName} onChange={(e) => setFormData({ ...formData, rackName: e.target.value })} style={{ width: '100%', padding: '10px', margin: '5px 0', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.6)', color: 'white' }} required />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Width: {formData.width}m</label>
                <input type="range" min="0.5" max="5" step="0.5" value={formData.width} onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Height: {formData.height}m</label>
                <input type="range" min="1" max="4" step="0.5" value={formData.height} onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })} style={{ width: '100%' }} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Shelves: {formData.shelves}</label>
                <input type="range" min="2" max="8" value={formData.shelves} onChange={(e) => setFormData({ ...formData, shelves: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>Columns: {formData.columns}</label>
                <input type="range" min="2" max="6" value={formData.columns} onChange={(e) => setFormData({ ...formData, columns: parseInt(e.target.value) })} style={{ width: '100%' }} />
              </div>
            </div>
            
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Position X: {formData.positionX}</label>
            <input type="range" min={-shopDimensions.width/2} max={shopDimensions.width/2} step="0.5" value={formData.positionX} onChange={(e) => setFormData({ ...formData, positionX: parseFloat(e.target.value) })} style={{ width: '100%' }} />
            
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Position Y: {formData.positionY}</label>
            <input type="range" min="0" max="5" step="0.5" value={formData.positionY} onChange={(e) => setFormData({ ...formData, positionY: parseFloat(e.target.value) })} style={{ width: '100%' }} />
            
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Position Z: {formData.positionZ}</label>
            <input type="range" min={-shopDimensions.depth/2} max={shopDimensions.depth/2} step="0.5" value={formData.positionZ} onChange={(e) => setFormData({ ...formData, positionZ: parseFloat(e.target.value) })} style={{ width: '100%' }} />
            
            <label style={{ fontSize: '12px', color: '#94a3b8' }}>Rotation: {formData.rotation}°</label>
            <input type="range" min="0" max="360" value={formData.rotation} onChange={(e) => setFormData({ ...formData, rotation: parseInt(e.target.value) })} style={{ width: '100%' }} />
            
            <button type="submit" style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', fontWeight: '600' }}>
              {editingRack ? '✅ Update Rack' : '➕ Add Rack'}
            </button>
          </form>
        )}

        <div>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>Racks ({racks.length})</h3>
          {racks.map((rack: any) => (
            <div key={rack._id} style={{ background: 'rgba(30,41,59,0.8)', padding: '12px', margin: '8px 0', borderRadius: '10px', borderLeft: `4px solid ${rack.color}`, border: `1px solid rgba(255,255,255,0.06)`, borderLeftWidth: '4px', borderLeftColor: rack.color }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', color: 'white' }}>{rack.rackName}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Size: {rack.width || 2}m × {rack.height || 3}m | Shelves: {rack.shelves || 4}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Pos: ({rack.positionX}, {rack.positionY}, {rack.positionZ}) | Rot: {rack.rotation || 0}°</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Products: {(rackProducts[rack._id] || []).length}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEdit(rack)} style={{ flex: 1, padding: '6px 10px', background: 'rgba(79,70,229,0.3)', color: '#a5b4fc', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                <button onClick={() => handleDelete(rack._id)} style={{ flex: 1, padding: '6px 10px', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopBuilder;

