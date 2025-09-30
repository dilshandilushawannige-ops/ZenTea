import axios from 'axios';
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const api = axios.create({ baseURL: `${API_BASE}/api/inventory` });
api.interceptors.request.use((config)=>{ const t=localStorage.getItem('token'); if(t) config.headers.Authorization=`Bearer ${t}`; return config; });
export const InventoryAPI = {
  listProducts: (params={}) => api.get('/products', { params }).then(r=>r.data.data),
  listProductsPublic: (params={}) => api.get('/public/products', { params }).then(r=>r.data.data),
  createProduct: (data) => api.post('/products', data).then(r=>r.data.data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data).then(r=>r.data.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then(r=>r.data),
  createTransaction: (data) => api.post('/transactions', data).then(r=>r.data.data),
  listAlerts: () => api.get('/alerts').then(r=>r.data.data),
  markAlertRead: (id) => api.patch(`/alerts/${id}/read`).then(r=>r.data.data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`).then(r=>r.data),
  downloadReport: async ({ type='daily', category, status }) => { const res = await api.get('/reports', { params:{ type, category, status }, responseType:'blob' }); return res.data; },
  openStream: () => { const token = localStorage.getItem('token'); const url = `${API_BASE}/api/inventory/stream`; return new EventSource(url + `?token=${encodeURIComponent(token||'')}`); }
};

export const toImageUrl = (path) => {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  let clean = trimmed.replace(/\\/g, '/');
  while (clean.startsWith('/')) clean = clean.slice(1);
  clean = '/' + clean;
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  return base + clean;
};
