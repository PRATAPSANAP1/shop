// @ts-nocheck
import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Text, Plane } from '@react-three/drei';
import API from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Store, MapPin, Package, AlertCircle, X, ChevronRight } from 'lucide-react';
const showToast = (msg: string, type: 'success' | 'error' = 'success') => (window as any).__showToast?.(msg, type);

interface ShopConfig {
  width: number;
  depth: number;
}

interface Door {
  _id: string;
  positionX: number;
  positionZ: number;
  width?: number;
  height?: number;
  rotation?: number;
  doorType: 'entry' | 'exit';
}

interface Rack {
  _id: string;
  rackName: string;
  positionX: number;
  positionY?: number;
  positionZ: number;
  width?: number;
  height?: number;
  rotation?: number;
  shelves?: number;
  columns?: number;
}

interface Product {
  _id: string;
  productName: string;
  quantity: number;
  price: number;
  category: string;
  shelfNumber?: number;
  columnNumber?: number;
  size?: string;
  weight?: string;
  color?: string;
  brand?: string;
  expiryDate?: string;
  rackId?: Rack;
}

// Glowing product box
const GlowBox = ({ args, color, glow, dimmed }: any) => {
  const ref = useRef<any>();
  useFrame(({ clock }) => {
    if (ref.current && glow) {
      ref.current.emissiveIntensity = 1.5 + Math.sin(clock.getElapsedTime() * 4) * 1.0;
    }
  });
  return (
    <Box args={args} castShadow>
      <meshStandardMaterial ref={ref} color={glow ? '#22c55e' : dimmed ? '#1e293b' : color} emissive={glow ? '#22c55e' : color} emissiveIntensity={glow ? 1.5 : dimmed ? 0 : 0.2} transparent opacity={dimmed ? 0.15 : 1} />
    </Box>
  );
};

// Bouncing arrow above rack
const BouncingArrow = ({ height, rackName }: any) => {
  const ref = useRef<any>();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = height / 2 + 1.2 + Math.sin(clock.getElapsedTime() * 3) * 0.25;
    }
  });
  return (
    <group ref={ref}>
      {/* Arrow head pointing down */}
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      {/* Arrow stem */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
      <Text position={[0, 1.1, 0]} fontSize={0.25} color="#22c55e" fontWeight="bold" anchorX="center" anchorY="bottom">
        {rackName}
      </Text>
    </group>
  );
};

