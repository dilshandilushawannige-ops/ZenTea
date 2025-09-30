import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { InventoryAPI } from '../../api/inventoryApi';

export default function StockAlerts() {
  const [alerts, setAlerts] = useState([]);

  const load = async () => {
    const data = await InventoryAPI.listAlerts();
    setAlerts(data);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const es = InventoryAPI.openStream();
    es.addEventListener('alert:new', (event) => {
      const alert = JSON.parse(event.data);
      setAlerts((prev) => [alert, ...prev]);
      Swal.fire({ icon: 'warning', title: alert.type.replace('_', ' '), text: alert.message });
    });
    return () => es.close();
  }, []);

  async function markRead(id) {
    await InventoryAPI.markAlertRead(id);
    setAlerts((prev) => prev.map((alert) => (alert._id === id ? { ...alert, isRead: true } : alert)));
  }

  async function del(id) {
    const confirmed = await Swal.fire({
      icon: 'question',
      title: 'Delete alert?',
      text: 'This will remove the alert from the timeline.',
      showCancelButton: true,
      confirmButtonText: 'Delete',
    });
    if (confirmed.isConfirmed) {
      await InventoryAPI.deleteAlert(id);
      setAlerts((prev) => prev.filter((alert) => alert._id !== id));
    }
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Inventory Alerts</h3>
          <p className="text-sm text-slate-500">Low stock, expiry, and wastage warnings arrive here in real time.</p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center justify-center rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-5 space-y-3 max-h-[420px] overflow-auto pr-1">
        {alerts.map((alert) => (
          <div
            key={alert._id}
            className={`group rounded-2xl border p-4 transition shadow-sm ${
              alert.isRead
                ? 'border-slate-200 bg-white'
                : 'border-emerald-200/70 bg-emerald-50/70 shadow-emerald-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">
                  {alert.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-slate-600">{alert.message}</p>
                {alert.product && (
                  <p className="text-xs text-slate-500">
                    {alert.product.name} - Stock {alert.product.stock}/{alert.product.minStock} - Expiry{' '}
                    {new Date(alert.product.expiryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {!alert.isRead && (
                  <button
                    type="button"
                    onClick={() => markRead(alert._id)}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Mark read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => del(alert._id)}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            No alerts right now. Restocks and sales will populate this feed.
          </p>
        )}
      </div>
    </div>
  );
}

