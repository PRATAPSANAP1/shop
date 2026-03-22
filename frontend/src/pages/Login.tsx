// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { motion } from 'framer-motion';
import { Store, ArrowRight, CheckCircle2, User, ShoppingBag, Phone, Mail, Lock } from 'lucide-react';
import { AuthContext } from '../App';

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  (window as any).__showToast?.(msg, type);
};

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', shopName: '', mobile: '' });
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);
  const navigate = useNavigate();
  const { isAuth, setIsAuth } = React.useContext(AuthContext);

  React.useEffect(() => {
    if (isAuth) {
      navigate('/admin/home');
    }
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isAuth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await (isRegister ? register(formData) : login(formData));
      setIsAuth(true);
      showToast(isRegister ? 'Account created! Welcome' : 'Welcome back!', 'success');
      navigate('/admin/home');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', position: 'relative', overflow: 'hidden'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1,
          background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px',
          padding: isMobile ? '32px 20px' : '50px 40px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              padding: '18px', borderRadius: '22px',
              boxShadow: '0 12px 30px rgba(79,70,229,0.35)'
            }}
          >
            <Store size={44} color="white" />
          </motion.div>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: '26px', fontWeight: '800', color: '#f1f5f9', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '36px' }}>
          {isRegister ? 'Set up your shop management account' : 'Sign in to your admin panel'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <>
              <div style={{ position: 'relative' }}>
                {!isMobile && <User size={17} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />}
                <input type="text" placeholder="Full Name" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="login-input"
                  style={{ width: '100%', padding: isMobile ? '14px 18px' : '14px 14px 14px 44px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px' }}
                  required />
              </div>
              <div style={{ position: 'relative' }}>
                {!isMobile && <ShoppingBag size={17} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />}
                <input type="text" placeholder="Shop Name" value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="login-input"
                  style={{ width: '100%', padding: isMobile ? '14px 18px' : '14px 14px 14px 44px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px' }}
                  required />
              </div>
              <div style={{ position: 'relative' }}>
                {!isMobile && <Phone size={17} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />}
                <input type="tel" placeholder="Mobile Number" value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="login-input"
                  style={{ width: '100%', padding: isMobile ? '14px 18px' : '14px 14px 14px 44px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px' }}
                  required />
              </div>
            </>
          )}

          <div style={{ position: 'relative' }}>
            {!isMobile && <Mail size={17} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />}
            <input type="email" placeholder="Email Address" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="login-input"
              style={{ width: '100%', padding: isMobile ? '14px 18px' : '14px 14px 14px 44px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px' }}
              required />
          </div>

          <div style={{ position: 'relative' }}>
            {!isMobile && <Lock size={17} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />}
            <input type="password" placeholder="Password" value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="login-input"
              style={{ width: '100%', padding: isMobile ? '14px 18px' : '14px 14px 14px 44px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px' }}
              required />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(79,70,229,0.45)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            style={{
              marginTop: '8px', padding: '16px', borderRadius: '14px', border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: 'white', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Please wait...' : isRegister ? ' Create Account' : ' Sign In'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <span
            onClick={() => setIsRegister(!isRegister)}
            style={{ color: '#818cf8', cursor: 'pointer', marginLeft: '6px', fontWeight: '600' }}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
