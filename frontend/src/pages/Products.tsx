// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getProducts, getRacks, createProduct, updateProduct, deleteProduct } from '../services/api';
const showToast = (msg: string, type: 'success' | 'error' = 'success') => (window as any).__showToast?.(msg, type);
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, QrCode, Package, Boxes, X } from 'lucide-react';

const F = ({ label, children, icon: Icon, isMobile }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {!isMobile && Icon && <Icon size={18} color="#4f46e5" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }} />}
      {React.cloneElement(children, {
        style: { ...children.props.style, paddingLeft: !isMobile && Icon ? '44px' : '14px' },
        className: 'profile-input'
      })}
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [racks, setRacks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    productName: '', category: '', price: '', quantity: '', 
    expiryDate: '', rackId: '', shelfNumber: 1, columnNumber: 1, 
    minStockLevel: 10, size: '', weight: '', color: '', brand: '' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 768;
  const isSmall = windowWidth <= 480;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    loadData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getGridCols = () => {
    if (windowWidth <= 480) return '1fr';
    if (windowWidth <= 768) return '1fr 1fr';
    if (windowWidth <= 1024) return 'repeat(3, 1fr)';
    if (windowWidth <= 1440) return 'repeat(4, 1fr)';
    return 'repeat(5, 1fr)';
  };

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [productsRes, racksRes] = await Promise.all([getProducts(), getRacks()]);
      setProducts(productsRes.data);
      setRacks(racksRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ 
        productName: '', category: '', price: '', quantity: '', 
        expiryDate: '', rackId: '', shelfNumber: 1, columnNumber: 1, 
        minStockLevel: 10, size: '', weight: '', color: '', brand: '' 
      });
      showToast(editingProduct ? 'Product updated!' : 'Product added!', 'success');
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Error saving product', 'error');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
      rackId: product.rackId?._id || product.rackId || '',
      shelfNumber: product.shelfNumber || 1,
      columnNumber: product.columnNumber || 1,
      minStockLevel: product.minStockLevel || 10,
      size: product.size || '',
      weight: product.weight || '',
      color: product.color || '',
      brand: product.brand || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadData();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const generateQRCode = async (product: any) => {
    try {
      const url = await QRCode.toDataURL(JSON.stringify({ qrCode: product.qrCode }));
      const pdf = new jsPDF();
      pdf.text(`Product: ${product.productName}`, 10, 10);
      pdf.text(`Category: ${product.category}`, 10, 20);
      pdf.text(`Price: ${product.price}`, 10, 30);
      pdf.addImage(url, 'PNG', 10, 40, 50, 50);
      pdf.save(`${product.productName}_QR.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === '' || p.category === filterCategory)
  );

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div style={{ padding: isMobile ? '20px 15px' : '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '20px', marginBottom: '30px' }}>
        <h1 className="gradient-text" style={{ fontSize: isMobile ? '28px' : '32px', margin: 0, fontWeight: '800' }}>Product Inventory</h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="glass-panel"
          style={{ 
            width: isMobile ? '100%' : 'auto',
            padding: '12px 24px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', 
            color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600',
            boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)'
          }}
        >
          <Plus size={20} /> Add Product
        </motion.button>
      </div>

      <div className="glass-panel" style={{ padding: isMobile ? '12px' : '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          {!isMobile && <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />}
          <input 
            type="text" 
            placeholder={isMobile ? "Search products..." : "      Search name or category"} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: isMobile ? '14px 18px' : '14px 14px 14px 50px', 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '14px', 
              color: 'white',
              fontSize: '15px'
            }} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Filter size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
          {['', ...categories].map(cat => (
            <button
              key={cat || '__all__'}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: '7px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', border: '1px solid',
                transition: 'all 0.2s',
                background: filterCategory === cat
                  ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)'
                  : 'rgba(255,255,255,0.05)',
                borderColor: filterCategory === cat ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)',
                color: filterCategory === cat ? 'white' : '#94a3b8',
                boxShadow: filterCategory === cat ? '0 4px 12px rgba(79,70,229,0.3)' : 'none',
              }}
            >
              {cat === '' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: getGridCols(), gap: isMobile ? '14px' : '20px' }}>
        {loading
          ? [...Array(getGridCols().split(',').length * 2)].map((_, i) => (
              <div key={i} className="glass-panel" style={{ padding: isMobile ? '16px' : '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: '18px', width: '70%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '13px', width: '40%' }} />
                  </div>
                  <div className="skeleton" style={{ width: '48px', height: '24px', borderRadius: '20px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                  <div className="skeleton" style={{ height: '52px' }} />
                  <div className="skeleton" style={{ height: '52px' }} />
                </div>
                <div className="skeleton" style={{ height: '36px', borderRadius: '8px' }} />
              </div>
            ))
          : <AnimatePresence>
          {filteredProducts.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product._id}
              className="glass-panel"
              style={{ padding: isMobile ? '16px' : '24px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                  <h3 style={{ fontSize: isMobile ? '15px' : '18px', color: 'white', margin: '0 0 4px 0', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.productName}</h3>
                  <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category}</span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: '#10b981' }}>₹{product.price}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Quantity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Package size={13} color="#3b82f6" />
                    <span style={{ fontWeight: '700', fontSize: '13px', color: product.quantity < (product.minStockLevel || 10) ? '#ef4444' : 'white' }}>
                      {product.quantity} units
                    </span>
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Location</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Boxes size={13} color="#818cf8" />
                    <span style={{ fontWeight: '600', fontSize: '13px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.rackId?.rackName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => handleEdit(product)}
                  style={{ flex: 1, padding: '9px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '13px' }}
                >
                  <Edit size={14} /> Edit
                </motion.button>
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                  onClick={() => generateQRCode(product)}
                  style={{ flex: 1, padding: '9px 6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '13px' }}
                >
                  <QrCode size={14} /> QR
                </motion.button>
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={() => handleDelete(product._id)}
                  style={{ padding: '9px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        }
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '20px' }}>
          <motion.div 
            initial={{ opacity: 0, scale: isMobile ? 1 : 0.9, y: isMobile ? 60 : 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: isMobile ? '100%' : '800px', maxHeight: isMobile ? '92vh' : '90vh', overflowY: 'auto', padding: isMobile ? '24px 16px' : '40px', borderRadius: isMobile ? '24px 24px 0 0' : '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: isMobile ? '20px' : '26px', color: 'white', margin: 0 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                      <F label="Product Name" icon={Package} isMobile={isMobile}>
                        <input type="text" required placeholder="e.g. Whole Milk" value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                      </F>
                    </div>
                    <F label="Category" isMobile={isMobile}>
                      <input type="text" required placeholder="e.g. Dairy" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <F label="Price (₹)" isMobile={isMobile}>
                      <input type="number" step="0.01" required placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <F label="Quantity" isMobile={isMobile}>
                      <input type="number" required placeholder="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <F label="Min Stock Level" isMobile={isMobile}>
                      <input type="number" required placeholder="10" value={formData.minStockLevel} onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <div>
                      <label style={{ display: 'block', color: '#94a3b8', marginBottom: '6px', fontSize: '13px' }}>Rack Placement</label>
                      <select required value={formData.rackId} onChange={(e) => setFormData({ ...formData, rackId: e.target.value })} className="profile-input" style={{ width: '100%', padding: '12px', background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }}>
                        <option value="">Select a Rack</option>
                        {racks.map(rack => <option key={rack._id} value={rack._id}>{rack.rackName}</option>)}
                      </select>
                    </div>
                    <F label="Shelf Number" isMobile={isMobile}>
                      <input type="number" placeholder="1" value={formData.shelfNumber} onChange={(e) => setFormData({ ...formData, shelfNumber: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <F label="Column Number" isMobile={isMobile}>
                      <input type="number" placeholder="1" value={formData.columnNumber} onChange={(e) => setFormData({ ...formData, columnNumber: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <F label="Expiry Date" isMobile={isMobile}>
                      <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <F label="Brand (optional)" isMobile={isMobile}>
                      <input type="text" placeholder="e.g. Amul" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <F label="Size (optional)" isMobile={isMobile}>
                      <input type="text" placeholder="e.g. 500ml" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white' }} />
                    </F>
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2', marginTop: '8px', display: 'flex', gap: '12px' }}>
                      <button type="submit" style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
                        {editingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                      <button type="button" onClick={() => setShowForm(false)} style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', cursor: 'pointer' }}>Cancel</button>
                    </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Products;
