// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Plane, Environment, ContactShadows } from '@react-three/drei';
import { getRacks, getProductsByRack, getShopConfig, getDoors } from '../services/api';

const RACK_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316','#8b5cf6','#22c55e','#06b6d4','#e11d48'];

const GlowBox = ({ args, color, glow, dimmed }: any) => {
  const ref = useRef<any>();
  useFrame(({ clock }) => {
    if (ref.current && glow) {
      ref.current.emissiveIntensity = 1.5 + Math.sin(clock.getElapsedTime() * 4) * 1.0;
    }
  });
  return (
    <Box args={args} castShadow>
      <meshStandardMaterial
        ref={ref}
        color={glow ? '#22c55e' : dimmed ? '#1e293b' : color}
        emissive={glow ? '#22c55e' : color}
        emissiveIntensity={glow ? 1.5 : dimmed ? 0 : 0.15}
        transparent
        opacity={dimmed ? 0.12 : 1}
      />
    </Box>
  );
};

const BouncingArrow = ({ height, rackName }: any) => {
  const ref = useRef<any>();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = height / 2 + 1.4 + Math.sin(clock.getElapsedTime() * 3) * 0.25;
    }
  });
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.35, 0.7, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.6, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <Text position={[0, 1.3, 0]} fontSize={0.28} color="#22c55e" fontWeight="bold" anchorX="center" anchorY="bottom">
        {rackName}
      </Text>
    </group>
  );
};

