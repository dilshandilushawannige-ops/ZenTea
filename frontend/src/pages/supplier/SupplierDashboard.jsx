import React, { useEffect, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import { supplierPending, confirmPayment, downloadSlip } from '../../api/supplierPaymentApi';
import Swal from 'sweetalert2';
import QrReader from 'react-qr-scanner';

export default function SupplierDashboard() {
  const [pending, setPending] = useState(null);
  const [scan, setScan] = useState(false);
  const [result, setResult] = useState(null);

  const menu = [
    { to: '/supplier', label: 'Overview' },
    { to: '/supplier/history', label: 'Payment History' },
  ];

  const load = async () => {
    const { data } = await supplierPending();
    setPending(data);
  };
  useEffect(() => { load(); }, []);

  const onConfirm = async (transactionId) => {
    try {
      const { data } = await confirmPayment(transactionId);
      Swal.fire({ icon: 'success', title: 'Payment confirmed', toast: true, position: 'top' });
      setResult(data);
      load();
      if (pending?.transactionId) downloadSlip(pending.transactionId);
    } catch (e) {
      Swal.fire({ icon: 'error', title: e.response?.data?.message || 'Failed', toast: true, position: 'top' });
    }
  };

  return (
    <DashboardShell menu={menu}>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Pending Payment</h2>
          {pending ? (
            <div className="space-y-2 text-sm">
              <div>TXN: {pending.transactionId}</div>
              <div>Amount: LKR {pending.total}</div>
              <div>Status: {pending.status}</div>
              <button onClick={() => setScan(true)} className="px-3 py-2 rounded bg-emerald-600 text-white">Scan QR & Get Paid</button>
            </div>
          ) : <div className="text-sm text-gray-500">No pending payments</div>}
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">PDF Slip</h2>
          {result?.pdfPath ? <a href={result.pdfPath} target="_blank" className="text-emerald-700 underline">Open latest slip</a> : <div className="text-sm text-gray-500">No slip yet</div>}
        </div>
        {scan && (
          <div className="col-span-3 bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Scan QR</h2>
            <div className="max-w-md">
              <QrReader
                delay={300}
                constraints={{ facingMode: "environment" }}
                onError={(err) => console.error(err)}
                onScan={(res) => {
                  if (res) {
                    setScan(false);
                    onConfirm(res.text); // ✅ now transactionId only
                  }
                }}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
