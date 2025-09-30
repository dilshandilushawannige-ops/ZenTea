import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from "react-router-dom";
import AuthProvider from './context/AuthContext.jsx';
import CartProvider from './context/CartContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import ViewCart from './pages/ViewCart.jsx';
import AccountDetails from './pages/AccountDetails.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CollectorDashboard from './pages/collector/CollectorDashboard.jsx';
import CollectorProfile from './pages/collector/CollectorProfile.jsx';
import EditCollectorProfile from './pages/collector/EditCollectorProfile.jsx';
import SupplierDashboard from './pages/supplier/SupplierDashboard.jsx';
import SupplierProfile from './pages/supplier/SupplierProfile.jsx';
import EditSupplierProfile from './pages/supplier/EditSupplierProfile.jsx';
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx'; // ?o. fixed
import EmployeeProfile from './pages/employee/EmployeeProfile.jsx';
import EditProfile from './pages/employee/EditProfile.jsx';
import SalaryManagement from './pages/admin/SalaryManagement.jsx';
import OrderManagement from './pages/admin/OrderManagement.jsx';
import InventoryManagement from './pages/admin/InventoryManagement.jsx';
import InventoryRestock from './pages/admin/InventoryRestock.jsx';
import InventoryStock from './pages/admin/InventoryStock.jsx';
import CusOrderManagement from './pages/admin/CusOrderManagement.jsx';
import Orders from './pages/admin/Orders.jsx';
import ContactUs from './pages/contactUS/ContactUs.jsx';
import Ourstory from './pages/OurStory/Ourstory.jsx';
import Shop from './pages/Shop.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Blog from './pages/blog/blog.jsx';
import CustomerProfile from './pages/customer/CustomerProfile.jsx';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/Ourstory" element={<Ourstory />} />
        <Route path="/shop" element={<Shop/>} />
        <Route path="/cart" element={<ViewCart />} />
        <Route path="/account" element={<AccountDetails />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/my-orders" element={<MyOrders />} />

        {/* Customer */}
        <Route element={<ProtectedRoute allow={['Customer']} />}>
          <Route path="/customer/profile" element={<CustomerProfile />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allow={['Admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/salary" element={<SalaryManagement />} /> {/* ?o. */}
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          <Route path="/admin/inventory/stock" element={<InventoryStock />} />
          <Route path="/admin/inventory/restock" element={<InventoryRestock />} />
          <Route path="/admin/order" element={<OrderManagement />} />
          <Route path="/admin/order-overview" element={<CusOrderManagement />} />
          <Route path="/admin/orders" element={<Orders />} />
        </Route>

        {/* Collector */}
        <Route element={<ProtectedRoute allow={['Collector']} />}>
          <Route path="/collector" element={<CollectorDashboard />} />
          <Route path="/collector/profile" element={<CollectorProfile />} />
          <Route path="/collector/profile/edit" element={<EditCollectorProfile />} />
        </Route>

        {/* Supplier */}
        <Route element={<ProtectedRoute allow={['Supplier']} />}>
          <Route path="/supplier" element={<SupplierDashboard />} />
          <Route path="/supplier/profile" element={<SupplierProfile />} />
          <Route path="/supplier/profile/edit" element={<EditSupplierProfile />} />
        </Route>

        {/* Employee */}
        <Route element={<ProtectedRoute allow={['Employee']} />}>
          <Route path="/employee" element={<EmployeeDashboard />} /> {/* ?o. */}
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/profile/edit" element={<EditProfile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
