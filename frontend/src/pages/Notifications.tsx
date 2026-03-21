import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: any) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '15px', flexWrap: 'wrap' }}>
        <h1 className="gradient-text" style={{ fontSize: '32px', margin: 0 }}>Notifications ({unreadCount})</h1>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-primary" style={{ width: 'auto', flexShrink: 0, whiteSpace: 'nowrap' }}>Mark All Read</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: '18px', width: '160px', marginBottom: '10px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '80%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '12px', width: '120px' }} />
                </div>
                <div className="skeleton" style={{ width: '90px', height: '34px', borderRadius: '10px', flexShrink: 0 }} />
              </div>
            </div>
          ))
        ) : (
          <>
            {notifications.map((notif: any) => (
          <div
            key={notif._id}
            className="card"
            style={{
              padding: '20px',
              background: notif.isRead ? 'rgba(30, 41, 59, 0.4)' : 'rgba(239, 68, 68, 0.1)',
              border: notif.isRead ? '1px solid var(--glass-border)' : '1px solid rgba(239, 68, 68, 0.3)',
              color: 'white'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: notif.isRead ? 'white' : '#ef4444' }}>
                  {notif.type === 'lowStock' && 'Low Stock Alert'}
                  {notif.type === 'expiring' && 'Expiring Soon'}
                  {notif.type === 'outOfStock' && 'Out of Stock'}
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>{notif.message}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(notif.createdAt).toLocaleString()}</p>
              </div>
              {!notif.isRead && (
                <button onClick={() => handleMarkRead(notif._id)} className="btn btn-success" style={{ width: 'auto', flexShrink: 0, padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  Mark Read
                </button>
              )}
            </div>
          </div>
            ))}
            {notifications.length === 0 && (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                <p style={{ fontSize: '18px' }}>No notifications</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
