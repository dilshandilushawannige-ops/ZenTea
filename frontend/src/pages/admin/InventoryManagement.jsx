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
          className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 p-8 text-white shadow-2xl"
          style={{ fontFamily: '"Poppins", ui-sans-serif, system-ui' }}
        >
          <div className="flex flex-col gap-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold tracking-wide text-white/90">
              Real-time batch orchestration
            </p>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Keep every product, batch, and alert aligned in one workspace
            </h2>
            <p className="max-w-3xl text-sm font-medium text-white/80">
              Review inbound alerts, register catalogue updates, and export PDF summaries without leaving the page.
            </p>
          </div>
        </section>

        <StockAlerts />
        <ProductForm selected={selectedProduct} onSaved={() => setSelectedProduct(null)} />
        <Reports />
      </div>
    </DashboardShell>
  );
}
