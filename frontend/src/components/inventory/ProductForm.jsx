import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { InventoryAPI } from '../../api/inventoryApi';
import { CATEGORIES, validateProduct } from '../../utils/validation';

const initialState = {
  name: '',
  category: '',
  description: '',
  weight: '',
  price: '',
  stock: 0,
  batchNo: '',
  expiryDate: '',
  minStock: 200,
  image: null,
};

export default function ProductForm({ selected, onSaved }) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || '',
        category: selected.category || '',
        description: selected.description || '',
        weight: selected.weight || '',
        price: selected.price || '',
        stock: selected.stock || 0,
        batchNo: selected.batchNo || '',
        expiryDate: selected.expiryDate ? selected.expiryDate.substring(0, 10) : '',
        minStock: 200,
        image: null,
      });
    } else {
      setForm(initialState);
      setErrors({});
    }
  }, [selected]);

  function handleChange(event) {
    const { name, value, files } = event.target;
    if (name === 'image') {
      setForm({ ...form, image: files[0] });
    } else {
      const updated = {
        ...form,
        [name]: name === 'stock' || name === 'minStock'
          ? value === '' ? '' : parseInt(value, 10)
          : name === 'price'
            ? value === '' ? '' : parseFloat(value)
            : value,
      };
      setForm(updated);
      setErrors(validateProduct(updated));
    }
  }

  const isValid = useMemo(() => Object.keys(validateProduct(form)).length === 0, [form]);

  async function handleSubmit(event) {
    event.preventDefault();
    const newErrors = validateProduct(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== '') formData.append(key, value);
      });

      if (selected && selected._id) {
        await InventoryAPI.updateProduct(selected._id, formData, true);
        Swal.fire({ icon: 'success', title: 'Updated', text: 'Product updated successfully' });
      } else {
        await InventoryAPI.createProduct(formData, true);
        Swal.fire({ icon: 'success', title: 'Created', text: 'Product created successfully' });
      }

      setForm(initialState);
      setErrors({});
      onSaved && onSaved();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Operation failed';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    }
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{selected ? 'Update Product' : 'Add Product'}</h3>
        {selected && (
          <button
            type="button"
            onClick={() => {
              setForm(initialState);
              setErrors({});
              onSaved && onSaved();
            }}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Clear selection
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${errors.name ? 'border-rose-300' : ''}`}
            placeholder="e.g., Golden Tea"
          />
          {errors.name && <p className="text-xs font-medium text-rose-500">{errors.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${errors.category ? 'border-rose-300' : ''}`}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs font-medium text-rose-500">{errors.category}</p>}
        </div>

        <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="2"
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Optional description..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Weight (g/kg)</label>
          <select
            name="weight"
            value={form.weight}
            onChange={handleChange}
            className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${errors.weight ? 'border-rose-300' : ''}`}
          >
            <option value="">Select weight</option>
            <option value="100g">100g</option>
            <option value="250g">250g</option>
            <option value="500g">500g</option>
            <option value="1kg">1kg</option>
          </select>
          {errors.weight && <p className="text-xs font-medium text-rose-500">{errors.weight}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Price (LKR)</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${errors.price ? 'border-rose-300' : ''}`}
            placeholder="e.g., 1250.00"
          />
          {errors.price && <p className="text-xs font-medium text-rose-500">{errors.price}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Stock (units)</label>
          <input
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${errors.stock ? 'border-rose-300' : ''}`}
          />
          {errors.stock && <p className="text-xs font-medium text-rose-500">{errors.stock}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Batch No</label>
          <input
            name="batchNo"
            value={form.batchNo}
            onChange={handleChange}
            className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${errors.batchNo ? 'border-rose-300' : ''}`}
            placeholder="e.g., BT-2025-001"
          />
          {errors.batchNo && <p className="text-xs font-medium text-rose-500">{errors.batchNo}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Expiry Date</label>
          <input
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
            className={`w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${errors.expiryDate ? 'border-rose-300' : ''}`}
          />
          {errors.expiryDate && <p className="text-xs font-medium text-rose-500">{errors.expiryDate}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Minimum Stock</label>
          <input
            name="minStock"
            type="number"
            value={form.minStock}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Image</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </div>

        <div className="md:col-span-2 xl:col-span-3 flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
            disabled={!isValid}
          >
            {selected ? 'Update' : 'Add'} Product
          </button>
          <span className="text-xs text-slate-500">
            Uploads, stock adjustments, and alerts update instantly across the dashboard.
          </span>
        </div>
      </form>
    </div>
  );
}
