import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardShell from '../../components/common/DashboardShell';
import StockAlerts from '../../components/inventory/StockAlerts';
import ProductForm from '../../components/inventory/ProductForm';
import Reports from '../../components/inventory/Reports';
import { InventoryAPI } from '../../api/inventoryApi';

const fontHref = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap';

export default function InventoryManagement() {
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const existing = Array.from(document.head.querySelectorAll('link[href^="https://fonts.googleapis.com/css2?family=Poppins"]'));
    if (existing.length === 0) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontHref;
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');
    if (!productId) {
      setSelectedProduct(null);
      return;
    }
    (async () => {
      try {
        const data = await InventoryAPI.listProducts();
        const match = Array.isArray(data) ? data.find((item) => item._id === productId) : null;
        if (match) setSelectedProduct(match);
      } catch (e) {
        console.warn('Unable to preload product for editing:', e);
      }
    })();
  }, [location.search]);

  const menu = useMemo(() => ([
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/inventory', label: 'Inventory Management' },
    { to: '/admin/inventory/stock', label: 'Stock' },
    { to: '/admin/inventory/restock', label: 'Restock' },
  ]), []);

  return (
    <DashboardShell
      menu={menu}
      title="Inventory Management"
      subtitle="Monitor alerts, capture catalogue changes, and keep reports current"
    >
      <div className="space-y-8">
        <section
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-0 shadow-2xl border border-slate-700"
          style={{ fontFamily: '"Poppins", ui-sans-serif, system-ui' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/images/Tea-leaf-teal-background.png')] bg-cover bg-center opacity-5" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-cyan-500/10" />
          
          {/* Geometric decorations */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="max-w-4xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-lg mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                REAL-TIME INVENTORY ORCHESTRATION
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl lg:text-6xl font-black leading-tight text-white mb-6">
                Master Your
                <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Inventory Flow
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mb-8 font-medium">
                Centralized command center for batch tracking, stock alerts, and catalog management. 
                <span className="text-white font-semibold"> Real-time synchronization</span> across all inventory operations.
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a2 2 0 10-4 0v5h-5l5 5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Live Alerts</p>
                    <p className="text-slate-400 text-xs">Instant notifications</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Batch Tracking</p>
                    <p className="text-slate-400 text-xs">Full traceability</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">PDF Reports</p>
                    <p className="text-slate-400 text-xs">Export summaries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <StockAlerts />
        <ProductForm selected={selectedProduct} onSaved={() => setSelectedProduct(null)} />
        <Reports />
      </div>
    </DashboardShell>
  );
}
