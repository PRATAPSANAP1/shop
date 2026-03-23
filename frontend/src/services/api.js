import axios from 'axios';

const API = axios.create({
  baseURL: 'https://shop-7h85.onrender.com/api',
  withCredentials: true,
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCheck = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthCheck && !window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');
export const heartbeat = () => API.put('/auth/heartbeat');
export const getRacks = () => API.get('/racks');
export const createRack = (data) => API.post('/racks', data);
export const updateRack = (id, data) => API.put(`/racks/${id}`, data);
export const deleteRack = (id) => API.delete(`/racks/${id}`);
export const getProducts = () => API.get('/products');
export const getProductsByRack = (rackId) => API.get(`/products/rack/${rackId}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const scanProduct = (data) => API.post('/products/scan', data);
export const getDashboardStats = () => API.get('/dashboard/stats');
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => API.put('/notifications/read-all');
export const saveShopConfig = (data) => API.post('/shop-config', data);
export const getShopConfig = () => API.get('/shop-config');
export const createDoor = (data) => API.post('/doors', data);
export const getDoors = () => API.get('/doors');
export const deleteDoor = (id) => API.delete(`/doors/${id}`);
export const createShop = (data) => API.post('/shop', data);
export const updateShop = (data) => API.put('/shop', data);
export const getShop = () => API.get('/shop');
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

export const getSmartStoreDashboardData = () => API.get('/smartstore/dashboard-data');
export const getSmartStoreStats = () => API.get('/smartstore/stats');
export const getSmartStoreZoneTraffic = () => API.get('/smartstore/zone-traffic');
export const getSmartStoreTrafficOverTime = () => API.get('/smartstore/traffic-over-time');
export const getSmartStoreDwellTime = () => API.get('/smartstore/dwell-time');
export const getSmartStoreInsights = () => API.get('/smartstore/insights');
export const getSmartStoreHeatmap = () => API.get('/smartstore/heatmap');
export const getSmartStoreZones = () => API.get('/smartstore/zones');
export const getSmartStorePredict = (zone) => API.get(`/smartstore/predict?zone=${encodeURIComponent(zone)}`);
export default API;
