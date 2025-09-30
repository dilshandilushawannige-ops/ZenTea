import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ArrowRightCircle } from 'lucide-react';
import DashboardShell from '../../components/common/DashboardShell';
import ProductTable from '../../components/inventory/ProductTable';

const fontHref = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap';

export default function InventoryStock() {
  const navigate = useNavigate();

  useEffect(() => {
    const existing = Array.from(
      document.head.querySelectorAll('link[href^="https://fonts.googleapis.com/css2?family=Poppins"]')
    );
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

  const menu = useMemo(() => ([
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/inventory', label: 'Inventory Management' },
    { to: '/admin/inventory/stock', label: 'Stock' },
    { to: '/admin/inventory/restock', label: 'Restock' },
  ]), []);

  return (
    <DashboardShell
      menu={menu}
      title="Inventory Stock"
      subtitle="Search, filter, and export current stock positions"
    >
      <div className="space-y-8">
        <section
          className="rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 p-8 text-white shadow-2xl"
          style={{ fontFamily: '"Poppins", ui-sans-serif, system-ui' }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white/90">
                <ClipboardList className="h-4 w-4" /> Stock coverage overview
              </p>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Browse products, status tags, and batch metadata in one table
              </h2>
              <p className="text-sm font-medium text-white/80">
                Use filters to locate low stock, near expiry batches, or search by product name and batch number. Jump back to inventory management to edit catalogue details whenever needed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/inventory')}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/20"
            >
              <ArrowRightCircle className="h-4 w-4" />
              Manage catalogue
            </button>
          </div>
        </section>

        <ProductTable
          hideForm={true}
          onSelectProduct={(product) => {
            navigate(`/admin/inventory?productId=${product._id}`);
          }}
        />
      </div>
    </DashboardShell>
  );
}
