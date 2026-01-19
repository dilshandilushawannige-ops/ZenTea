import React, { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell.jsx';
import { listPlots, createPlot, updatePlot, deletePlot } from '../../api/plotsApi.js';

function PlotForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    estateName: '',
    areaHa: '',
    elevationM: '',
    soilType: 'Other',
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        estateName: initial.estateName || '',
        areaHa: initial.areaHa ?? '',
        elevationM: initial.elevationM ?? '',
        soilType: initial.soilType || 'Other',
      });
    }
  }, [initial]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      estateName: form.estateName.trim(),
      areaHa: Number(form.areaHa),
      elevationM: form.elevationM === '' ? 0 : Number(form.elevationM),
      soilType: form.soilType,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-slate-600">Name *</label>
          <input required name="name" value={form.name} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-600">Estate Name</label>
          <input name="estateName" value={form.estateName} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-600">Area (ha) *</label>
          <input required type="number" step="0.01" name="areaHa" value={form.areaHa} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-600">Elevation (m)</label>
          <input type="number" name="elevationM" value={form.elevationM} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-600">Soil Type</label>
          <select name="soilType" value={form.soilType} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
            <option>Loamy</option>
            <option>Sandy</option>
            <option>Clay</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-white">Save</button>
        <button type="button" onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2 text-slate-700">Cancel</button>
      </div>
    </form>
  );
}

export default function PlotsManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const menu = useMemo(() => ([
    { label: 'Main Dashboard', to: '/admin' },
    { label: 'Dashboard', to: '/admin/panel' },
    { label: 'Plots Management', to: '/admin/panel/plots' },
    { label: 'Crops Management', to: '/admin/panel/crops' },
  ]), []);

  const load = () => {
    setLoading(true);
    listPlots()
      .then((r) => setItems(r.data || []))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onCreate = (payload) => {
    createPlot(payload)
      .then(() => { 
        setToast('✅ Plot created successfully!'); 
        setShowForm(false); 
        load(); 
      })
      .catch((e) => setError(`❌ Failed to create plot: ${e?.response?.data?.message || e.message}`));
  };
  const onUpdate = (payload) => {
    updatePlot(editing._id, payload)
      .then(() => { 
        setToast('✅ Plot updated successfully!'); 
        setEditing(null); 
        setShowForm(false); 
        load(); 
      })
      .catch((e) => setError(`❌ Failed to update plot: ${e?.response?.data?.message || e.message}`));
  };
  const onDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this plot? This action cannot be undone.')) {
      deletePlot(id)
        .then(() => { 
          setToast('✅ Plot deleted successfully!'); 
          load(); 
        })
        .catch((e) => setError(`❌ Failed to delete plot: ${e?.response?.data?.message || e.message}`));
    }
  };

  return (
    <DashboardShell title="Cultivation Management" subtitle="Plots" menu={menu}>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {toast && <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{toast}</div>}

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Plots</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white">Add Plot</button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <PlotForm
            initial={editing}
            onSubmit={editing ? onUpdate : onCreate}
            onCancel={() => { setEditing(null); setShowForm(false); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Estate Name</th>
                <th className="px-3 py-3">Area (ha)</th>
                <th className="px-3 py-3">Elevation (m)</th>
                <th className="px-3 py-3">Soil Type</th>
                <th className="px-3 py-3">Created At</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="px-3 py-3">{p.name}</td>
                  <td className="px-3 py-3">{p.estateName || '—'}</td>
                  <td className="px-3 py-3">{p.areaHa}</td>
                  <td className="px-3 py-3">{p.elevationM}</td>
                  <td className="px-3 py-3">{p.soilType}</td>
                  <td className="px-3 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 py-3 space-x-2">
                    <button onClick={() => { setEditing(p); setShowForm(true); }} className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">Edit</button>
                    <button onClick={() => onDelete(p._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}


