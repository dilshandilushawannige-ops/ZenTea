import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
console.log('API_BASE URL:', API_BASE);

const api = axios.create({
  baseURL: `${API_BASE}/api/sales`
});

console.log('Orders API baseURL:', `${API_BASE}/api/sales`);

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set:', config.headers.Authorization);
  }
  console.log('Making request to:', config.baseURL + config.url);
  return config;
});

export const ordersApi = {
  // Get user's orders
  getUserOrders: () => api.get('/my-orders').then(r => r.data),
  
  // Create order from checkout
  createOrder: (orderData) => {
    console.log('Creating order with data:', orderData);
    return api.post('/order', orderData).then(r => r.data);
  },
  
  // Update order status (admin only)
  updateOrder: (orderId, data) => api.patch(`/update/${orderId}`, data).then(r => r.data)
};