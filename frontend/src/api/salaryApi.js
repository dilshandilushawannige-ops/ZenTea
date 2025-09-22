import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ---------------- ADMIN APIs ----------------
export const saveSalary = (payload) =>
  axios.post(`${API}/api/salary`, payload, { headers: authHeader() });

export const generatePayslip = (payload) =>
  axios.post(`${API}/api/salary/payslip`, payload, { headers: authHeader() });

export const listPayslipsByEmployee = (employeeId) =>
  axios.get(`${API}/api/salary/payslip/${employeeId}`, { headers: authHeader() });

// ---------------- EMPLOYEE APIs ----------------
export const getMySalary = () =>
  axios.get(`${API}/api/salary/me`, { headers: authHeader() });

export const listMyPayslips = () =>
  axios.get(`${API}/api/salary/me/payslips`, { headers: authHeader() });

export const downloadPayslip = async (slipNo) => {
  const res = await axios.get(`${API}/api/salary/${slipNo}/pdf`, {
    headers: authHeader(),
    responseType: 'blob', // ⬅ important
  });

  // Create blob download
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${slipNo}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
