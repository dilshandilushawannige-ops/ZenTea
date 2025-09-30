import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/common/DashboardShell';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const menu = [
    { to: '/employee', label: 'My Salary' },
    { to: '/employee/profile', label: 'My Profile' }
  ];

  const handleGoBack = () => {
    navigate('/employee');
  };

  if (loading) {
    return (
      <DashboardShell menu={menu} title="My Profile" subtitle="Loading your profile details...">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell menu={menu} title="My Profile" subtitle="Your profile details">
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
                onClick={handleGoBack}
                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
              >
                Go Back to Dashboard
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
      title="My Profile" 
      subtitle={`Your profile details`}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Employee Profile Card */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
            </div>

            {/* Employee Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  user.isActive 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {user.isActive ? 'Active Employee' : 'Pending Approval'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Contact Information</h3>
                  <dl className="mt-3 space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-slate-600">Email</dt>
                      <dd className="text-sm text-slate-900">{user.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600">Phone</dt>
                      <dd className="text-sm text-slate-900">{user.phone || 'Not provided'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Employment Details</h3>
                  <dl className="mt-3 space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-slate-600">Role</dt>
                      <dd className="text-sm text-slate-900">{user.role}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600">Employee ID</dt>
                      <dd className="text-sm text-slate-900">{user.uniqueId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-600">Company</dt>
                      <dd className="text-sm text-slate-900">{user.company || 'ZenTea'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/employee/profile/edit')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
              <button 
                onClick={() => navigate('/employee')}
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View My Salary
              </button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Status */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Account Status</span>
                <span className={`text-sm font-medium ${user.isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user.isActive ? 'Active' : 'Pending Approval'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Employee Since</span>
                <span className="text-sm text-slate-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Last Login</span>
                <span className="text-sm text-slate-900">
                  Today
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/employee')}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
              >
                View Salary Dashboard
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors">
                Download Latest Payslip
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md transition-colors">
                Update Contact Information
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}