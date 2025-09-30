// src/pages/salesAdmin/Admin.jsx
import React, { useEffect, useState } from 'react';
import { 
  Bell,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import AdminNav from '../../components/suppComponents/adminnav';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const Dashboard = () => {
  const [animatedValues, setAnimatedValues] = useState({
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0
  });

  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [computedChanges, setComputedChanges] = useState({
    processing: { text: '0%', trend: 'same' },
    shipped: { text: '0%', trend: 'same' },
    delivered: { text: '0%', trend: 'same' },
    cancelled: { text: '0%', trend: 'same' }
  });

  const [bestSellingProducts, setBestSellingProducts] = useState([]);

  const getLastNMonths = (n = 12) => {
    const res = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
      res.push({ date: d, label });
    }
    return res;
  };

  const getMonthRange = (offset = 0) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + offset;
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 1, 0, 0, 0, 0);
    return { start, end };
  };

  useEffect(() => {
    let timer = null;
    let currentStep = 0;
    const steps = 60;
    const duration = 1000;
    const increment = duration / steps;

    const base = (import.meta.env?.VITE_API_URL) || 'http://localhost:5000';

    const fetchAndAnimate = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${base}/api/sales`);
        if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
        const json = await res.json();
        const sales = json.sales || json || [];

        const counts = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };

        const months = getLastNMonths(12);
        const monthlyMap = {};
        months.forEach(m => {
          monthlyMap[m.label] = 0;
        });

        const currentRange = getMonthRange(0);
        const prevRange = getMonthRange(-1);

        const countsCurrentMonth = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
        const countsPrevMonth = { Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };

        const productMap = {};
        let totalQty = 0;

        sales.forEach(u => {
          const s = u.status || 'Processing';
          if (counts[s] !== undefined) counts[s] += 1;

          const created = u.createdAt ? new Date(u.createdAt) : null;
          if (created) {
            const key = created.toLocaleString(undefined, { month: 'short', year: 'numeric' });
            if (monthlyMap[key] !== undefined) monthlyMap[key] += 1;

            if (created >= currentRange.start && created < currentRange.end) {
              if (countsCurrentMonth[s] !== undefined) countsCurrentMonth[s] += 1;
            }

            if (created >= prevRange.start && created < prevRange.end) {
              if (countsPrevMonth[s] !== undefined) countsPrevMonth[s] += 1;
            }
          }

          const productName = (u.description && String(u.description).trim()) || 'Unknown';
          const qty = Number(u.quantity) || 1;
          productMap[productName] = (productMap[productName] || 0) + qty;
          totalQty += qty;
        });

        const productArray = Object.entries(productMap).map(([name, qty]) => ({
          name,
          qty,
          percent: totalQty > 0 ? (qty / totalQty) * 100 : 0
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 4)
        .map((p, i) => ({
          name: p.name,
          sales: Math.round(p.percent),
          trend: 'up',
          icon: i === 0 ? '🔥' : i === 1 ? '⭐' : i === 2 ? '⚡' : '📦',
          color: i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : i === 2 ? 'bg-green-500' : 'bg-pink-500',
          rawQty: p.qty
        }));

        setBestSellingProducts(productArray.length ? productArray : [
          { name: 'No products yet', sales: 0, trend: 'same', icon: '📦', color: 'bg-gray-300', rawQty: 0 }
        ]);

        const targets = {
          processingOrders: counts.Processing,
          shippedOrders: counts.Shipped,
          deliveredOrders: counts.Delivered,
          cancelledOrders: counts.Cancelled
        };

        const computeChange = (curr, prev) => {
          if (prev === 0) {
            if (curr === 0) return { text: '0%', trend: 'same' };
            return { text: 'New', trend: 'up' };
          }
          const diff = curr - prev;
          const percent = ((diff / prev) * 100);
          const rounded = `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`;
          const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
          return { text: rounded, trend };
        };

        const statusChanges = {
          processing: computeChange(countsCurrentMonth.Processing, countsPrevMonth.Processing),
          shipped: computeChange(countsCurrentMonth.Shipped, countsPrevMonth.Shipped),
          delivered: computeChange(countsCurrentMonth.Delivered, countsPrevMonth.Delivered),
          cancelled: computeChange(countsCurrentMonth.Cancelled, countsPrevMonth.Cancelled)
        };

        const newChartData = months.map(m => ({ month: m.label, orders: monthlyMap[m.label] || 0 }));

        setChartData(newChartData);

        currentStep = 0;
        if (timer) clearInterval(timer);

        timer = setInterval(() => {
          currentStep++;
          const progress = Math.min(currentStep / steps, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);

          setAnimatedValues({
            processingOrders: Math.floor(targets.processingOrders * easeOutQuart),
            shippedOrders: Math.floor(targets.shippedOrders * easeOutQuart),
            deliveredOrders: Math.floor(targets.deliveredOrders * easeOutQuart),
            cancelledOrders: Math.floor(targets.cancelledOrders * easeOutQuart)
          });

          if (currentStep >= steps) {
            clearInterval(timer);
            timer = null;
            setAnimatedValues(targets);
            setLoading(false);
          }
        }, increment);

        setComputedChanges(statusChanges);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Unknown error');
        setLoading(false);
      }
    };

    fetchAndAnimate();

    const pollInterval = setInterval(fetchAndAnimate, 30000);

    return () => {
      if (timer) clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, []);

  const statsCards = [
    {
      key: 'processing',
      title: 'Processing Orders',
      value: animatedValues.processingOrders,
      change: computedChanges.processing.text,
      trend: computedChanges.processing.trend,
      icon: '💰',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      key: 'shipped',
      title: 'Shipped Orders',
      value: animatedValues.shippedOrders,
      change: computedChanges.shipped.text,
      trend: computedChanges.shipped.trend,
      icon: '📦',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      key: 'delivered',
      title: 'Delivered Orders',
      value: animatedValues.deliveredOrders,
      change: computedChanges.delivered.text,
      trend: computedChanges.delivered.trend,
      icon: '👥',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      key: 'cancelled',
      title: 'Cancelled Orders',
      value: animatedValues.cancelledOrders,
      change: computedChanges.cancelled.text,
      trend: computedChanges.cancelled.trend,
      icon: '⚠️',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">

      <AdminNav sidebarItems={[
        { label: 'Dashboard', to: '/admin' },
        { label: 'Orders Overview', to: '/admin/order-overview', active: true },
        { label: 'Orders', to: '/admin/orders' }
      ]} />

      <div className="flex-1 overflow-auto">
        <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 animate-fade-in">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Overview of your store performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((card, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100/50 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: `${index * 200}ms` }}>
                    {card.icon}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center px-2 py-1 rounded-lg ${
                    card.trend === 'up' ? 'bg-green-100' : card.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {card.trend === 'up' ? (
                      <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                    ) : card.trend === 'down' ? (
                      <ArrowDown className="w-3 h-3 text-red-600 mr-1" />
                    ) : (
                      <span className="w-3 h-3 inline-block mr-1" />
                    )}
                    <span className={`text-xs font-semibold ${
                      card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${card.gradient} animate-progress`}
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-100/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-3xl font-bold text-gray-900">{chartData.reduce((s, d) => s + d.orders, 0)}</span>
                    <div className="flex items-center ml-3 px-2 py-1 bg-green-100 rounded-lg">
                      <ArrowUp className="w-3 h-3 text-green-600 mr-1" />
                      <span className="text-xs font-semibold text-green-600">vs last year</span>
                    </div>
                  </div>
                </div>
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900">
                  <option>Last 12 months</option>
                  <option>Last 6 months</option>
                </select>
              </div>

              <div className="relative h-64">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">Loading chart...</div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-500">{error}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopOpacity={0.8} stopColor="#7c3aed" />
                          <stop offset="95%" stopOpacity={0} stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="orders" stroke="#7c3aed" fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-2" />
                    <span className="text-sm text-gray-600">This Year</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full mr-2" />
                    <span className="text-sm text-gray-600">Last Year</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-100/50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Best Selling Products</h3>
              <div className="space-y-4">
                {bestSellingProducts.map((product, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-all duration-300 hover:scale-105 animate-slide-in-right"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${product.color} bg-opacity-20 rounded-xl flex items-center justify-center`}>
                        <span className="text-lg">{product.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.rawQty} units • {product.sales}% of total</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
                        <div 
                          className={`${product.color} h-full animate-progress`}
                          style={{ width: `${product.sales}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{product.sales}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }

        .animate-progress {
          animation: progress 1.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
