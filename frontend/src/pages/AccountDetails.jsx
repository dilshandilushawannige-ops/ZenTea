import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, UserRound, FileText, ShoppingBag, Download, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const AccountDetails = () => {
  const { user, logout } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const fullName = user?.name || user?.fullName || 'Guest User';
  const email = user?.email || 'guest@example.com';
  const phone = user?.phone || '+0000000000';
  const role = user?.role || 'Customer';
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
  const status = user?.status || 'Active';

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'U';

  const handleLogout = () => {
    clearCart();
    logout();
    navigate('/');
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="flex items-center gap-2 hover:text-gray-700">
            <span className="text-lg">←</span>
            Back to Home
          </Link>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-semibold text-gray-900">My Profile</h1>
          <p className="mt-3 text-gray-600">Your profile details and account information</p>
        </header>

        <section className="rounded-3xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e] text-2xl font-semibold text-white">
                {initials}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-semibold text-gray-900">{fullName}</p>
                  <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#047857]">
                    {status}
                  </span>
                </div>
                <div className="grid gap-4 text-sm text-gray-600 sm:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Contact Information</p>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{phone}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Account Details</p>
                    <div className="flex items-center gap-3">
                      <UserRound className="h-4 w-4 text-gray-400" />
                      <span>Role: {role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span>Customer ID: {user?.id || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/customer/profile/edit"
                className="inline-flex items-center gap-2 rounded-full bg-[#22c55e] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16a34a]"
              >
                Edit Profile
              </Link>
              <Link
                to="/my-orders"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white px-8 py-8 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Account Status</p>
            <div className="mt-6 space-y-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Account Status</span>
                <span className="rounded-full bg-[#d1fae5] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#047857]">
                  {status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Member Since</span>
                <span>{memberSince}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Login</span>
                <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white px-8 py-8 shadow-sm">
            <p className="text-sm font-semibold text-gray-900">Quick Actions</p>
            <div className="mt-6 space-y-4 text-sm text-gray-600">
              <Link to="/my-orders" className="flex items-center gap-3 hover:text-gray-900">
                <FileText className="h-4 w-4" />
                View Order History
              </Link>
              <Link to="/shop" className="flex items-center gap-3 hover:text-gray-900">
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
              <button
                type="button"
                className="flex items-center gap-3 hover:text-gray-900"
              >
                <Download className="h-4 w-4" />
                Download Order Receipts
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 text-red-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AccountDetails;
