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
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-800 shadow-2xl border border-purple-700"
          style={{ fontFamily: '"Poppins", ui-sans-serif, system-ui' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/images/Tea-leaf-teal-background.png')] bg-cover bg-center opacity-5" aria-hidden="true" />
          <div className="absolute inset-0">
            <div className="absolute top-4 right-4 w-72 h-72 bg-gradient-to-bl from-violet-400/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-4 left-4 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute center w-48 h-48 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-2xl" />
          </div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg">
                  <RefreshCcw className="h-5 w-5" />
                  RESTOCK OPERATIONS HUB
                </div>
                
                {/* Main Heading */}
                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white">
                  Streamlined
                  <span className="block bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    Stock Replenishment
                  </span>
                </h1>
                
                {/* Description */}
                <p className="text-lg text-purple-100 leading-relaxed font-medium">
                  Efficient batch-level inventory management with complete traceability. 
                  <span className="text-white font-semibold"> Record deliveries instantly</span> and maintain audit trails automatically.
                </p>
                
                {/* Process Steps */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-purple-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span className="font-medium">Select product from inventory</span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span className="font-medium">Enter batch details & quantity</span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-100">
                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <span className="font-medium">Auto-update alerts & dashboards</span>
                  </div>
                </div>
              </div>
              
              {/* Feature Panel */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
                      <ClipboardPlus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Batch-First Design</p>
                      <p className="text-purple-200 text-sm mt-1">Every entry captures quantity, batch number, and supplier notes for comprehensive audit trails and quality control.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Smart Adjustments</p>
                      <p className="text-purple-200 text-sm mt-1">Handle over-deliveries with negative quantity entries. Create balancing transactions for perfect inventory accuracy.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Restock />
      </div>
    </DashboardShell>
  );
}
