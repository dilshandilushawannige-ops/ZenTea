import React from 'react';
import DashboardShell from '../../components/common/DashboardShell';

export default function OrderManagement() {
  const menu = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/order-overview', label: 'Orders Overview' },
    { to: '/admin/orders', label: 'Orders' },
  ];

  return (
    <DashboardShell
      menu={menu}
      title="Order Management"
      subtitle="Choose a section from the sidebar"
    >
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <p className="text-slate-700 text-sm">Use the sidebar to navigate to Dashboard, Orders Overview, or Orders.</p>
      </div>
    </DashboardShell>
  );
}
