import React, { useEffect } from 'react';
import { RefreshCcw, ClipboardPlus } from 'lucide-react';
import DashboardShell from '../../components/common/DashboardShell';
import Restock from '../../components/inventory/Restock';

const menu = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/inventory', label: 'Inventory Management' },
  { to: '/admin/inventory/stock', label: 'Stock' },
  { to: '/admin/inventory/restock', label: 'Restock' },
];

const fontHref = 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap';

export default function InventoryRestock() {
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

  return (
    <DashboardShell
      menu={menu}
      title="Restock Inventory"
      subtitle="Capture batch-level replenishments with full traceability"
    >
      <div className="space-y-8">
        <section
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 text-white shadow-2xl"
          style={{ fontFamily: '"Poppins", ui-sans-serif, system-ui' }}
        >
          <div className="absolute inset-0 bg-[url('/images/Tea-leaf-teal-background.png')] bg-cover bg-center opacity-10" aria-hidden="true" />
          <div className="relative z-10 grid gap-6 p-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white/90">
                <RefreshCcw className="h-4 w-4" /> Batch traceability in seconds
              </p>
              <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Log new stock without breaking your workflow
              </h2>
              <p className="text-white/80">
                Record supplier deliveries, capture batch numbers, and instantly update alerts and dashboards.
              </p>
            </div>
            <div className="space-y-4 rounded-3xl bg-white/10 p-6 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                  <ClipboardPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Batch-first design</p>
                  <p className="text-sm text-white/80">Every entry saves the quantity, note, and batch number for later auditing.</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white/80">
                Need to adjust an over-delivery? Use negative quantities in the transaction history to create balancing OUT entries.
              </div>
            </div>
          </div>
        </section>

        <Restock />
      </div>
    </DashboardShell>
  );
}