const SupermarketRack = ({ rack, products, isHighlighted, highlightedProductId, setSelectedProduct, searchActive, clickedProductId }: any) => {
  const width = rack.width || 2;
  const height = rack.height || 3;
  const depth = 0.3;
  const shelves = rack.shelves || 4;
  const columns = rack.columns || 3;
  const shelfHeight = height / shelves;
  const columnWidth = width / columns;
  const boxColors = ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8'];

  return (
    <group position={[rack.positionX, rack.positionY || 0, rack.positionZ]} rotation={[0, (rack.rotation || 0) * Math.PI / 180, 0]}>
      <Box args={[width, height, depth]} castShadow>
        <meshStandardMaterial color="#f1f5f9" transparent opacity={searchActive && !isHighlighted ? 0.04 : 0.08} depthWrite={false} />
      </Box>

      <group position={[0, height / 2 + 0.3, 0.16]}>
        <Box args={[width * 0.9, 0.4, 0.05]}>
          <meshStandardMaterial color={searchActive && !isHighlighted ? '#334155' : rack.color || '#4f46e5'} emissive={searchActive && !isHighlighted ? '#000' : rack.color || '#4f46e5'} emissiveIntensity={searchActive && !isHighlighted ? 0 : 0.3} />
        </Box>
        <Text position={[0, 0, 0.03]} fontSize={0.2} color={searchActive && !isHighlighted ? '#475569' : 'white'} fontWeight="900" anchorX="center" anchorY="middle">
          {rack.rackName.toUpperCase()}
        </Text>
      </group>

      {Array.from({ length: shelves }).map((_, shelfIndex) => {
        const shelfY = -height / 2 + shelfHeight * (shelfIndex + 0.5);
        return (
          <group key={`shelf-${shelfIndex}`}>
            <Plane args={[width, depth]} position={[0, shelfY - shelfHeight/2, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
              <meshStandardMaterial color="#cbd5e1" transparent opacity={0.1} depthWrite={false} />
            </Plane>
          </group>
        );
      })}

      {products.slice(0, 3).map((product: Product, index: number) => {
        const shelfIndex = (product.shelfNumber || 1) - 1;
        const columnIndex = (product.columnNumber || 1) - 1;
        if (shelfIndex >= shelves || shelfIndex < 0 || columnIndex >= columns || columnIndex < 0) return null;

        const productX = -width / 2 + columnWidth * (columnIndex + 0.5);
        const productY = -height / 2 + shelfHeight * (shelfIndex + 0.5);
        const productSize = [columnWidth * 0.7, shelfHeight * 0.6, 0.2] as [number, number, number];
        const productColors = ['#f97316','#8b5cf6','#06b6d4','#ec4899','#10b981','#f59e0b','#3b82f6','#ef4444'];
        const isProductHighlighted = highlightedProductId === product._id;
        const isClicked = clickedProductId === product._id;
        const productColor = isProductHighlighted ? '#22c55e' : isClicked ? '#f59e0b' : productColors[index % productColors.length];
        const shouldDim = searchActive && !isProductHighlighted && !isClicked;

        return (
          <group key={product._id} position={[productX, productY, 0.15]} onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}>
            <GlowBox args={productSize} color={productColor} glow={isProductHighlighted || isClicked} dimmed={shouldDim} />
            <Text position={[0, productSize[1]/2 + 0.08, 0.12]} fontSize={0.12} color="white" fontWeight="bold" anchorX="center" anchorY="bottom" maxWidth={productSize[0]}>
              {product.productName}
            </Text>
          </group>
        );
      })}

      {/* Bouncing arrow above rack when highlighted */}
      {isHighlighted && <BouncingArrow height={height} rackName={rack.rackName} />}
    </group>
  );
};

const CustomerSearch: React.FC = () => {
  const [shopName, setShopName] = useState('');
  const [shopSelected, setShopSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shopConfig, setShopConfig] = useState<ShopConfig>({ width: 30, depth: 20 });
  const [doors, setDoors] = useState<Door[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [rackProducts, setRackProducts] = useState<Record<string, Product[]>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [clickedProductId, setClickedProductId] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [shopSuggestions, setShopSuggestions] = useState<string[]>([]);
  const [allShopNames, setAllShopNames] = useState<string[]>([]);
  const [showShopDropdown, setShowShopDropdown] = useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    API.get('/shop-config/public/shops/list')
      .then(({ data }) => setAllShopNames(data))
      .catch(() => {});
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleShopNameInput = (value: string) => {
    setShopName(value);
    if (value.trim()) {
      const filtered = allShopNames.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setShopSuggestions(filtered);
      setShowShopDropdown(filtered.length > 0);
    } else {
      setShopSuggestions([]);
      setShowShopDropdown(false);
    }
  };

  const handleShopSelect = async () => {
    if (!shopName) return;
    setIsLoading(true);
    try {
      const [configRes, doorsRes, racksRes] = await Promise.all([
        API.get(`/shop-config/public/${shopName}`),
        API.get(`/doors/public/${shopName}`),
        API.get(`/public/racks/${shopName}`)
      ]);
      setShopConfig(configRes.data.config);
      setDoors(doorsRes.data);
      setRacks(racksRes.data);

      const productsMap: Record<string, Product[]> = {};
      const allProductsList: Product[] = [];
      for (const rack of racksRes.data) {
        try {
          const { data } = await API.get(`/public/products/rack/${rack._id}`);
          productsMap[rack._id] = data;
          allProductsList.push(...data);
        } catch (error) {
          productsMap[rack._id] = [];
        }
      }
      setRackProducts(productsMap);
      setAllProducts(allProductsList);
      setShopSelected(true);
    } catch (error) {
      showToast('Shop not found! Please check the name and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setClickedProductId(product._id);
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      setFoundProduct(null);
      setNotFound(false);
      setShowArrow(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await API.get(`/public/search?query=${searchQuery}&shopName=${shopName}`);
      if (data.length > 0) {
        setFoundProduct(data[0]);
        setNotFound(false);
        setShowArrow(true);
        setFilteredProducts([]);
        setTimeout(() => setShowArrow(false), 20000); 
      } else {
        setFoundProduct(null);
        setNotFound(true);
        setShowArrow(false);
      }
    } catch (error) {
      setNotFound(true);
      setShowArrow(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    setNotFound(false);
    if (value.trim()) {
      const filtered = allProducts.filter(p =>
        p.productName.toLowerCase().includes(value.toLowerCase()) ||
        p.category.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
      setFoundProduct(null);
      setShowArrow(false);
    }
  };

  if (!shopSelected) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="card"
          style={{ 
            width: '100%', 
            maxWidth: '420px', 
            padding: '50px 30px', 
            position: 'relative', 
            zIndex: 1,
            background: '#1e293b',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', padding: '20px', borderRadius: '24px', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)' }}
            >
              <Store size={56} color="white" />
            </motion.div>
          </div>
          <h1 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.5px' }}>Explore Store</h1>
          <p style={{ color: '#94a3b8', marginBottom: '35px', fontSize: '15px' }}>Enter the shop name to start your 3D journey</p>
          
          <div style={{ position: 'relative', marginBottom: '25px' }}>
            {!isMobile && <MapPin size={22} color="#4f46e5" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8, zIndex: 1 }} />}
            <input
              type="text"
              placeholder={isMobile ? "e.g. freshmart" : "      e.g. freshmart"}
              value={shopName}
              onChange={(e) => handleShopNameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleShopSelect()}
              onFocus={() => {
                if (shopName.trim() && shopSuggestions.length > 0) setShowShopDropdown(true);
                else if (!shopName.trim() && allShopNames.length > 0) { setShopSuggestions(allShopNames); setShowShopDropdown(true); }
              }}
              onBlur={() => setTimeout(() => setShowShopDropdown(false), 150)}
              style={{ 
                width: '100%', padding: isMobile ? '16px 18px' : '18px 18px 18px 55px', borderRadius: '14px', 
                border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a', 
                color: '#f1f5f9', fontSize: '16px', outline: 'none', transition: 'all 0.3s'
              }}
            />
            <AnimatePresence>
              {showShopDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}
                >
                  {shopSuggestions.map((name) => (
                    <div
                      key={name}
                      onMouseDown={() => { setShopName(name); setShowShopDropdown(false); }}
                      style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '15px', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(79,70,229,0.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {!isMobile && <Store size={16} color="#818cf8" />}
                      {name}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleShopSelect} 
            disabled={isLoading || !shopName}
            style={{ 
              width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
              background: shopName ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.05)',
              color: 'white', fontSize: '17px', fontWeight: '700', cursor: shopName ? 'pointer' : 'not-allowed',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
              transition: 'all 0.3s'
            }}
          >
            {isLoading ? 'Connecting...' : <>Enter Store <ChevronRight size={20} /></>}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="glass-panel" style={{ margin: isMobile ? '5px' : '10px', padding: isMobile ? '10px' : '15px', display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '15px', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Store size={isMobile ? 20 : 24} color="#818cf8" />
            <h2 style={{ fontSize: isMobile ? '15px' : '18px', margin: 0, fontWeight: '600' }}>{shopName.toUpperCase()}</h2>
          </div>
          <button 
            onClick={() => setShopSelected(false)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: isMobile ? '11px' : '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <X size={14} /> Exit
          </button>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            {!isMobile && <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "      Find a product..."}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{ 
                width: '100%', padding: isMobile ? '12px 18px' : '14px 14px 14px 45px', borderRadius: '10px', 
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', 
                color: 'white', fontSize: isMobile ? '14px' : '16px', outline: 'none'
              }}
              onFocus={(e) => e.target.style.border = '1px solid #818cf8'}
              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
            />
            <AnimatePresence>
              {filteredProducts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel"
                  style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, maxHeight: '250px', overflowY: 'auto' }}
                >
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        setSearchQuery(product.productName);
                        setFilteredProducts([]);
                        handleSearch();
                      }}
                      style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '500', color: 'white', fontSize: '15px' }}>{product.productName}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{product.category} {product.brand ? `• ${product.brand}` : ''}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#818cf8', fontWeight: '600', background: 'rgba(129, 140, 248, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                        {product.rackId?.rackName || 'Unknown'}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch} 
            disabled={isLoading}
            style={{ 
              padding: '0 20px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: 'white', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isLoading ? '...' : <Search size={20} />}
          </motion.button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', margin: '0 10px 10px 10px', borderRadius: '16px', overflow: 'hidden' }}>
        <AnimatePresence>
          {notFound && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', background: '#ef4444', color: 'white', padding: '12px 20px', borderRadius: '30px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}
            >
              <AlertCircle size={18} /> Product not found in store
            </motion.div>
          )}
          {foundProduct && showArrow && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '30px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
            >
              <MapPin size={18} /> Found in {foundProduct.rackId?.rackName}
            </motion.div>
          )}
        </AnimatePresence>

        <Canvas 
          shadows 
          camera={{ 
            position: isMobile ? [0, 30, 25] : [0, 20, 20], 
            fov: isMobile ? 55 : 45 
          }} 
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[15, 20, 10]} intensity={0.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          
          {/* Floor */}
          <Plane args={[shopConfig.width, shopConfig.depth]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.8} />
          </Plane>

          <gridHelper args={[Math.max(shopConfig.width, shopConfig.depth), 20, '#334155', '#1e293b']} position={[0, 0.01, 0]} />

          {/* Walls — sized exactly to shopConfig dimensions */}
          {/* Back wall */}
          <Box args={[shopConfig.width, 4, 0.3]} position={[0, 2, -shopConfig.depth / 2]}>
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.08} depthWrite={false} />
          </Box>
          {/* Front wall */}
          <Box args={[shopConfig.width, 4, 0.3]} position={[0, 2, shopConfig.depth / 2]}>
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.08} depthWrite={false} />
          </Box>
          {/* Left wall */}
          <Box args={[0.3, 4, shopConfig.depth]} position={[-shopConfig.width / 2, 2, 0]}>
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.08} depthWrite={false} />
          </Box>
          {/* Right wall */}
          <Box args={[0.3, 4, shopConfig.depth]} position={[shopConfig.width / 2, 2, 0]}>
            <meshStandardMaterial color="#94a3b8" transparent opacity={0.08} depthWrite={false} />
          </Box>

          {doors.map((door) => (
            <group key={door._id} position={[door.positionX, (door.height || 2.5) / 2, door.positionZ]} rotation={[0, (door.rotation || 0) * Math.PI / 180, 0]}>
              <Box args={[door.width || 1.5, door.height || 2.5, 0.15]}>
                <meshStandardMaterial color={door.doorType === 'entry' ? '#10b981' : '#ef4444'} transparent opacity={0.6} />
              </Box>
              <Text 
                position={[0, (door.height || 2.5) / 2 + 0.5, 0]} 
                fontSize={0.3} 
                color="white" 
                fontWeight="bold"
                anchorY="bottom"
              >
                {door.doorType === 'entry' ? 'ENTRANCE' : 'EXIT'}
              </Text>
            </group>
          ))}

          {racks.map((rack) => (
            <SupermarketRack 
              key={rack._id} 
              rack={rack} 
              products={rackProducts[rack._id] || []} 
              isHighlighted={showArrow && foundProduct && foundProduct.rackId?._id === rack._id} 
              highlightedProductId={foundProduct?._id} 
              setSelectedProduct={handleProductClick}
              searchActive={showArrow}
              clickedProductId={clickedProductId}
            />
          ))}

          <OrbitControls 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={5} 
            maxDistance={40} 
            target={[0, 0, 0]} 
            enableDamping 
            dampingFactor={0.05} 
          />
        </Canvas>

        <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', padding: '8px 12px', borderRadius: '20px', color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Drag to pan & rotate
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100, width: isMobile ? '88vw' : '320px',
              background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px',
              padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.7)'
            }}
          >
            <button onClick={() => { setSelectedProduct(null); setClickedProductId(null); }} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.08)', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              <X size={14} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(79,70,229,0.2)', padding: '10px', borderRadius: '12px', flexShrink: 0 }}>
                <Package size={22} color="#818cf8" />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: '700', fontSize: '15px', lineHeight: 1.2 }}>{selectedProduct.productName}</div>
                <div style={{ color: '#10b981', fontWeight: '600', fontSize: '16px' }}>₹{selectedProduct.price}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ color: '#64748b', marginBottom: '3px' }}>Category</div>
                <div style={{ color: 'white', fontWeight: '500' }}>{selectedProduct.category}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}>
                <div style={{ color: '#64748b', marginBottom: '3px' }}>Stock</div>
                <div style={{ color: selectedProduct.quantity < 5 ? '#ef4444' : 'white', fontWeight: '600' }}>{selectedProduct.quantity} units</div>
              </div>
              <div style={{ background: 'rgba(79,70,229,0.1)', padding: '10px', borderRadius: '10px', gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(79,70,229,0.2)' }}>
                <MapPin size={14} color="#818cf8" />
                <div>
                  <div style={{ color: '#a5b4fc', fontSize: '11px' }}>Location</div>
                  <div style={{ color: 'white', fontWeight: '600' }}>{selectedProduct.rackId?.rackName} • Shelf {selectedProduct.shelfNumber}</div>
                </div>
              </div>
              {selectedProduct.brand && <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}><div style={{ color: '#64748b', marginBottom: '3px' }}>Brand</div><div style={{ color: 'white' }}>{selectedProduct.brand}</div></div>}
              {selectedProduct.size && <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px' }}><div style={{ color: '#64748b', marginBottom: '3px' }}>Size</div><div style={{ color: 'white' }}>{selectedProduct.size}</div></div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

export default CustomerSearch;

