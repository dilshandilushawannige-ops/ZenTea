import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminNav({ sidebarItems }) {
  const loc = useLocation();

  const items = sidebarItems && Array.isArray(sidebarItems) && sidebarItems.length > 0
    ? sidebarItems
    : [
        { label: 'Dashboard', to: '/admin' },
        { label: 'Orders Overview', to: '/admin/order-overview' },
        { label: 'Orders', to: '/admin/orders' },
      ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-semibold">ZT</div>
        <div>
          <p className="text-sm font-medium text-slate-500">ZenTea Admin</p>
          <p className="text-lg font-semibold text-slate-800">Order Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item, idx) => {
          const active = item.to && loc.pathname === item.to;
          const content = (
            <div
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                active ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{item.label}</span>
            </div>
          );
          return item.to ? (
            <Link key={idx} to={item.to} className="block">
              {content}
            </Link>
          ) : (
            <div key={idx}>{content}</div>
          );
        })}
      </nav>
    </aside>
  );
}


