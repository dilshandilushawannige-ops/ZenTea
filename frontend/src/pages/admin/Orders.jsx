import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import AdminNav from '../../components/suppComponents/adminnav';

const ALLOWED_STATUSES = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState({ field: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sidebarItems = [
    { icon: () => null, label: 'Dashboard', to: '/admin' },
    { icon: () => null, label: 'Orders', to: '/admin/orders', active: true }
  ];

  const statusOptions = ['All', ...ALLOWED_STATUSES, 'Pending'];

  useEffect(() => {
    const base = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${base}/api/sales`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        const raw = json.sales || json || [];
        const mapped = raw.map(u => ({
          orderId: u._id || (u.id || ''),
          product: u.description || '—',
          customer: u.customerName || '—',
          location: u.address || '—',
          phoneNumber: u.phoneNumber || '—',
          email: u.customerEmail || '—',
          quantity: u.quantity ?? 1,
          total: u.total ?? '-',
          date: u.createdAt ? new Date(u.createdAt).toLocaleString() : (u.createdAt || '-'),
          deliveryDate: u.updatedAt ? new Date(u.updatedAt).toLocaleString() : (u.updatedAt || '-'),
          status: ALLOWED_STATUSES.includes(u.status) ? u.status : (u.status || 'Processing')
        }));
        mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
        setOrders(mapped);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    let list = orders.filter(o => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (!s) return true;
      return (
        String(o.orderId).toLowerCase().includes(s) ||
        String(o.product).toLowerCase().includes(s) ||
        String(o.customer).toLowerCase().includes(s) ||
        String(o.location).toLowerCase().includes(s) ||
        String(o.phoneNumber).toLowerCase().includes(s) ||
        String(o.email).toLowerCase().includes(s)
      );
    });

    list.sort((a, b) => {
      const field = sortBy.field;
      if (field === 'date' || field === 'deliveryDate') {
        const da = new Date(a[field]);
        const db = new Date(b[field]);
        return sortBy.dir === 'asc' ? da - db : db - da;
      }
      if (field === 'total') {
        const na = parseFloat(String(a.total).replace(/[^0-9.-]+/g, '')) || 0;
        const nb = parseFloat(String(b.total).replace(/[^0-9.-]+/g, '')) || 0;
        return sortBy.dir === 'asc' ? na - nb : nb - na;
      }
      return 0;
    });

    return list;
  }, [orders, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  function exportCSV() {
    const rows = [
      ['Product', 'Customer', 'Location', 'Phone', 'Email', 'Quantity', 'Total', 'Order Date', 'Delivery Date', 'Status']
    ];
    filtered.forEach(o => {
      rows.push([o.product, o.customer, o.location, o.phoneNumber, o.email, o.quantity, o.total, o.date, o.deliveryDate, o.status]);
    });

    const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function changeSort(field) {
    setSortBy(prev => ({ field, dir: prev.field === field ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'desc' }));
  }

  async function updateStatus(orderId, newStatus) {
    if (!ALLOWED_STATUSES.includes(newStatus)) return;
    const result = await Swal.fire({
      title: 'Update Order Status?',
      text: `Change status to "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it'
    });
    if (!result.isConfirmed) return;

    const base = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
    const prevOrders = [...orders];
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));

    try {
      const res = await fetch(`${base}/api/sales/update/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      Swal.fire('Updated!', 'Order status has been updated.', 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      setOrders(prevOrders);
      Swal.fire('Error', 'Failed to update order status — please try again.', 'error');
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <AdminNav sidebarItems={sidebarItems} />
      <div className="flex-1 overflow-auto">
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-500 text-sm mt-1">Manage, filter and export orders</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100/50 rounded-xl px-4 py-2 backdrop-blur">
                <span className="text-sm text-gray-700">Showing {filtered.length} orders</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input
                className="outline-none text-sm w-64 text-gray-900"
                placeholder="Search by product, customer or location"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none text-gray-900"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeSort('date')}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-sm hover:bg-gray-100 transition text-gray-900"
                >
                  Date {sortBy.field === 'date' ? (sortBy.dir === 'asc' ? <ArrowUp className="w-3 h-3 inline"/> : <ArrowDown className="w-3 h-3 inline"/>) : null}
                </button>
                <button
                  onClick={() => changeSort('total')}
                  className="px-4 py-2 bg-gray-50 rounded-xl text-sm hover:bg-gray-100 transition text-gray-900"
                >
                  Total {sortBy.field === 'total' ? (sortBy.dir === 'asc' ? <ArrowUp className="w-3 h-3 inline"/> : <ArrowDown className="w-3 h-3 inline"/>) : null}
                </button>
              </div>

              <button onClick={exportCSV} className="flex items-center px-4 py-2 bg-gray-50 rounded-xl text-sm hover:bg-gray-100 transition text-gray-900">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>

              <button className="flex items-center px-4 py-2 bg-gray-50 rounded-xl text-sm hover:bg-gray-100 transition text-gray-900">
                <Filter className="w-4 h-4 mr-2" />
                Advanced
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-gray-100/50">
            {loading ? (
              <div className="py-12 text-center text-gray-500">Loading orders...</div>
            ) : error ? (
              <div className="py-12 text-center text-red-500">{error}</div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.length === 0 ? (
                      <tr><td colSpan={8} className="py-8 text-center text-sm text-gray-500">No orders found.</td></tr>
                    ) : pageItems.map((order) => (
                      <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-150">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">📦</div>
                            <div>
                              <p className="text-sm text-gray-700">{order.product}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4"><span className="text-sm text-gray-700">{order.phoneNumber}</span></td>
                        <td className="py-4 px-4"><span className="text-sm text-gray-700">{order.email}</span></td>
                        <td className="py-4 px-4"><span className="text-sm text-gray-700">{order.location}</span></td>
                        <td className="py-4 px-4"><span className="text-sm text-gray-700">{order.quantity} pcs</span></td>
                        <td className="py-4 px-4">
                          <select
                            value={order.status}
                            onChange={e => updateStatus(order.orderId, e.target.value)}
                            className="px-3 py-1 rounded-lg text-sm border border-gray-200 text-gray-900"
                          >
                            {ALLOWED_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    Showing {Math.min((page-1)*perPage + 1, filtered.length)} to {Math.min(page*perPage, filtered.length)} of {filtered.length} orders
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p-1))}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
                    >Previous</button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i+1)}
                          className={`px-3 py-1 rounded-lg text-sm ${page === i+1 ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >{i+1}</button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p+1))}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition"
                    >Next</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0);} }
        .animate-fade-in { animation: fade-in 0.45s ease-out; }
      `}</style>
    </div>
  );
}
