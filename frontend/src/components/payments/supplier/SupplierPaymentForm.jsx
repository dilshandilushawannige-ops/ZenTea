import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { createCollection, getRecentCollections, generateQR } from '../../../api/supplierPaymentApi';
import { QRCodeCanvas } from 'qrcode.react';

export default function SupplierPaymentForm() {
  const [form, setForm] = useState({
    supplierId: '',
    weightKg: '',
    rate: '',
    date: new Date().toISOString().substring(0, 10),
  });
  const [recent, setRecent] = useState([]);
  const recentList = Array.isArray(recent)
    ? recent
    : Array.isArray(recent?.collections)
      ? recent.collections
      : Array.isArray(recent?.data)
        ? recent.data
        : [];
  const [qr, setQr] = useState(null);
  const [exp, setExp] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const total = Number(form.weightKg || 0) * Number(form.rate || 0);

  const loadRecent = async () => {
    try {
      const { data } = await getRecentCollections();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.collections)
          ? data.collections
          : [];
      setRecent(list);
    } catch (err) {
      console.error('Failed to load recent collections', err);
      setRecent([]);
    }
  };

  useEffect(() => {
    loadRecent();
  }, []);

  useEffect(() => {
    let t;
    if (exp) {
      const tick = () => setCountdown(Math.max(0, exp - Math.floor(Date.now() / 1000)));
      tick();
      t = setInterval(tick, 1000);
    }
    return () => clearInterval(t);
  }, [exp]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.supplierId || !form.weightKg || !form.rate) {
      return Swal.fire({ icon: 'warning', title: 'All fields required', toast: true, position: 'top' });
    }
    if (/(.)\1{2,}/.test(form.weightKg) || /(.)\1{2,}/.test(form.rate)) {
      return Swal.fire({ icon: 'error', title: 'No repeating digits >2', toast: true, position: 'top' });
    }
    try {
      await createCollection(form);
      Swal.fire({ icon: 'success', title: 'Collection saved', toast: true, position: 'top' });
      loadRecent();
    } catch (err) {
      Swal.fire({ icon: 'error', title: err.response?.data?.message || 'Failed', toast: true, position: 'top' });
    }
  };

  const onGenerateQR = async (txnId) => {
    const { data } = await generateQR(txnId);
    setQr(data.dataURL); // QR now contains txnId only
    setExp(data.exp);
    setTransactionId(data.transactionId);
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Daily Collection</h2>
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Supplier ID</label>
            <input
              className="w-full border rounded p-2"
              value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              max={new Date().toISOString().substring(0, 10)}
            />
          </div>
          <div>
            <label className="text-sm">Weight (kg)</label>
            <input
              className="w-full border rounded p-2"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm">Rate (LKR/kg)</label>
            <input
              className="w-full border rounded p-2"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
              required
            />
          </div>
          <div className="col-span-2">
            <div className="text-lg font-medium">
              Total: <span className="text-emerald-700 font-bold">LKR {Number.isFinite(total) ? total.toFixed(2) : 0}</span>
            </div>
          </div>
          <button className="col-span-2 py-2 rounded bg-emerald-600 text-white">Save Collection</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">QR & Status</h2>
        {qr ? (
          <div className="flex flex-col items-center">
            <QRCodeCanvas value={transactionId} size={180} level="M" includeMargin />
            <div className="mt-2 text-sm">
              Expires in: <span className="font-bold">{countdown}s</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Generate a QR for the latest record.</div>
        )}
      </div>

      <div className="col-span-3 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Recent Collections</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>TXN</th>
              <th>Supplier</th>
              <th>Weight</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Status</th>
              <th>QR</th>
            </tr>
          </thead>
          <tbody>
            {recentList.map((r) => (
              <tr key={r._id} className="border-t">
                <td>{r.transactionId}</td>
                <td>{r.supplierId}</td>
                <td>{r.weightKg}</td>
                <td>{r.rate}</td>
                <td>{r.total}</td>
                <td>
                  <span
                    className="px-2 py-1 rounded text-white text-xs"
                    style={{
                      backgroundColor:
                        r.status === 'Paid' ? '#16a34a' : r.status === 'QR Generated' ? '#f59e0b' : '#64748b',
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => onGenerateQR(r.transactionId)} className="text-emerald-700 underline">
                    Generate QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
