import axios from 'axios';
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const listCrops = () => axios.get(`${API}/api/crops`).then(r => r.data);
export const createCrop = (payload) => axios.post(`${API}/api/crops`, payload).then(r => r.data);
export const updateCrop = (id, payload) => axios.put(`${API}/api/crops/${id}`, payload).then(r => r.data);
export const deleteCrop = (id) => axios.delete(`${API}/api/crops/${id}`).then(r => r.data);


