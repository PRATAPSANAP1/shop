// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { motion } from 'framer-motion';
import { Store, Mail, Phone, Lock, User } from 'lucide-react';
const showToast = (msg: string, type: 'success' | 'error' = 'success') => (window as any).__showToast?.(msg, type);

const fields = [
  { key: 'shopName', label: 'Shop Name',     type: 'text',     icon: Store,  placeholder: 'Your shop name',      required: true },
  { key: 'email',    label: 'Email',          type: 'email',    icon: Mail,   placeholder: 'Your email address',   required: true },
  { key: 'mobile',   label: 'Mobile Number',  type: 'tel',      icon: Phone,  placeholder: 'Your mobile number',  required: true },
  { key: 'password', label: 'New Password',  type: 'password', icon: Lock,   placeholder: 'Leave blank to keep current', required: false },
];

const Profile = () => {
  const [formData, setFormData] = useState({ shopName: '', email: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 480);
    window.addEventListener('resize', handleResize);
    loadProfile();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await getProfile();
      setFormData({ shopName: data.shopName, email: data.email, mobile: data.mobile || '', password: '' });
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
      setFormData({ ...formData, password: '' });
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Error updating profile', 'error');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '30px' }}>
      <h1 className="gradient-text" style={{ fontSize: '32px', marginBottom: '30px' }}>Profile</h1>

      <div className="card" style={{ maxWidth: '600px', padding: '30px' }}>
        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div key={f.key} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: '500' }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                {!isMobile && f.icon && <f.icon size={18} color="#6366f1" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }} />}
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={formData[f.key as keyof typeof formData]}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                  className="profile-input"
                  style={{ width: '100%', padding: isMobile ? '12px 16px' : '14px 14px 14px 44px', background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', fontSize: '15px', transition: 'all 0.3s' }}
                  required={f.required}
                />
              </div>
            </div>
          ))}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '8px' }}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
