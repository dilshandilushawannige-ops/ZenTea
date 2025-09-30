import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { InventoryAPI } from '../../api/inventoryApi';
import { CATEGORIES } from '../../utils/validation';
import ProductForm from './ProductForm';

export default function ProductTable({ hideForm = false, onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchData = async () => {
    const data = await InventoryAPI.listProducts({ search, category, status });
    setProducts(data);
  };

  useEffect(() => {
    fetchData();
  }, [search, category, status]);

  useEffect(() => {
    const es = InventoryAPI.openStream();
    es.addEventListener('product:created', (event) => {
      const product = JSON.parse(event.data);
      setProducts((prev) => [product, ...prev]);
    });
    es.addEventListener('product:updated', (event) => {
      const product = JSON.parse(event.data);
      setProducts((prev) => prev.map((item) => (item._id === product._id ? product : item)));
    });
    es.addEventListener('product:deleted', (event) => {
      const payload = JSON.parse(event.data);
      setProducts((prev) => prev.filter((item) => item._id !== payload._id));
    });
    es.addEventListener('alert:new', (event) => {
      const alert = JSON.parse(event.data);
      Swal.fire({ icon: 'warning', title: alert.type.replace('_', ' '), text: alert.message });
    });
    return () => es.close();
  }, []);

  const filtered = useMemo(() => products, [products]);

  async function handleDelete(id) {
    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Delete product?',
      text: 'This will remove the product and its stock records.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
    });
    if (confirm.isConfirmed) {
      try {
        await InventoryAPI.deleteProduct(id);
        Swal.fire({ icon: 'success', title: 'Deleted', text: 'Product deleted' });
        setProducts((prev) => prev.filter((product) => product._id !== id));
      } catch (err) {
        const msg = err?.response?.data?.message || 'Delete failed';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    }
  }

  const tableOnly = (
    <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or batch..."
              className="w-full bg-transparent py-2 text-sm text-slate-700 focus:outline-none"
            />
          </div>
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
        </div>
      </div>

      <div className="mt-4 overflow-auto rounded-2xl border border-slate-100">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Category</th>
              <th className="p-3 text-left font-semibold">Batch</th>
              <th className="p-3 text-left font-semibold">Price</th>
              <th className="p-3 text-left font-semibold">Stock</th>
              <th className="p-3 text-left font-semibold">Min</th>
              <th className="p-3 text-left font-semibold">Weight</th>
              <th className="p-3 text-left font-semibold">Expiry</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <tr key={product._id} className="bg-white/60 hover:bg-emerald-50/40">
                <td className="p-3 font-medium text-slate-800">{product.name}</td>
                <td className="p-3 text-slate-600">{product.category}</td>
                <td className="p-3 text-slate-600">{product.batchNo}</td>
                <td className="p-3 text-slate-700">LKR {Number(product.price).toFixed(2)}</td>
                <td className="p-3 text-slate-700">{product.stock}</td>
                <td className="p-3 text-slate-700">{product.minStock}</td>
                <td className="p-3 text-slate-600">{product.weight || '-'}</td>
                <td className="p-3 text-slate-600">{new Date(product.expiryDate).toLocaleDateString()}</td>
                <td className="p-3">
                  <span
                    className={
                      product.status === 'OK'
                        ? 'inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700'
                        : product.status === 'LOW_STOCK'
                          ? 'inline-flex rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'
                          : product.status === 'NEAR_EXPIRY'
                            ? 'inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700'
                            : product.status === 'LOW_STOCK_NEAR_EXPIRY'
                              ? 'inline-flex rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700'
                              : 'inline-flex rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800'
                    }
                  >
                    {product.status.replaceAll('_', ' ')}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectProduct) onSelectProduct(product);
                        else setSelected(product);
                      }}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="10" className="py-10 text-center text-sm text-slate-500">
                  No products match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (hideForm) return tableOnly;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <ProductForm
          selected={selected}
          onSaved={() => {
            setSelected(null);
            fetchData();
          }}
        />
      </div>
      <div className="lg:col-span-2">{tableOnly}</div>
    </div>
  );
}