const Rack3D = ({ rack, products, onClick, highlighted, searchActive, highlightedProductId, rackColor, onProductClick }: any) => {
  const [hovered, setHovered] = useState(false);
  const width = rack.width || 2;
  const height = rack.height || 3;
  const depth = 0.3;
  const shelves = rack.shelves || 4;
  const columns = rack.columns || 3;
  const shelfHeight = height / shelves;
  const columnWidth = width / columns;

  const productColors = ['#f97316','#8b5cf6','#06b6d4','#ec4899','#10b981','#f59e0b','#3b82f6','#ef4444'];

  return (
    <group
      position={[rack.positionX, rack.positionY || 0, rack.positionZ]}
      rotation={[0, (rack.rotation || 0) * Math.PI / 180, 0]}
      onPointerOver={(e: any) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={() => onClick(rack)}
    >
      {/* Rack body */}
      <Box args={[width, height, depth]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={highlighted ? '#22c55e' : searchActive ? '#1e293b' : rackColor}
          transparent
          opacity={highlighted ? 0.85 : searchActive ? 0.08 : hovered ? 0.75 : 0.45}
          roughness={highlighted ? 0.0 : 0.2}
          metalness={highlighted ? 0.4 : 0.1}
          transmission={highlighted ? 0.1 : 0.5}
          thickness={0.5}
          emissive={highlighted ? '#22c55e' : rackColor}
          emissiveIntensity={highlighted ? 0.5 : searchActive ? 0 : 0.05}
        />
      </Box>

      {/* Shelf planes */}
      {Array.from({ length: shelves }).map((_, i) => (
        <Plane key={i} args={[width, depth]} position={[0, -height/2 + shelfHeight * (i + 0.5), 0]} rotation={[-Math.PI/2, 0, 0]}>
          <meshStandardMaterial color="#d4d4d4" transparent opacity={searchActive && !highlighted ? 0.05 : 0.5} />
        </Plane>
      ))}

      {/* Product boxes */}
      {products.map((product: any, index: number) => {
        const si = Math.floor(index / columns);
        const ci = index % columns;
        if (si >= shelves) return null;
        const px = -width/2 + columnWidth * (ci + 0.5);
        const py = -height/2 + shelfHeight * (si + 0.5) + 0.1;
        const pSize = [columnWidth * 0.8, 0.3, 0.2] as [number, number, number];
        const isProductHighlighted = highlightedProductId === product._id;
        const shouldDim = searchActive && !isProductHighlighted;
        const pColor = productColors[index % productColors.length];
        return (
          <group key={product._id} position={[px, py, 0.16]} onClick={(e: any) => { e.stopPropagation(); onProductClick(product); }}>
            <GlowBox args={pSize} color={pColor} glow={isProductHighlighted} dimmed={shouldDim} />
            {!shouldDim && (
              <Text position={[0, pSize[1]/2 + 0.08, 0.12]} fontSize={0.1} color="white" fontWeight="bold" anchorX="center" anchorY="bottom" maxWidth={pSize[0]}>
                {product.productName}
              </Text>
            )}
          </group>
        );
      })}

      {/* Rack name label — fixed flat panel, no Billboard */}
      <group position={[0, height/2 + 0.38, 0.16]}>
        <Box args={[width * 0.92, 0.5, 0.04]}>
          <meshStandardMaterial
            color={highlighted ? '#22c55e' : searchActive ? '#334155' : rackColor}
            emissive={highlighted ? '#22c55e' : searchActive ? '#000' : rackColor}
            emissiveIntensity={highlighted ? 0.4 : searchActive ? 0 : 0.25}
          />
        </Box>
        <Text position={[0, 0, 0.03]} fontSize={0.22} color={searchActive && !highlighted ? '#475569' : 'white'} fontWeight="900" anchorX="center" anchorY="middle" maxWidth={width * 0.88}>
          {rack.rackName.toUpperCase()}
        </Text>
      </group>

      {/* Bouncing arrow when highlighted */}
      {highlighted && <BouncingArrow height={height} rackName={rack.rackName} />}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedRackId, setHighlightedRackId] = useState(null);
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchActive = !!highlightedRackId;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    loadRacks(); loadShopConfig(); loadDoors();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDoors = async () => {
    try { const { data } = await getDoors(); setDoors(data); } catch {}
  };
  const loadShopConfig = async () => {
    try { const { data } = await getShopConfig(); if (data.width && data.depth) setShopDimensions({ width: data.width, depth: data.depth }); } catch {}
  };
  const loadRacks = async () => {
    try {
      const { data } = await getRacks(); setRacks(data);
      const map = {};
      for (const rack of data) {
        try { const { data: p } = await getProductsByRack(rack._id); map[rack._id] = p; }
        catch { map[rack._id] = []; }
      }
      setRackProducts(map);
    } catch {}
  };

  const allProducts = Object.values(rackProducts).flat() as any[];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const q = query.toLowerCase();
    const results = allProducts.filter((p: any) =>
      p.productName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q)
    ).slice(0, 8);
    setSearchResults(results);
    setShowDropdown(true);
  };

  const handleSelectProduct = (product: any) => {
    const rack = racks.find((r: any) => r._id === product.rackId);
    if (rack) {
      setSelectedRack(rack);
      setHighlightedRackId(rack._id);
      setHighlightedProductId(product._id);
      setTimeout(() => { setHighlightedRackId(null); setHighlightedProductId(null); }, 20000);
    }
    setSearchQuery(product.productName);
    setShowDropdown(false);
  };

  const handleRackClick = (rack: any) => {
    setSelectedRack(rack);
    setHighlightedRackId(null);
    setHighlightedProductId(null);
  };

  const clearSearch = () => {
    setSearchQuery(''); setSearchResults([]); setShowDropdown(false);
    setHighlightedRackId(null); setHighlightedProductId(null);
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
            <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.2} />
          </Plane>

          {[
            [[0.2, 4, shopDimensions.depth], [-shopDimensions.width/2, 2, 0]],
            [[0.2, 4, shopDimensions.depth], [shopDimensions.width/2, 2, 0]],
            [[shopDimensions.width, 4, 0.2], [0, 2, -shopDimensions.depth/2]],
            [[shopDimensions.width, 4, 0.2], [0, 2, shopDimensions.depth/2]],
          ].map(([args, pos], i) => (
            <Box key={i} args={args as any} position={pos as any}>
              <meshStandardMaterial color="#94a3b8" transparent opacity={0.08} depthWrite={false} />
            </Box>
          ))}

          <gridHelper args={[shopDimensions.width, Math.floor(shopDimensions.width/2), '#334155', '#1e293b']} position={[0, 0.01, 0]} />

          {doors.map((door: any) => (
            <group key={door._id} position={[door.positionX, (door.height || 2.5)/2, door.positionZ]} rotation={[0, (door.rotation || 0) * Math.PI / 180, 0]}>
              <Box args={[door.width || 1.5, door.height || 2.5, 0.1]}>
                <meshStandardMaterial color={door.doorType === 'entry' ? '#10b981' : '#ef4444'} transparent opacity={0.7} />
              </Box>
              <Text position={[0, (door.height || 2.5)/2 + 0.4, 0]} fontSize={0.3} color="white" fontWeight="bold" anchorY="bottom">
                {door.doorType === 'entry' ? 'ENTRY' : 'EXIT'}
              </Text>
            </group>
          ))}

          {racks.map((rack: any, idx: number) => (
            <Rack3D
              key={rack._id}
              rack={rack}
              products={rackProducts[rack._id] || []}
              onClick={handleRackClick}
              highlighted={highlightedRackId === rack._id}
              searchActive={searchActive && highlightedRackId !== rack._id}
              highlightedProductId={highlightedProductId}
              rackColor={RACK_COLORS[idx % RACK_COLORS.length]}
              onProductClick={(p: any) => { setSelectedProduct(p); setSelectedRack(racks.find((r: any) => r._id === p.rackId)); }}
            />
          ))}

          <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={60} enableDamping dampingFactor={0.05} />
        </Canvas>

        {/* Top-left info */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '8px 12px' : '12px 16px', borderRadius: '12px' }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: isMobile ? '13px' : '14px' }}>3D Shop View</h3>
          {!isMobile && <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '11px' }}>Click rack • Drag to rotate • Scroll to zoom</p>}
        </div>

        {/* Search bar */}
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: isMobile ? '70vw' : '360px', zIndex: 10 }}>
          <div style={{ position: 'relative' }}>
            <input
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              placeholder="🔍 Search products..."
              style={{ width: '100%', padding: '10px 36px 10px 16px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
            {searchQuery && (
              <button onClick={clearSearch} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            )}
          </div>
          {showDropdown && searchResults.length > 0 && (
            <div style={{ marginTop: '4px', background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
              {searchResults.map((p: any) => {
                const rack = racks.find((r: any) => r._id === p.rackId);
                return (
                  <div key={p._id} onClick={() => handleSelectProduct(p)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{p.productName}</div>
                      <div style={{ color: '#64748b', fontSize: '11px' }}>{p.category}{rack ? ` • ${rack.rackName}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#22c55e', fontSize: '12px', fontWeight: '700' }}>₹{p.price}</div>
                      <div style={{ color: p.quantity < (p.minStockLevel || 10) ? '#ef4444' : '#94a3b8', fontSize: '11px' }}>Qty: {p.quantity}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {showDropdown && searchResults.length === 0 && searchQuery.trim() && (
            <div style={{ marginTop: '4px', background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', color: '#64748b', fontSize: '13px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>No products found</div>
          )}
        </div>

        {/* Found banner */}
        {searchActive && (
          <div style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '30px', zIndex: 10, fontSize: '13px', fontWeight: '600', boxShadow: '0 4px 15px rgba(16,185,129,0.4)', whiteSpace: 'nowrap' }}>
            📍 Found in {racks.find((r: any) => r._id === highlightedRackId)?.rackName}
          </div>
        )}
      </div>

      {/* Side panel */}
      {(selectedRack || selectedProduct) && (
        <div style={{ width: isMobile ? '100%' : '340px', maxHeight: isMobile ? '45vh' : 'unset', padding: '16px', background: 'rgba(15,23,42,0.97)', borderTop: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none', borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ color: selectedRack ? RACK_COLORS[racks.findIndex((r: any) => r._id === selectedRack._id) % RACK_COLORS.length] : 'white', margin: 0, fontSize: '18px' }}>
              {selectedRack?.rackName || 'Product Detail'}
            </h2>
            <button onClick={() => { setSelectedRack(null); setSelectedProduct(null); }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', padding: '6px 10px', cursor: 'pointer', fontSize: '12px' }}>✕ Close</button>
          </div>

          {selectedRack && (
            <>
              <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', padding: '14px', borderRadius: '10px', marginBottom: '14px' }}>
                <p style={{ color: '#cbd5e1', margin: '4px 0', fontSize: '13px' }}><strong style={{ color: 'white' }}>Dimensions:</strong> {selectedRack.width || 2}m × {selectedRack.height || 3}m</p>
                <p style={{ color: '#cbd5e1', margin: '4px 0', fontSize: '13px' }}><strong style={{ color: 'white' }}>Shelves:</strong> {selectedRack.shelves || 4} &nbsp; <strong style={{ color: 'white' }}>Columns:</strong> {selectedRack.columns || 3}</p>
                <p style={{ color: '#cbd5e1', margin: '4px 0', fontSize: '13px' }}><strong style={{ color: 'white' }}>Status:</strong> <span style={{ color: selectedRack.status === 'lowStock' ? '#f45c43' : selectedRack.status === 'expiring' ? '#ffaa00' : '#10b981' }}>{selectedRack.status || 'normal'}</span></p>
              </div>

              <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>Products ({(rackProducts[selectedRack._id] || []).length})</h3>
              {(rackProducts[selectedRack._id] || []).map((product: any, index: number) => {
                const isHighlighted = highlightedProductId === product._id;
                return (
                  <div key={product._id} onClick={() => setSelectedProduct(product)}
                    style={{ background: isHighlighted ? 'rgba(34,197,94,0.12)' : 'rgba(30,41,59,0.8)', padding: '12px', margin: '8px 0', borderRadius: '10px', borderLeft: `4px solid ${isHighlighted ? '#22c55e' : product.quantity < 5 ? '#ef4444' : '#10b981'}`, boxShadow: isHighlighted ? '0 0 12px rgba(34,197,94,0.3)' : 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    {isHighlighted && <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700', marginBottom: '4px' }}>✓ FOUND</div>}
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'white', marginBottom: '4px' }}>{product.productName}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                      <div>Qty: <strong style={{ color: product.quantity < 5 ? '#ef4444' : 'white' }}>{product.quantity}</strong></div>
                      <div style={{ color: '#22c55e', fontWeight: '700' }}>₹{product.price}</div>
                      <div>Shelf {Math.floor(index / (selectedRack.columns || 3)) + 1}, Col {(index % (selectedRack.columns || 3)) + 1}</div>
                      <div>{product.category}</div>
                    </div>
                  </div>
                );
              })}
              {(rackProducts[selectedRack._id] || []).length === 0 && (
                <div style={{ background: 'rgba(30,41,59,0.6)', padding: '20px', borderRadius: '10px', textAlign: 'center', color: '#64748b' }}>No products in this rack</div>
              )}
            </>
          )}

          {selectedProduct && !selectedRack && (
            <div style={{ background: 'rgba(30,41,59,0.8)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ color: '#22c55e', fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>₹{selectedProduct.price}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}><div style={{ color: '#64748b', fontSize: '11px' }}>Category</div><div style={{ color: 'white' }}>{selectedProduct.category}</div></div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}><div style={{ color: '#64748b', fontSize: '11px' }}>Stock</div><div style={{ color: selectedProduct.quantity < 5 ? '#ef4444' : 'white', fontWeight: '700' }}>{selectedProduct.quantity} units</div></div>
                {selectedProduct.brand && <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}><div style={{ color: '#64748b', fontSize: '11px' }}>Brand</div><div style={{ color: 'white' }}>{selectedProduct.brand}</div></div>}
                {selectedProduct.size && <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px', borderRadius: '8px' }}><div style={{ color: '#64748b', fontSize: '11px' }}>Size</div><div style={{ color: 'white' }}>{selectedProduct.size}</div></div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopView3D;
