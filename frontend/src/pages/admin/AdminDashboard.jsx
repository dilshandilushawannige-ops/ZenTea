import React, { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import { adminListUsers, adminUpdateUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import MonthlyBarChart from '../../components/charts/MonthlyBarChart.jsx';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const roleOrder = ['Admin', 'Collector', 'Supplier', 'Employee', 'Customer'];

const getBadge = (value) => {
  if (value === 0) return { text: 'Stable', tone: 'bg-slate-100 text-slate-500' };
  if (value > 0) return { text: `+${value} new`, tone: 'bg-emerald-100 text-emerald-600' };
  return { text: `${value} changed`, tone: 'bg-amber-100 text-amber-600' };
};

export default function AdminDashboard() {
  const menu = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/salary', label: 'Salary Management' },
    { to: '/admin/inventory', label: 'Inventory Management' },
    { to: '/admin/order', label: 'Order Management' },
  ];

  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const list = Array.isArray(users) ? users : [];

  const load = async () => {
    if (!token) {
      setUsers([]);
      return;
    }
    try {
      const { data } = await adminListUsers(token);
      const list = Array.isArray(data) ? data : Array.isArray(data?.users) ? data.users : [];
      setUsers(list);
    } catch (err) {
      console.error('Failed to load users', err);
      setUsers([]);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const update = async (u, changes) => {
    try {
      await adminUpdateUser(token, u._id, changes);
      await load();
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const stats = useMemo(() => {
    const total = list.length;
    const pending = list.filter((u) => !u.isActive).length;
    const active = total - pending;
    const employees = list.filter((u) => u.role === 'Employee').length;
    return [
      { label: 'Total Users', value: total, sub: 'All roles combined', accent: 'from-emerald-400 to-emerald-600', icon: '??', badge: getBadge(total - active) },
      { label: 'Active Accounts', value: active, sub: 'Approved & enabled', accent: 'from-blue-400 to-blue-600', icon: '?', badge: getBadge(active - employees) },
      { label: 'Pending Approval', value: pending, sub: 'Awaiting review', accent: 'from-amber-400 to-amber-500', icon: '?', badge: getBadge(pending) },
      { label: 'Employees', value: employees, sub: 'Payroll staff', accent: 'from-purple-400 to-purple-600', icon: '??', badge: getBadge(employees) },
    ];
  }, [list]);

  const roleBreakdown = useMemo(() => {
    const counts = roleOrder.map((role) => ({
      role,
      count: list.filter((u) => u.role === role).length,
    }));
    const total = counts.reduce((sum, item) => sum + item.count, 0) || 1;
    return counts.map((item) => ({
      ...item,
      percent: Math.round((item.count / total) * 100),
    }));
  }, [list]);

  const chartData = useMemo(() => (
    roleBreakdown.filter((item) => item.count > 0).map((item) => ({
      label: item.role,
      net: item.count,
    }))
  ), [roleBreakdown]);

  return (
    <DashboardShell
      menu={menu}
      title="Admin Overview"
      subtitle="Monitor account activity and manage team access"
    >
      <div className="space-y-8">
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((card) => (
            <div key={card.label} className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r opacity-90 ${card.accent}" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                  {card.icon}
                </div>
              </div>
              <span className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${card.badge.tone}`}>
                {card.badge.text}
              </span>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Team Composition</p>
                <p className="text-lg font-semibold text-slate-900">Accounts by role</p>
              </div>
            </div>
            {chartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">No user data available yet.</p>
            ) : (
              <MonthlyBarChart data={chartData} activeMonth={null} />
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-700">Role Distribution</p>
            <ul className="mt-4 space-y-4">
              {roleBreakdown.map((item) => (
                <li key={item.role} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.role}</p>
                    <p className="text-xs text-slate-500">{item.count} accounts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.percent}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">{item.percent}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
              <p className="text-sm text-slate-500">Approve, update and manage platform access</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Name', 'Email', 'Role', 'Unique ID', 'Active', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {list.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500">{u.role}</td>
                    <td className="px-4 py-3 text-slate-500">{u.uniqueId}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${u.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {u.isActive ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => update(u, { isActive: !u.isActive })}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                        >
                          {u.isActive ? 'Revoke' : 'Approve'}
                        </button>
                        <select
                          defaultValue={u.role}
                          onChange={(e) => update(u, { role: e.target.value })}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-emerald-500"
                        >
                          {roleOrder.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">No users onboarded yet.</p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}





