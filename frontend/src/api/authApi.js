import axios from 'axios';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const signup = (payload) => axios.post(`${API}/api/auth/signup`, payload);
export const login = (payload) => axios.post(`${API}/api/auth/login`, payload);
export const profile = (token) => axios.get(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
export const adminListUsers = (token) => axios.get(`${API}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
export const adminUpdateUser = (token, id, body) => axios.put(`${API}/api/auth/users/${id}`, body, { headers: { Authorization: `Bearer ${token}` } });

// Employee profile management
export const updateMyProfile = (token, payload) => axios.put(`${API}/api/auth/profile`, payload, { headers: { Authorization: `Bearer ${token}` } });
export const deleteMyProfile = (token) => axios.delete(`${API}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });

// Collector profile management
export const updateCollectorProfile = (token, payload) => axios.put(`${API}/api/auth/collector/profile`, payload, { headers: { Authorization: `Bearer ${token}` } });

// Supplier profile management
export const updateSupplierProfile = (token, payload) => axios.put(`${API}/api/auth/supplier/profile`, payload, { headers: { Authorization: `Bearer ${token}` } });
