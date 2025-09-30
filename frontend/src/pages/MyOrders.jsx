import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ChevronRight,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Download,
  X as XIcon,
} from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Header from '../components/Navbar';
import Footer from '../components/Footer';

// <-- FIX: use import.meta.env (Vite). fallback to CRA env or localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MyOrdersPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [dateRange, setDateRange] = useState('all'); // 'all' or number of days as string
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Modal / update state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null); // holds editable order object
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Inline status edit state
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const isMountedRef = useRef(true);

  // Keep filter options aligned with backend enum: Processing, Shipped, Delivered, Cancelled
  const filterOptions = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Map status to icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      case 'Shipped':
        return <Package className="w-4 h-4" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200';
      case 'Delivered':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  // Normalize returned sales object to the same shape stored in orders state
  const normalizeOrderFromResponse = (o) => ({
    id: o._id || o.id || '',
    customerName: o.customerName || '',
    customerEmail: o.customerEmail || '',
    phoneNumber: o.phoneNumber || '',
    address: o.address || '',
    quantity: o.quantity !== undefined ? o.quantity : '',
    description: o.description || '',
    status: o.status || 'Processing',
    createdAt: o.createdAt || o.date || null,
    price: o.price || '',
    rating: o.rating || null,
    estimatedDelivery: o.estimatedDelivery || null,
    deliveredDate: o.deliveredDate || null,
    cancelReason: o.cancelReason || null,
  });

  // --- Fetch orders (reusable) ---
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/sales`);

      if (!res.ok) {
        const text = await res.text();
        const preview = typeof text === 'string' ? text.slice(0, 1000) : text;
        throw new Error(`${res.status} ${res.statusText} — Response body preview: ${preview}`);
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase();

      if (!contentType.includes('application/json')) {
        const text = await res.text();
        const preview = typeof text === 'string' ? text.slice(0, 1000) : text;
        throw new Error(
          `Expected JSON but received content-type: ${contentType}. Response preview: ${preview}`
        );
      }

      const data = await res.json();
      const fetched = Array.isArray(data.sales) ? data.sales : [];

      const normalized = fetched.map((o) => normalizeOrderFromResponse(o));

      if (isMountedRef.current) {
        setOrders(
          normalized.sort((a, b) => {
            if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
            return 0;
          })
        );
      }
    } catch (err) {
      if (err.name !== 'AbortError' && isMountedRef.current) {
        console.error('Failed to load orders:', err);
        setError(err.message || 'Failed to load orders');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  // --- Mount: fetch orders and manage mounted ref ---
  useEffect(() => {
    isMountedRef.current = true;
    fetchOrders();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOrders]);

  // --- Delete order ---
  const handleDelete = async (orderId) => {
    if (!orderId) return;

    const confirmResult = await Swal.fire({
      title: 'Delete order?',
      text: 'Are you sure you want to delete this order? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    setDeletingId(orderId);

    try {
      const res = await fetch(`${API_BASE}/api/sales/delete/${orderId}`, {
        method: 'DELETE',
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      let body;
      if (contentType.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }

      if (!res.ok) {
        const message = (body && body.message) || body || `${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      // remove locally (immediate feedback). We do not force a full refetch here to avoid extra round trip.
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      await Swal.fire({
        icon: 'success',
        title: (body && body.message) || 'Order deleted successfully!',
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('handleDelete error:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Delete failed',
        text: err.message || 'Failed to delete order',
      });
    } finally {
      setDeletingId(null);
    }
  };

  // --- Filtering & searching helpers ---
  const withinDateRange = (order) => {
    if (!order.createdAt) return true;
    if (dateRange === 'all') return true;
    const days = parseInt(dateRange, 10);
    if (Number.isNaN(days)) return true;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return new Date(order.createdAt).getTime() >= cutoff;
  };

  const matchesSearchTerm = (order) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (order.description && order.description.toLowerCase().includes(q)) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(q)) ||
      (order.phoneNumber && order.phoneNumber.toLowerCase().includes(q)) ||
      (order.address && order.address.toLowerCase().includes(q)) ||
      (order.id && order.id.toLowerCase().includes(q))
    );
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
    return matchesFilter && withinDateRange(order) && matchesSearchTerm(order);
  });

  // --- Export CSV ---
  const exportOrders = () => {
    if (!orders.length) return;
    const headers = [
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Phone Number',
      'Address',
      'Quantity',
      'Description',
      'Status',
      'Created At',
      'Price',
    ];
    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      o.customerEmail,
      o.phoneNumber,
      o.address,
      o.quantity,
      (o.description || '').replace(/"/g, '""'),
      o.status,
      o.createdAt ? new Date(o.createdAt).toISOString() : '',
      o.price || '',
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((cell) => {
            const val = cell === null || cell === undefined ? '' : String(cell);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Modal / Update logic ---

  // open modal and prefill modalData
  const openUpdateModal = (order) => {
    if (!order) return;
    // Only allow opening the modal for Processing orders
    if (order.status !== 'Processing') {
      Swal.fire({
        icon: 'info',
        title: 'Not editable',
        text: 'Only orders with status "Processing" can be updated.',
      });
      return;
    }
    // clone to avoid mutating original object directly
    setModalData({
      id: order.id,
      customerName: order.customerName || '',
      customerEmail: order.customerEmail || '',
      phoneNumber: order.phoneNumber || '',
      address: order.address || '',
      quantity: order.quantity ?? '',
      description: order.description || '',
      status: order.status || 'Processing',
    });
    setUpdateError(null);
    setIsModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsModalOpen(false);
    setModalData(null);
    setIsUpdating(false);
    setUpdateError(null);
  };

  const handleModalChange = (field, value) => {
    setModalData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Submit update to backend (PATCH /api/sales/update/:id)
  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!modalData || !modalData.id) return;

    // simple client side validation
    if (
      !modalData.customerName ||
      !modalData.customerEmail ||
      !modalData.phoneNumber ||
      !modalData.address ||
      modalData.quantity === '' ||
      modalData.quantity === null ||
      modalData.quantity === undefined ||
      !modalData.description
    ) {
      setUpdateError('All fields are required.');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const res = await fetch(`${API_BASE}/api/sales/update/${modalData.id}`, {
        method: 'PATCH', // backend supports PATCH (updatesales)
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: modalData.customerName,
          customerEmail: modalData.customerEmail,
          phoneNumber: modalData.phoneNumber,
          address: modalData.address,
          quantity: modalData.quantity,
          description: modalData.description,
          status: modalData.status,
        }),
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      let body;
      if (contentType.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }

      if (!res.ok) {
        const message = (body && body.message) || body || `${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      // backend returns { sales: updated } in the controller; handle both possibilities
      const updatedRaw = (body && body.sales) ? body.sales : body;
      const updated = normalizeOrderFromResponse(updatedRaw);

      // update local orders state (replace the matching id)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

      await Swal.fire({
        icon: 'success',
        title: 'Order updated',
        text: 'Order updated successfully!',
        timer: 1500,
        showConfirmButton: false,
      });

      closeUpdateModal();

      // --- NEW: refresh orders from server to ensure latest data ---
      await fetchOrders();
    } catch (err) {
      console.error('submitUpdate error:', err);
      setUpdateError(err.message || 'Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Inline status update ---
  // Tries /api/sales/update-status/:id first, falls back to /api/sales/update/:id
  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return;

    // Ensure the previous status is Processing before allowing change
    const prevOrders = orders.slice();
    const prevOrder = prevOrders.find((o) => o.id === orderId);
    if (!prevOrder) return;
    if (prevOrder.status !== 'Processing') {
      await Swal.fire({
        icon: 'info',
        title: 'Cannot change status',
        text: 'Status can only be changed for orders currently in "Processing" state.',
      });
      setEditingStatusId(null);
      return;
    }

    setStatusUpdatingId(orderId);

    // Optimistic UI update: store previous orders snapshot to rollback if needed
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setEditingStatusId(null);

    try {
      // Try dedicated route first
      let res = await fetch(`${API_BASE}/api/sales/update-status/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      // If server responds not ok, fallback to general update endpoint
      if (!res.ok) {
        await res.text().catch(() => '');
        res = await fetch(`${API_BASE}/api/sales/update/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      let body;
      if (contentType.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text();
      }

      if (!res.ok) {
        const message = (body && body.message) || body || `${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      const updatedRaw = (body && body.sales) ? body.sales : body;
      const updated = normalizeOrderFromResponse(updatedRaw);

      // Update local orders with normalized server response (keeps createdAt, etc.)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));

      // --- NEW: refresh orders from server to ensure latest data after status change ---
      await fetchOrders();
    } catch (err) {
      console.error('handleStatusChange error:', err);
      // rollback optimistic update
      setOrders(prevOrders);
      await Swal.fire({
        icon: 'error',
        title: 'Status update failed',
        text: err.message || 'Failed to update status',
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // --- Render ---
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow">
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 mt-20">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none ">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-300/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-teal-200/30 to-green-300/30 rounded-full blur-3xl"></div>
          </div>

          {/* Header Section */}
          <div className="relative bg-gradient-to-r from-green-100 via-white to-white backdrop-blur-xl shadow-lg border-b border-green-200/50">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-emerald-700 bg-clip-text text-transparent mb-2">
                    My Orders
                  </h1>
                  <p className="text-gray-600">Track and manage your purchase history</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={exportOrders}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Export Orders
                  </button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders, products, or order IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400 transition-all duration-200 text-gray-700 placeholder-gray-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                        activeFilter === filter
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105 shadow-green-500/25'
                          : 'bg-white/90 backdrop-blur-sm text-gray-700 border border-green-200 hover:bg-green-50 hover:border-green-300 hover:shadow-md'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-green-200 rounded-2xl px-4 py-3 hover:border-green-300 transition-all duration-200 shadow-sm">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-transparent text-sm text-gray-700 focus:outline-none font-medium"
                  >
                    <option value="all">All time</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 3 months</option>
                    <option value="365">Last year</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="relative max-w-7xl mx-auto px-6 pb-12 mt-10">
            <div className="grid gap-6">
              {/* Loading or error */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-pulse h-4 w-56 bg-green-200 rounded mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading orders...</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-12">
                  <p className="text-red-600 font-semibold">Error: {error}</p>
                </div>
              )}

              {!loading &&
                !error &&
                filteredOrders.map((order, index) => (
                  <div
                    key={`${order.id || index}`}
                    className="group relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-100/50 hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-[1.02] overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative p-8">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Order Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-200 via-emerald-200 to-teal-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                            <Package className="w-8 h-8 text-green-700" />
                          </div>
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-wrap">
                              {/* Status badge or inline select when editing — only editable for Processing */}
                              {editingStatusId === order.id ? (
                                <div className="px-2 py-1 rounded-2xl text-sm font-semibold border-2 flex items-center gap-2 shadow-sm">
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    disabled={statusUpdatingId === order.id}
                                    className="bg-transparent outline-none text-gray-900"
                                  >
                                    {filterOptions
                                      .filter((f) => f !== 'All')
                                      .map((s) => (
                                        <option key={s} value={s}>
                                          {s}
                                        </option>
                                      ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => setEditingStatusId(null)}
                                    className="ml-2 text-xs px-2 py-1 rounded bg-gray-100"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    // Only allow editing the status inline when currently Processing
                                    if (order.status === 'Processing') {
                                      setEditingStatusId(order.id);
                                    } else {
                                      // provide hint to sales
                                      // keep non-intrusive: small tooltip-like alert
                                      // (Swal used here)
                                      Swal.fire({
                                        icon: 'info',
                                        title: 'Not editable',
                                        text: 'Only orders with status "Processing" can be updated.',
                                      });
                                    }
                                  }}
                                  className={`px-4 py-2 rounded-2xl text-sm font-semibold border-2 ${getStatusStyle(
                                    order.status
                                  )} flex items-center gap-2 shadow-sm ${order.status === 'Processing' ? 'cursor-pointer' : 'cursor-default opacity-95'}`}
                                  title={order.status === 'Processing' ? 'Click to change status' : 'Only Processing orders can be changed'}
                                >
                                  {statusUpdatingId === order.id ? (
                                    <span className="text-sm font-medium">Updating…</span>
                                  ) : (
                                    <>
                                      {getStatusIcon(order.status)}
                                      {order.status}
                                    </>
                                  )}
                                </div>
                              )}

                              <span className="text-sm text-gray-600 flex items-center gap-2 bg-gray-100/80 px-3 py-1 rounded-xl">
                                <Calendar className="w-4 h-4" />
                                {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                              </span>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:transform group-hover:translate-x-2 transition-all duration-300" />
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Order Description:{' '}
                              <span className="text-green-700">{order.description || '—'}</span>
                            </h3>
                            <h5 className="text-x font-bold text-gray-900 mb-2">
                              Name:{' '}
                              <span className="text-green-700">{order.customerName || '—'}</span>
                            </h5>
                            <h5 className="text-x font-bold text-gray-900 mb-2">
                              Email:{' '}
                              <span className="text-green-700">{order.customerEmail || '—'}</span>
                            </h5>
                            <h5 className="text-x font-bold text-gray-900 mb-2">
                              Address:{' '}
                              <span className="text-green-700">{order.address || '—'}</span>
                            </h5>
                            <h5 className="text-x font-bold text-gray-900 mb-2">
                              Phone Number:{' '}
                              <span className="text-green-700">{order.phoneNumber || '—'}</span>
                            </h5>
                            <h5 className="text-x font-bold text-gray-900 mb-2">
                              Quantity:{' '}
                              <span className="text-green-700">{order.quantity ?? '—'}</span>
                            </h5>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-green-100">
                            <div className="flex gap-3">
                              {order.status === 'Delivered' && (
                                <button className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-xl font-semibold hover:from-green-200 hover:to-emerald-200 transition-all duration-200 hover:scale-105 border border-green-200">
                                  Reorder
                                </button>
                              )}

                              {/* Update opens modal — only show for Processing */}
                              {order.status === 'Processing' && (
                                <button
                                  onClick={() => openUpdateModal(order)}
                                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                                >
                                  Update
                                </button>
                              )}

                              {order.status !== 'Processing' && (
                                <button
                                  className="px-6 py-2 rounded-xl font-semibold text-gray-400 border border-gray-200 bg-white cursor-not-allowed"
                                  title="Only Processing orders can be updated"
                                  disabled
                                >
                                  Update
                                </button>
                              )}

                              {order.status === 'Processing' && (
                                <button
                                  onClick={() => handleDelete(order.id)}
                                  disabled={deletingId === order.id}
                                  className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg ${
                                    deletingId === order.id
                                      ? 'bg-red-400 text-white cursor-not-allowed'
                                      : 'bg-gradient-to-r from-red-600 to-red-600 text-white hover:from-red-700 hover:to-red-700 hover:scale-105'
                                  }`}
                                >
                                  {deletingId === order.id ? 'Deleting…' : 'Delete'}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Additional Info */}
                          {order.estimatedDelivery && order.status === 'Processing' && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                              <p className="text-sm text-green-800 font-medium">
                                Estimated delivery:{' '}
                                <span className="font-bold">{order.estimatedDelivery}</span>
                              </p>
                            </div>
                          )}

                          {order.deliveredDate && order.status === 'Delivered' && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                              <p className="text-sm text-green-800 font-medium">
                                Delivered on: <span className="font-bold">{order.deliveredDate}</span>
                              </p>
                            </div>
                          )}

                          {order.cancelReason && order.status === 'Cancelled' && (
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-4">
                              <p className="text-sm text-red-800 font-medium">
                                Cancellation reason:{' '}
                                <span className="font-bold">{order.cancelReason}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </div>
                ))}

              {/* Empty State */}
              {!loading && !error && filteredOrders.length === 0 && (
                <div className="text-center py-20">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Package className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm ? 'Try adjusting your search terms or filters.' : 'Your order history will appear here once you make your first purchase.'}
                  </p>
                  <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg">
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Stats Bar */}
            <div className="bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-green-200/50 shadow-2xl mt-8">
              <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-center gap-8 text-center">
                  <div className="group cursor-pointer">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-green-700 group-hover:to-emerald-700 transition-all duration-200">
                      {orders.filter((o) => o.status === 'Delivered').length}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Delivered</div>
                  </div>
                  <div className="group cursor-pointer">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:from-green-700 group-hover:to-emerald-700 transition-all duration-200">
                      {orders.filter((o) => o.status === 'Processing').length}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Processing</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* --- Update Modal --- */}
      {isModalOpen && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              if (!isUpdating) closeUpdateModal();
            }}
          />

          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Update Order</h3>
                <span className="text-sm text-gray-500">Edit details and status</span>
              </div>

              <button
                onClick={() => {
                  if (!isUpdating) closeUpdateModal();
                }}
                aria-label="Close"
                className="rounded-md p-1 hover:bg-gray-100"
              >
                <XIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={submitUpdate} className="p-6 space-y-4">
              {updateError && (
                <div className="text-red-700 font-medium bg-red-50 p-3 rounded-md border border-red-100">
                  {updateError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800">Customer Name</span>
                  <input
                    value={modalData.customerName}
                    onChange={(e) => handleModalChange('customerName', e.target.value)}
                    className="mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
                    placeholder="Full name"
                    required
                  />
                </label>

                <label className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800">Customer Email</span>
                  <input
                    type="email"
                    value={modalData.customerEmail}
                    onChange={(e) => handleModalChange('customerEmail', e.target.value)}
                    className="mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
                    placeholder="name@example.com"
                    required
                  />
                </label>

                <label className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800">Phone Number</span>
                  <input
                    value={modalData.phoneNumber}
                    onChange={(e) => handleModalChange('phoneNumber', e.target.value)}
                    className="mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
                    placeholder="+1 555 555 5555"
                    required
                  />
                </label>

                <label className="flex flex-col text-sm">
                  <span className="font-medium text-gray-800">Quantity</span>
                  <input
                    type="number"
                    min="0"
                    value={modalData.quantity}
                    onChange={(e) => handleModalChange('quantity', e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
                    required
                  />
                </label>
              </div>

              <label className="flex flex-col text-sm">
                <span className="font-medium text-gray-800">Address</span>
                <input
                  value={modalData.address}
                  onChange={(e) => handleModalChange('address', e.target.value)}
                  className="mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
                  placeholder="Shipping address"
                  required
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="font-medium text-gray-800">Description</span>
                <textarea
                  value={modalData.description}
                  onChange={(e) => handleModalChange('description', e.target.value)}
                  className="mt-1 px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 transition-colors"
                  rows={3}
                  placeholder="Order notes, items, etc."
                  required
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    if (!isUpdating) closeUpdateModal();
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-6 py-2 rounded-lg font-semibold text-white inline-flex items-center justify-center gap-3 shadow-lg transition-all ${
                    isUpdating
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-black hover:bg-neutral-900 active:scale-95'
                  }`}
                >
                  {isUpdating && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  )}
                  {isUpdating ? 'Updating…' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
