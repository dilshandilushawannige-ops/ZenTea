import axios from 'axios';
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const createCollection = (payload) =>
  axios.post(`${API}/api/payments/supplier/collection`, payload, { headers: authHeader() });

export const getRecentCollections = () =>
  axios.get(`${API}/api/payments/supplier/collection/recent`, { headers: authHeader() });

export const generateQR = (transactionId) =>
  axios.get(`${API}/api/payments/supplier/collection/${transactionId}/qr`, { headers: authHeader() });

export const supplierPending = () =>
  axios.get(`${API}/api/payments/supplier/pending/latest`, { headers: authHeader() });

// ✅ confirm now sends transactionId, not token
export const confirmPayment = (transactionId) =>
  axios.post(`${API}/api/payments/supplier/confirm`, { transactionId }, { headers: authHeader() });

export const downloadSlip = (txn) =>
  window.open(`${API}/api/payments/supplier/slip/${txn}`, '_blank');
