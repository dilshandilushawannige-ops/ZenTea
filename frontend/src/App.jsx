import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from "react-router-dom";
import AuthProvider from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CollectorDashboard from './pages/collector/CollectorDashboard.jsx';
import SupplierDashboard from './pages/supplier/SupplierDashboard.jsx';
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx'; // ✅ fixed
import SalaryManagement from './pages/admin/SalaryManagement.jsx';
import ContactUs from './pages/contactUS/ContactUs.jsx';
import Ourstory from './pages/OurStory/Ourstory.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
  <Route path="/contact-us" element={<ContactUs />} />
  <Route path="/Ourstory" element={<Ourstory />} />

        {/* Admin */}
        <Route element={<ProtectedRoute allow={['Admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/salary" element={<SalaryManagement />} /> {/* ✅ */}
        </Route>

        {/* Collector */}
        <Route element={<ProtectedRoute allow={['Collector']} />}>
          <Route path="/collector" element={<CollectorDashboard />} />
        </Route>

        {/* Supplier */}
        <Route element={<ProtectedRoute allow={['Supplier']} />}>
          <Route path="/supplier" element={<SupplierDashboard />} />
        </Route>

        {/* Employee */}
        <Route element={<ProtectedRoute allow={['Employee']} />}>
          <Route path="/employee" element={<EmployeeDashboard />} /> {/* ✅ */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}
