import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Bell, Box as BoxIcon, Package, Layers, Maximize, User, LogOut, Menu, X, Store, CheckCircle, XCircle, TrendingUp, Home as HomeIcon } from 'lucide-react';

type ToastType = 'success' | 'error';
interface Toast { id: number; message: string; type: ToastType; }
interface ToastContextType { showToast: (message: string, type?: ToastType) => void; }

export const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

interface AuthContextType { isAuth: boolean; setIsAuth: (v: boolean) => void; authChecked: boolean; }
const defaultSetIsAuth = (_v: boolean) => {};
export const AuthContext = createContext<AuthContextType>({ isAuth: false, setIsAuth: defaultSetIsAuth, authChecked: false });
export const useAuth = () => useContext(AuthContext);

const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  useEffect(() => { (window as any).__showToast = showToast; }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '14px 18px', borderRadius: '14px', minWidth: '260px', maxWidth: '360px',
                pointerEvents: 'auto', cursor: 'default',
                background: toast.type === 'success'
                  ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                  : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                boxShadow: toast.type === 'success'
                  ? '0 8px 25px rgba(16,185,129,0.4)'
                  : '0 8px 25px rgba(239,68,68,0.4)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', fontWeight: '600', fontSize: '14px'
              }}
            >
              {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Racks from './pages/Racks';
import ShopView3D from './components/ShopView3D';
import ShopBuilder from './components/ShopBuilder';
import CustomerSearch from './pages/CustomerSearch';
import Notifications from './pages/Notifications';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import SmartStore from './pages/SmartStore';
import { getMe, logout, heartbeat } from './services/api';

const SidebarLink = ({ to, icon: Icon, children, onClick }: { to: string, icon: any, children: React.ReactNode, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
        whileTap={{ scale: 0.98 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
          marginBottom: '8px', borderRadius: '12px',
          background: isActive ? 'linear-gradient(135deg, rgba(79,70,229,0.8) 0%, rgba(59,130,246,0.8) 100%)' : 'transparent',
          color: isActive ? 'white' : '#cbd5e1',
          fontWeight: isActive ? '600' : '400',
          transition: 'color 0.2s',
          border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
        }}
      >
        <Icon size={20} color={isActive ? 'white' : '#94a3b8'} />
        {children}
      </motion.div>
    </Link>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuth, authChecked } = useAuth();
  if (!authChecked) return <div style={{ minHeight: '100vh', background: '#0f172a' }} />;
  if (isAuth) return <Navigate to="/admin/home" replace />;
  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isAuth, authChecked } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  if (!authChecked) return <div style={{ minHeight: '100vh', background: '#0f172a' }} />;
  if (!isAuth) return <Navigate to="/admin/login" replace />;

  const sidebarContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 10px' }}>
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
          <Store size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '-0.5px', margin: 0 }}>Admin Panel</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SidebarLink to="/admin/home" icon={HomeIcon}>Home</SidebarLink>
        <SidebarLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
        <SidebarLink to="/admin/notifications" icon={Bell}>Notifications</SidebarLink>
        <SidebarLink to="/admin/shop-builder" icon={BoxIcon}>Shop Builder</SidebarLink>
        <SidebarLink to="/admin/products" icon={Package}>Products</SidebarLink>
        <SidebarLink to="/admin/racks" icon={Layers}>Racks</SidebarLink>
        <SidebarLink to="/admin/scanner" icon={Maximize}>Scanner</SidebarLink>
        <SidebarLink to="/admin/smartstore" icon={TrendingUp}>SmartStore AI</SidebarLink>
        <SidebarLink to="/admin/profile" icon={User}>Profile</SidebarLink>
      </div>
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(239,68,68,0.2)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { logout().finally(() => { window.location.href = '/admin/login'; }); }}
        style={{
          marginTop: '20px', width: '100%', padding: '14px', borderRadius: '12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px', cursor: 'pointer'
        }}
      >
        <LogOut size={18} /> Logout
      </motion.button>
    </>
  );

  return (
    <>
      <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', maxWidth: '100vw', overflowX: 'hidden' }}>
        {!isMobile && (
          <motion.nav
            initial={{ x: -300 }} animate={{ x: 0 }}
            className="glass-panel"
            style={{ width: '260px', minWidth: '260px', margin: '15px', padding: '25px 20px', display: 'flex', flexDirection: 'column', zIndex: 40, overflow: 'hidden' }}
          >
            {sidebarContent}
          </motion.nav>
        )}

        {isMobile && (
          <div className="glass-panel mobile-header" style={{ position: 'fixed', top: 'env(safe-area-inset-top)', left: 0, right: 0, height: '46px', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <Store size={16} color="#818cf8" style={{ flexShrink: 0 }} />
              <h2 style={{ fontSize: '14px', margin: 0, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin Panel</h2>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', padding: '5px', display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Menu size={18} />
            </button>
          </div>
        )}

        <div style={{
          flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden', scrollBehavior: 'smooth',
          padding: isMobile ? 'calc(env(safe-area-inset-top) + 65px) 0 0 0' : '15px 15px 15px 0',
          display: 'flex', flexDirection: 'column'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 200 }}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: 0, left: 0, width: 'min(80vw, 260px)', height: '100vh',
                padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 210,
                borderRadius: '0 20px 20px 0', boxSizing: 'border-box',
                background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)', boxShadow: '4px 0 40px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
                    <Store size={20} color="white" />
                  </div>
                  <span style={{ fontSize: '17px', fontWeight: '700', color: 'white' }}>Admin Panel</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#94a3b8', padding: '7px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <SidebarLink to="/admin/home" icon={HomeIcon}>Home</SidebarLink>
                <SidebarLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
                <SidebarLink to="/admin/notifications" icon={Bell}>Notifications</SidebarLink>
                <SidebarLink to="/admin/shop-builder" icon={BoxIcon}>Shop Builder</SidebarLink>
                <SidebarLink to="/admin/products" icon={Package}>Products</SidebarLink>
                <SidebarLink to="/admin/racks" icon={Layers}>Racks</SidebarLink>
                <SidebarLink to="/admin/scanner" icon={Maximize}>Scanner</SidebarLink>
                <SidebarLink to="/admin/smartstore" icon={TrendingUp}>SmartStore AI</SidebarLink>
                <SidebarLink to="/admin/profile" icon={User}>Profile</SidebarLink>
              </div>
              <button
                onClick={() => { logout().finally(() => { window.location.href = '/admin/login'; }); }}
                style={{ marginTop: '20px', width: '100%', padding: '13px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0 }}
              >
                <LogOut size={18} /> Logout
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    getMe()
      .then(({ data }) => setIsAuth(!!data))
      .catch(() => setIsAuth(false))
      .finally(() => setAuthChecked(true));
  }, []);

  // Heartbeat + inactivity logout (5 min, tab-switch safe)
  useEffect(() => {
    if (!isAuth) return;

    const TIMEOUT = 5 * 60 * 1000;
    const KEY = 'lastActive';

    const doLogout = () => {
      logout().finally(() => {
        setIsAuth(false);
        window.location.href = '/admin/login';
      });
    };

    const setLastActive = () => localStorage.setItem(KEY, String(Date.now()));

    const heartbeatInterval = setInterval(() => heartbeat().catch(() => {}), 2 * 60 * 1000);

    const checkInterval = setInterval(() => {
      if (document.hidden) return;
      const last = Number(localStorage.getItem(KEY) || 0);
      if (last && Date.now() - last > TIMEOUT) doLogout();
    }, 1000);

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, setLastActive));

    const onVisibilityChange = () => { if (!document.hidden) setLastActive(); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    setLastActive();

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(checkInterval);
      events.forEach(e => window.removeEventListener(e, setLastActive));
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuth]);

  return <AuthContext.Provider value={{ isAuth, setIsAuth, authChecked }}>{children}</AuthContext.Provider>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="animated-bg">
          {[...Array(12)].map((_, i) => <span key={i} />)}
        </div>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '50%', height: '50%', background: 'rgba(79,70,229,0.12)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '50%', height: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<CustomerSearch />} />
          <Route path="/search" element={<CustomerSearch />} />
          <Route path="/admin" element={<Navigate to="/admin/home" replace />} />
          <Route path="/admin/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/admin/home" element={<Layout><ShopView3D /></Layout>} />
          <Route path="/admin/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/admin/notifications" element={<Layout><Notifications /></Layout>} />
          <Route path="/admin/shop-builder" element={<Layout><ShopBuilder /></Layout>} />
          <Route path="/admin/products" element={<Layout><Products /></Layout>} />
          <Route path="/admin/racks" element={<Layout><Racks /></Layout>} />
          <Route path="/admin/scanner" element={<Layout><Scanner /></Layout>} />
          <Route path="/admin/smartstore" element={<Layout><SmartStore /></Layout>} />
          <Route path="/admin/profile" element={<Layout><Profile /></Layout>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
