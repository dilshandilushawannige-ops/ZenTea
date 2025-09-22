import React from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import SupplierPaymentForm from '../../components/payments/supplier/SupplierPaymentForm';

export default function CollectorDashboard() {
  const menu = [
    { to: '/collector', label: 'Collections' },
  ];

  return (
    <DashboardShell menu={menu}>
      <SupplierPaymentForm />
    </DashboardShell>
  );
}
