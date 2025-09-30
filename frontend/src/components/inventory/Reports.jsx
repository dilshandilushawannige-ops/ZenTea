import React, { useState } from 'react';
import { InventoryAPI } from '../../api/inventoryApi';
import { CATEGORIES } from '../../utils/validation';

export default function Reports() {
  const [type, setType] = useState('daily');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  async function download() {
    const blob = await InventoryAPI.downloadReport({ type, category, status });
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory-${type}-report.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl backdrop-blur">
      <h3 className="text-lg font-semibold text-slate-900">Inventory Reports</h3>
      <p className="mt-1 text-sm text-slate-500">Export structured PDF snapshots for audits, replenishment reviews, or supplier briefings.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((categoryOption) => (
            <option key={categoryOption} value={categoryOption}>
              {categoryOption}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All status</option>
          <option value="OK">OK</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="NEAR_EXPIRY">Near Expiry</option>
          <option value="LOW_STOCK_NEAR_EXPIRY">Low + Near Expiry</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
        >
          Download PDF
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Each report includes branded cover details, a daily stock ledger, and consolidated totals that match the admin dashboard.
      </p>
    </div>
  );
}
