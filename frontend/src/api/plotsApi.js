import axios from 'axios';
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export const listPlots = () => axios.get(`${API}/api/plots`).then(r => r.data);
export const createPlot = (payload) => axios.post(`${API}/api/plots`, payload).then(r => r.data);
export const updatePlot = (id, payload) => axios.put(`${API}/api/plots/${id}`, payload).then(r => r.data);
export const deletePlot = (id) => axios.delete(`${API}/api/plots/${id}`).then(r => r.data);


