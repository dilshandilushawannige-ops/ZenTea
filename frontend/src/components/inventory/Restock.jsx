import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { InventoryAPI } from '../../api/inventoryApi';

export default function Restock() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);

  useEffect(() => {
    (async () => {
      const data = await InventoryAPI.listProducts();
      setProducts(data);
      const pid = queryParams.get('productId');
      if (pid) setProductId(pid);
    })();
  }, [queryParams]);

  async function submit() {
    const qty = parseInt(quantity, 10);
    if (!productId) return Swal.fire({ icon: 'warning', title: 'Select product' });
    if (!batchNumber.trim()) return Swal.fire({ icon: 'warning', title: 'Enter batch number' });
    if (!Number.isInteger(qty) || qty <= 0) return Swal.fire({ icon: 'warning', title: 'Quantity must be positive' });
    try {
      await InventoryAPI.createTransaction({
        productId,
        type: 'IN',
        quantity: qty,
        reason: 'purchase',
        note: `Restock batch ${batchNumber}`,
        batchNumber,
      });
      Swal.fire({ icon: 'success', title: 'Restocked', text: `Added ${qty} units (Batch ${batchNumber})` });
      setQuantity('');
      setBatchNumber('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Restock failed';
      Swal.fire({ icon: 'error', title: 'Error', text: msg });
    }
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-xl backdrop-blur">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">New Restock Entry</h3>
          <p className="text-sm text-slate-500">Assign the delivery to a product, set the batch, and record the quantity received.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-2 text-xs font-medium text-emerald-700">
          TIP: Use the URL parameter <code className="rounded bg-emerald-100 px-1 py-0.5 text-[11px]">?productId=</code> to preselect a product from other screens.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Product</label>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {`${product.name} - ${product.weight || "-"} - Stock ${product.stock}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Batch Number</label>
          <input
            value={batchNumber}
            onChange={(event) => setBatchNumber(event.target.value)}
            placeholder="e.g., BATCH-2025-09-23"
            className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-600">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setProductId('');
            setQuantity('');
            setBatchNumber('');
          }}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
        >
          Log restock
        </button>
      </div>
    </div>
  );
}


