// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Text, Plane, Environment, ContactShadows } from '@react-three/drei';
import { getRacks, getProductsByRack, getShopConfig, getDoors } from '../services/api';

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

const Rack3D = ({ rack, products, onClick }: any) => {
  const getColor = () => {
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
  
  const [hovered, setHovered] = useState(false);
  
  return (
    <group 
      position={[rack.positionX, rack.positionY, rack.positionZ]} 
      rotation={[0, (rack.rotation || 0) * Math.PI / 180, 0]}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      <Box args={dimensions} onClick={() => onClick(rack)} castShadow receiveShadow>
        <meshPhysicalMaterial 
          color={getColor()} 
          transparent 
          opacity={hovered ? 0.8 : 0.4} 
          roughness={hovered ? 0.05 : 0.2} 
          metalness={0.1}
          transmission={0.5}
          thickness={0.5}
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
            <meshStandardMaterial color="#d4d4d4" />
          </Plane>
        );
      })}
      
      {products.map((product: any, index: number) => {
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
        color="black"
        fontWeight="bold"
      >
        {rack.rackName}
      </Text>
      
      <Text 
        position={[0, -height/2 - 0.3, 0]} 
        fontSize={0.2} 
        color="#666"
      >
        {width}m × {height}m
      </Text>
    </group>
  );
};

const ShopView3D = () => {
  const [racks, setRacks] = useState([]);
  const [selectedRack, setSelectedRack] = useState(null);
  const [rackProducts, setRackProducts] = useState({});
  const [shopDimensions, setShopDimensions] = useState({ width: 30, depth: 30 });
  const [doors, setDoors] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    loadRacks();
    loadShopConfig();
    loadDoors();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDoors = async () => {
    try {
      const { data } = await getDoors();
      setDoors(data);
    } catch (error) {
      console.error(error);
    }
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

  const handleRackClick = (rack: any) => {
    setSelectedRack(rack);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: isMobile ? 'column' : 'row', background: '#0f172a' }}>
      <div style={{ flex: 1, position: 'relative', minHeight: isMobile ? '55vh' : 'unset' }}>
        <Canvas shadows camera={{ position: [15, 10, 15], fov: 50 }} style={{ background: '#0f172a' }}>
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} castShadow intensity={1} shadow-mapSize={[2048, 2048]} />
          
          <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={40} blur={2.5} far={4} />

          <Plane args={[shopDimensions.width, shopDimensions.depth]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#fafafa" roughness={0.1} metalness={0.1} />
          </Plane>
          
          <Box args={[0.2, 4, shopDimensions.depth]} position={[-shopDimensions.width/2, 2, 0]}>
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} />
          </Box>
          <Box args={[0.2, 4, shopDimensions.depth]} position={[shopDimensions.width/2, 2, 0]}>
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} />
          </Box>
          <Box args={[shopDimensions.width, 4, 0.2]} position={[0, 2, -shopDimensions.depth/2]}>
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} />
          </Box>
          <Box args={[shopDimensions.width, 4, 0.2]} position={[0, 2, shopDimensions.depth/2]}>
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} />
          </Box>
          
          {doors.map((door: any) => (
            <group key={door._id} position={[door.positionX, (door.height || 2.5)/2, door.positionZ]} rotation={[0, (door.rotation || 0) * Math.PI / 180, 0]}>
              <Box args={[door.width || 1.5, door.height || 2.5, 0.1]}>
                <meshStandardMaterial color={door.doorType === 'entry' ? '#4CAF50' : '#f44336'} transparent opacity={0.7} />
              </Box>
              <Text position={[0, 0, 0.06]} fontSize={0.3} color="white">
                {door.doorType === 'entry' ? 'ENTRY' : 'EXIT'}
              </Text>
            </group>
          ))}
          <gridHelper args={[shopDimensions.width, Math.floor(shopDimensions.width/2)]} />
          
          {racks.map((rack: any) => (
            <Rack3D 
              key={rack._id} 
              rack={rack} 
              products={rackProducts[rack._id] || []} 
              onClick={handleRackClick} 
            />
          ))}
          
          <OrbitControls />
        </Canvas>
        
        {/* Controls info */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '8px 12px' : '14px 18px', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: isMobile ? '13px' : '15px' }}>3D Shop View</h3>
          {!isMobile && <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>Click rack • Drag to rotate • Scroll to zoom</p>}
        </div>
      </div>
      
      {selectedRack && (
        <div style={{ width: isMobile ? '100%' : '340px', maxHeight: isMobile ? '45vh' : 'unset', padding: '16px', background: 'rgba(15,23,42,0.97)', borderTop: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none', borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ color: selectedRack.color, margin: 0, fontSize: '18px' }}>{selectedRack.rackName}</h2>
            <button onClick={() => setSelectedRack(null)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
            <p style={{ color: '#cbd5e1', margin: '4px 0', fontSize: '13px' }}><strong style={{ color: 'white' }}>Dimensions:</strong> {selectedRack.width || 2}m × {selectedRack.height || 3}m</p>
            <p style={{ color: '#cbd5e1', margin: '4px 0', fontSize: '13px' }}><strong style={{ color: 'white' }}>Shelves:</strong> {selectedRack.shelves || 4} &nbsp; <strong style={{ color: 'white' }}>Columns:</strong> {selectedRack.columns || 3}</p>
            <p style={{ color: '#cbd5e1', margin: '4px 0', fontSize: '13px' }}><strong style={{ color: 'white' }}>Status:</strong> <span style={{ color: selectedRack.status === 'lowStock' ? '#f45c43' : selectedRack.status === 'expiring' ? '#ffaa00' : '#10b981' }}>{selectedRack.status || 'normal'}</span></p>
          </div>
          
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>Products ({(rackProducts[selectedRack._id] || []).length})</h3>
          {(rackProducts[selectedRack._id as keyof typeof rackProducts] || []).map((product: any, index: number) => {
            const shelfIndex = Math.floor(index / (selectedRack.columns || 3)) + 1;
            const columnIndex = (index % (selectedRack.columns || 3)) + 1;
            return (
              <div key={product._id} style={{ background: 'rgba(30,41,59,0.8)', padding: '12px', margin: '8px 0', borderRadius: '10px', borderLeft: `4px solid ${product.quantity < 5 ? '#ef4444' : '#10b981'}` }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: 'white' }}>{product.productName}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Shelf {shelfIndex}, Column {columnIndex}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                  <div>Qty: <strong style={{ color: product.quantity < 5 ? '#ef4444' : 'white' }}>{product.quantity}</strong></div>
                  <div>${product.price}</div>
                  <div>Category: {product.category}</div>
                  {product.expiryDate && (
                    <div style={{ color: new Date(product.expiryDate) <= new Date(Date.now() + 7*24*60*60*1000) ? '#ef4444' : '#94a3b8' }}>
                      Exp: {new Date(product.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {(rackProducts[selectedRack._id] || []).length === 0 && (
            <div style={{ background: 'rgba(30,41,59,0.6)', padding: '20px', borderRadius: '10px', textAlign: 'center', color: '#64748b' }}>
              No products in this rack
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopView3D;

