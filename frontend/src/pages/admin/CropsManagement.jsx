import React, { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell.jsx';
import { listCrops, createCrop, updateCrop, deleteCrop } from '../../api/cropsApi.js';
import { listPlots } from '../../api/plotsApi.js';

function CropForm({ initial, plots, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    plot: '',
    cultivarName: '',
    plantingDate: '',
    expectedMaturityMonths: '',
    status: 'Active',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        plot: initial.plot?._id || initial.plot || '',
        cultivarName: initial.cultivarName || '',
        plantingDate: initial.plantingDate ? initial.plantingDate.substring(0,10) : '',
        expectedMaturityMonths: initial.expectedMaturityMonths ?? '',
        status: initial.status || 'Active',
        notes: initial.notes || '',
      });
    }
  }, [initial]);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // clear field-level error when user updates the field
    setErrors((err) => ({ ...err, [name]: '' }));
  };
  const submit = (e) => {
    e.preventDefault();
    // Validate planting date is not earlier than today
    if (form.plantingDate) {
      const sel = new Date(form.plantingDate);
      const today = new Date();
      sel.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (sel < today) {
        setErrors((err) => ({ ...err, plantingDate: 'Planting date cannot be earlier than today' }));
        return;
      }
    }
    const payload = {
      plot: form.plot,
      cultivarName: form.cultivarName.trim(),
      plantingDate: form.plantingDate,
      expectedMaturityMonths: form.expectedMaturityMonths === '' ? 0 : Number(form.expectedMaturityMonths),
      status: form.status,
      notes: form.notes.trim(),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-slate-600">Plot *</label>
          <select required name="plot" value={form.plot} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
            <option value="">Select plot</option>
            {plots.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-600">Cultivar Name *</label>
          <input required name="cultivarName" value={form.cultivarName} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-600">Planting Date *</label>
          <input required type="date" name="plantingDate" value={form.plantingDate} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
          {errors.plantingDate && <p className="mt-1 text-xs text-red-600">{errors.plantingDate}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-600">Expected Maturity (months)</label>
          <input type="number" name="expectedMaturityMonths" value={form.expectedMaturityMonths} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label className="text-sm text-slate-600">Status</label>
          <select name="status" value={form.status} onChange={handle} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
            <option>Active</option>
            <option>Replanted</option>
            <option>Retired</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-slate-600">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handle} rows="3" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-white">Save</button>
        <button type="button" onClick={onCancel} className="rounded-xl bg-slate-100 px-4 py-2 text-slate-700">Cancel</button>
      </div>
    </form>
  );
}

export default function CropsManagement() {
  const [items, setItems] = useState([]);
  const [plots, setPlots] = useState([]);
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
    Promise.all([listCrops(), listPlots()])
      .then(([c, p]) => { setItems(c.data || []); setPlots(p.data || []); })
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const onCreate = (payload) => {
    createCrop(payload)
      .then(() => { 
        setToast('✅ Crop created successfully!'); 
        setShowForm(false); 
        load(); 
      })
      .catch((e) => setError(`❌ Failed to create crop: ${e?.response?.data?.message || e.message}`));
  };
  const onUpdate = (payload) => {
    updateCrop(editing._id, payload)
      .then(() => { 
        setToast('✅ Crop updated successfully!'); 
        setEditing(null); 
        setShowForm(false); 
        load(); 
      })
      .catch((e) => setError(`❌ Failed to update crop: ${e?.response?.data?.message || e.message}`));
  };
  const onDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this crop? This action cannot be undone.')) {
      deleteCrop(id)
        .then(() => { 
          setToast('✅ Crop deleted successfully!'); 
          load(); 
        })
        .catch((e) => setError(`❌ Failed to delete crop: ${e?.response?.data?.message || e.message}`));
    }
  };

  return (
    <DashboardShell title="Cultivation Management" subtitle="Crops" menu={menu}>
      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {toast && <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{toast}</div>}

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Crops</h3>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white">Add Crop</button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <CropForm
            initial={editing}
            plots={plots}
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
                <th className="px-3 py-3">Cultivar Name</th>
                <th className="px-3 py-3">Plot</th>
                <th className="px-3 py-3">Planting Date</th>
                <th className="px-3 py-3">Expected Maturity (months)</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Notes</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="border-t border-slate-100">
                  <td className="px-3 py-3">{c.cultivarName}</td>
                  <td className="px-3 py-3">{c.plot?.name || '—'}</td>
                  <td className="px-3 py-3">{new Date(c.plantingDate).toLocaleDateString()}</td>
                  <td className="px-3 py-3">{c.expectedMaturityMonths}</td>
                  <td className="px-3 py-3">{c.status}</td>
                  <td className="px-3 py-3">{c.notes || '—'}</td>
                  <td className="px-3 py-3 space-x-2">
                    <button onClick={() => { setEditing(c); setShowForm(true); }} className="rounded-lg bg-slate-100 px-3 py-1 text-slate-700">Edit</button>
                    <button onClick={() => onDelete(c._id)} className="rounded-lg bg-red-100 px-3 py-1 text-red-700">Delete</button>
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


