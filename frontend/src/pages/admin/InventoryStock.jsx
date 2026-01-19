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
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-800 to-cyan-800 shadow-2xl border border-blue-700"
          style={{ fontFamily: '"Poppins", ui-sans-serif, system-ui' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('/images/Tea-leaf-teal-background.png')] bg-cover bg-center opacity-5" aria-hidden="true" />
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-3xl space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg">
                  <ClipboardList className="h-5 w-5" />
                  STOCK MONITORING CENTER
                </div>
                
                {/* Main Heading */}
                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white">
                  Comprehensive
                  <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Stock Overview
                  </span>
                </h1>
                
                {/* Description */}
                <p className="text-lg text-blue-100 leading-relaxed font-medium">
                  Advanced filtering and real-time status monitoring for all inventory items. 
                  <span className="text-white font-semibold"> Track batches, expiry dates, and stock levels</span> with precision accuracy.
                </p>
                
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-white">Live</div>
                    <div className="text-xs text-blue-200">Updates</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-white">Smart</div>
                    <div className="text-xs text-blue-200">Filters</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-white">Batch</div>
                    <div className="text-xs text-blue-200">Tracking</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center">
                    <div className="text-2xl font-bold text-white">Export</div>
                    <div className="text-xs text-blue-200">Ready</div>
                  </div>
                </div>
              </div>
              
              {/* Action Panel */}
              <div className="lg:min-w-fit">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Need to add products?</p>
                        <p className="text-blue-200 text-sm">Access the catalog editor</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => navigate('/admin/inventory')}
                      className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 text-sm font-bold text-white transition-all duration-200 hover:from-cyan-600 hover:to-blue-600 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <ArrowRightCircle className="h-5 w-5" />
                      Manage Catalogue
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
