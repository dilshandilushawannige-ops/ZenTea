import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit, FileText, Download, User, Mail, Phone, Building, Calendar, Clock, ShoppingCart } from 'lucide-react';

const CustomerProfile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please log in to view your profile</h2>
          <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {getInitials(user.name || user.email)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name || 'Customer'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Your profile details and account information</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* User Info */}
            <div className="flex items-center space-x-4 mb-6 lg:mb-0">
              <div className="h-20 w-20 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(user.name || user.email)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name || 'Customer'}</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Customer
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                <FileText className="h-4 w-4 mr-2" />
                View My Orders
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">Role: Customer</span>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">Customer ID: {user.id || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Status Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-900">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Login</span>
                <span className="text-gray-900">Today</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/my-orders" className="flex items-center text-gray-700 hover:text-green-600 transition-colors">
                <FileText className="h-4 w-4 mr-3" />
                View Order History
              </Link>
              <Link to="/shop" className="flex items-center text-gray-700 hover:text-green-600 transition-colors">
                <ShoppingCart className="h-4 w-4 mr-3" />
                Continue Shopping
              </Link>
              <button className="flex items-center text-gray-700 hover:text-green-600 transition-colors">
                <Download className="h-4 w-4 mr-3" />
                Download Order Receipts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
