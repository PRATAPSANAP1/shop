// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
const showToast = (msg: string, type: 'success' | 'error' = 'success') => (window as any).__showToast?.(msg, type);

const fields = [
  { key: 'shopName', label: 'Shop Name',     type: 'text',     placeholder: 'Your shop name',      required: true },
  { key: 'email',    label: 'Email',          type: 'email',    placeholder: 'Your email address',   required: true },
  { key: 'mobile',   label: 'Mobile Number',  type: 'tel',      placeholder: 'Your mobile number',  required: true },
  { key: 'password', label: 'New Password',  type: 'password', placeholder: 'Leave blank to keep current', required: false },
];

const Profile = () => {
  const [formData, setFormData] = useState({ shopName: '', email: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

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
          {fields.map(({ key, label, type, icon: Icon, placeholder, required }) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                {label}
              </label>
              <div style={{ position: 'relative', display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(formData as any)[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    required={required}
                    className="profile-input"
                    style={{ width: '100%', padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#f1f5f9', fontSize: '15px' }}
                  />
                </div>
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
