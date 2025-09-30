import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DashboardShell from '../../components/common/DashboardShell';
import { useAuth } from '../../context/AuthContext';
import { updateCollectorProfile } from '../../api/authApi';

export default function EditCollectorProfile() {
  const navigate = useNavigate();
  const { user, token, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    collectionArea: '',
    company: ''
  });

  const menu = [
    { to: '/collector', label: 'Collections' },
    { to: '/collector/profile', label: 'My Profile' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        collectionArea: user.collectionArea || '',
        company: user.company || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Name is required',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }

    if (!formData.email.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Email is required',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }

    if (!formData.phone.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Phone is required',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter a valid email address',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }

    // Phone validation (Sri Lankan format)
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Phone number must start with 07 and be 10 digits',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await updateCollectorProfile(token, formData);
      
      // Update user context with new data
      setUser(response.data.user);
      
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your collector profile has been updated successfully',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });

      // Navigate back to profile page
      navigate('/collector/profile');
    } catch (error) {
      console.error('Error updating collector profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: error.response?.data?.message || 'Failed to update collector profile',
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/collector/profile');
  };

  if (!user) {
    return (
      <DashboardShell menu={menu} title="Edit Collector Profile" subtitle="Update your collector profile details">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-slate-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-slate-900">Profile Not Available</h3>
            <p className="mt-1 text-sm text-slate-500">Unable to load your profile information.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell 
      menu={menu} 
      title="Edit Collector Profile" 
      subtitle="Update your collector profile details"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </button>
        </div>

        {/* Edit Collector Profile Form */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Edit Collector Profile</h2>
              <p className="text-sm text-slate-500">Update your collector information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                  placeholder="07xxxxxxxx"
                />
                <p className="mt-1 text-xs text-slate-500">Format: 07xxxxxxxx (10 digits)</p>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                  placeholder="Enter your address"
                />
              </div>

              {/* Collection Area */}
              <div>
                <label htmlFor="collectionArea" className="block text-sm font-medium text-slate-700 mb-2">
                  Collection Area
                </label>
                <input
                  type="text"
                  id="collectionArea"
                  name="collectionArea"
                  value={formData.collectionArea}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                  placeholder="Enter assigned collection area"
                />
              </div>

              {/* Company */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none sm:text-sm"
                  placeholder="Enter company name (optional)"
                />
              </div>
            </div>

            {/* Read-only fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Collector ID
                </label>
                <input
                  type="text"
                  value={user.uniqueId}
                  disabled
                  className="block w-full rounded-md border-slate-300 bg-slate-50 text-slate-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="block w-full rounded-md border-slate-300 bg-slate-50 text-slate-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end pt-6 border-t border-slate-200">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}