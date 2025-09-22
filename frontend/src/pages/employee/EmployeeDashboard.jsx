import React, { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import MonthlyBarChart from '../../components/charts/MonthlyBarChart.jsx';
import { getMySalary, listMyPayslips, downloadPayslip } from '../../api/salaryApi';
import Swal from 'sweetalert2';

const formatMonthLabel = (isoMonth) => {
  if (!isoMonth) return '';
  const [year, month] = isoMonth.split('-');
  if (!year || !month) return isoMonth;
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return isoMonth;
  try {
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  } catch (err) {
    return isoMonth;
  }
};

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatCurrency = (value) => {
  const numeric = toNumber(value);
  return `LKR ${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const trendBadge = (delta) => {
  if (delta === null || Number.isNaN(delta)) {
    return { text: 'No previous year', tone: 'bg-slate-100 text-slate-500' };
  }
  if (delta === 0) {
    return { text: 'Flat vs last year', tone: 'bg-slate-100 text-slate-600' };
  }
  if (delta > 0) {
    return { text: `+${delta.toFixed(1)}% vs last year`, tone: 'bg-emerald-100 text-emerald-600' };
  }
  return { text: `${delta.toFixed(1)}% vs last year`, tone: 'bg-amber-100 text-amber-600' };
};

export default function EmployeeDashboard() {
  const menu = [{ to: '/employee', label: 'My Salary' }];

  const [salary, setSalary] = useState(null);
  const [slips, setSlips] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: salaryData }, slipsRes] = await Promise.all([getMySalary(), listMyPayslips()]);
        setSalary(salaryData);
        setSlips(slipsRes.data || []);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: err.response?.data?.message || 'Failed to load salary data',
          toast: true,
          position: 'top',
        });
      }
    };
    load();
  }, []);

  const monthlyAggregates = useMemo(() => {
    const map = new Map();
    slips.forEach((slip) => {
      if (!slip.month) return;
      if (!map.has(slip.month)) {
        map.set(slip.month, { month: slip.month, net: 0, gross: 0, otHours: 0, count: 0 });
      }
      const entry = map.get(slip.month);
      const breakdown = slip.breakdown || {};
      entry.net += toNumber(breakdown.net);
      entry.gross += toNumber(breakdown.gross);
      entry.otHours += toNumber(breakdown.weekdayOtHours) + toNumber(breakdown.holidayOtHours);
      entry.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [slips]);

  const yearOptions = useMemo(() => {
    const years = new Set();
    monthlyAggregates.forEach((entry) => {
      if (entry.month?.length >= 4) {
        years.add(entry.month.slice(0, 4));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [monthlyAggregates]);

  const latestYear = yearOptions[0] || '';
  useEffect(() => {
    if (!yearOptions.length) {
      setSelectedYear('');
      return;
    }
    if (!selectedYear) {
      setSelectedYear(latestYear);
      return;
    }
    if (selectedYear !== 'all' && !yearOptions.includes(selectedYear)) {
      setSelectedYear(latestYear);
    }
  }, [yearOptions, latestYear, selectedYear]);

  const monthsForChart = useMemo(() => {
    if (selectedYear === 'all' || !selectedYear) {
      return monthlyAggregates;
    }
    return monthlyAggregates.filter((entry) => entry.month.startsWith(selectedYear));
  }, [monthlyAggregates, selectedYear]);

  const chartData = useMemo(
    () =>
      monthsForChart.map((entry) => ({
        label: formatMonthLabel(entry.month),
        net: Number(entry.net.toFixed(2)),
      })),
    [monthsForChart]
  );

  const totalNetYear = monthsForChart.reduce((sum, entry) => sum + entry.net, 0);
  const totalGrossYear = monthsForChart.reduce((sum, entry) => sum + entry.gross, 0);
  const totalOtHoursYear = monthsForChart.reduce((sum, entry) => sum + entry.otHours, 0);
  const averageNet = monthsForChart.length ? totalNetYear / monthsForChart.length : 0;

  const hasYearSelection = selectedYear && selectedYear !== 'all';
  const previousYearInfo = useMemo(() => {
    if (!hasYearSelection) {
      return { net: 0, hasData: false };
    }
    if (!Number.isFinite(Number(selectedYear))) {
      return { net: 0, hasData: false };
    }
    const prevYear = String(Number(selectedYear) - 1);
    const entries = monthlyAggregates.filter((entry) => entry.month.startsWith(prevYear));
    const net = entries.reduce((sum, entry) => sum + entry.net, 0);
    return { net, hasData: entries.length > 0 };
  }, [hasYearSelection, monthlyAggregates, selectedYear]);

  const deltaPercent =
    hasYearSelection && previousYearInfo.hasData && previousYearInfo.net > 0
      ? ((totalNetYear - previousYearInfo.net) / previousYearInfo.net) * 100
      : null;

  const latestSlip = slips[0] || null;
  const latestSlipLabel = latestSlip?.month ? formatMonthLabel(latestSlip.month) : null;
  const latestSlipNet = latestSlip?.breakdown?.net ? formatCurrency(latestSlip.breakdown.net) : null;

  const netThisMonth = toNumber(salary?.breakdown?.net);
  const grossThisMonth = toNumber(salary?.breakdown?.gross);
  const totalOtHours = toNumber(salary?.weekdayOtHours) + toNumber(salary?.holidayOtHours);
  const loanBalance = toNumber(salary?.loan);
  const allowances = toNumber(salary?.allowances);
  const bonus = toNumber(salary?.bonus);
  const deductions = toNumber(salary?.deductions);
  const epf = toNumber(salary?.breakdown?.epf);
  const etf = toNumber(salary?.breakdown?.etf);

  const statsCards = useMemo(() => {
    const yearLabel = hasYearSelection ? selectedYear : 'All time';
    const badgeForYear = trendBadge(deltaPercent);
    const activeMonthLabel =
      monthsForChart.length && hasYearSelection
        ? formatMonthLabel(monthsForChart[monthsForChart.length - 1].month)
        : latestSlipLabel;

    return [
      {
        label: 'Net Salary (Current)',
        value: netThisMonth,
        sub: 'After deductions',
        accent: 'from-emerald-400 to-emerald-600',
        icon: '💰',
        badge: activeMonthLabel
          ? { text: `Latest: ${activeMonthLabel}`, tone: 'bg-emerald-100 text-emerald-600' }
          : { text: 'No payslip yet', tone: 'bg-slate-100 text-slate-500' },
        format: 'currency',
      },
      {
        label: `Net Pay (${yearLabel})`,
        value: totalNetYear,
        sub: hasYearSelection ? `Total earnings in ${selectedYear}` : 'All recorded net pay',
        accent: 'from-blue-400 to-blue-600',
        icon: '📈',
        badge: badgeForYear,
        format: 'currency',
      },
      {
        label: 'Average Monthly Net',
        value: averageNet,
        sub: `${monthsForChart.length || 0} payslips analysed`,
        accent: 'from-purple-400 to-purple-600',
        icon: '📊',
        badge: {
          text: `Gross this period: ${formatCurrency(totalGrossYear)}`,
          tone: 'bg-purple-100 text-purple-600',
        },
        format: 'currency',
      },
      {
        label: 'OT Hours (YTD)',
        value: totalOtHoursYear,
        sub: hasYearSelection ? `Hours logged in ${selectedYear}` : 'All recorded hours',
        accent: 'from-amber-400 to-amber-500',
        icon: '⏱️',
        badge: {
          text: `Current month: ${totalOtHours.toFixed(1)} hrs`,
          tone: 'bg-amber-100 text-amber-600',
        },
        format: 'number',
      },
    ];
  }, [
    averageNet,
    deltaPercent,
    hasYearSelection,
    latestSlipLabel,
    monthsForChart,
    netThisMonth,
    selectedYear,
    totalGrossYear,
    totalNetYear,
    totalOtHours,
    totalOtHoursYear,
  ]);

  const yearSelectOptions = useMemo(() => {
    if (!yearOptions.length) {
      return [];
    }
    if (yearOptions.length === 1) {
      return yearOptions;
    }
    return ['all', ...yearOptions];
  }, [yearOptions]);

  const filteredSlips = useMemo(() => {
    if (!hasYearSelection || selectedYear === 'all') {
      return slips;
    }
    return slips.filter((slip) => slip.month?.startsWith(selectedYear));
  }, [hasYearSelection, selectedYear, slips]);

  const recentSlips = useMemo(() => filteredSlips.slice(0, 5), [filteredSlips]);

  return (
    <DashboardShell
      menu={menu}
      title="My Earnings"
      subtitle="Track salary history, overtime and recent payouts"
    >
      <div className="space-y-8">
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r opacity-90 ${card.accent}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">
                    {card.format === 'currency'
                      ? formatCurrency(card.value)
                      : card.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </p>
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
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Earnings Trend</p>
                <p className="text-lg font-semibold text-slate-900">Net salary by month</p>
              </div>
              {yearSelectOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="year-filter" className="text-xs font-medium text-slate-500">
                    Filter by year
                  </label>
                  <select
                    id="year-filter"
                    value={selectedYear || ''}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-emerald-200"
                  >
                    {yearSelectOptions.map((year) => (
                      <option key={year} value={year}>
                        {year === 'all' ? 'All years' : year}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {chartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">
                No payslip data available yet. Payslips will appear here once generated.
              </p>
            ) : (
              <MonthlyBarChart
                data={chartData}
                activeMonth={
                  hasYearSelection && monthsForChart.length
                    ? formatMonthLabel(monthsForChart[monthsForChart.length - 1].month)
                    : null
                }
              />
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-700">Year in Review</p>
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex items-center justify-between">
                <span>Total gross</span>
                <span className="font-semibold text-slate-800">{formatCurrency(totalGrossYear)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Average net</span>
                <span className="font-semibold text-slate-800">{formatCurrency(averageNet)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>OT hours</span>
                <span className="font-semibold text-slate-800">
                  {totalOtHoursYear.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hrs
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Loan balance</span>
                <span className="font-semibold text-slate-800">{formatCurrency(loanBalance)}</span>
              </li>
              {latestSlip && (
                <li className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Latest payout</span>
                  <span className="font-semibold text-emerald-600">
                    {latestSlipLabel} · {latestSlipNet}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Salary Breakdown</h2>
            {salary ? (
              <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Basic</p>
                  <p className="text-base font-semibold text-slate-800">{formatCurrency(salary.basic)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Allowances</p>
                  <p className="text-base font-semibold text-slate-800">{formatCurrency(allowances)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Weekday OT</p>
                  <p className="text-base font-semibold text-slate-800">
                    {toNumber(salary.weekdayOtHours).toFixed(1)} hrs · {formatCurrency(salary.breakdown?.weekdayOT)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Holiday OT</p>
                  <p className="text-base font-semibold text-slate-800">
                    {toNumber(salary.holidayOtHours).toFixed(1)} hrs · {formatCurrency(salary.breakdown?.holidayOT)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Bonus</p>
                  <p className="text-base font-semibold text-slate-800">{formatCurrency(bonus)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Deductions</p>
                  <p className="text-base font-semibold text-slate-800">{formatCurrency(deductions)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">EPF</p>
                  <p className="text-base font-semibold text-slate-800">{formatCurrency(epf)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">ETF</p>
                  <p className="text-base font-semibold text-slate-800">{formatCurrency(etf)}</p>
                </div>
                <div className="sm:col-span-2 rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-emerald-600">Take-home pay</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">{formatCurrency(netThisMonth)}</p>
                  <p className="text-xs text-emerald-600">Gross: {formatCurrency(grossThisMonth)}</p>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">No salary record available yet.</p>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Payslips</h2>
              {filteredSlips.length > recentSlips.length && (
                <span className="text-xs text-slate-400">Showing latest {recentSlips.length}</span>
              )}
            </div>
            {recentSlips.length ? (
              <ul className="mt-4 space-y-4">
                {recentSlips.map((slip) => (
                  <li
                    key={slip.slipNo}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{formatMonthLabel(slip.month)}</p>
                      <p className="text-xs text-slate-500">
                        Slip {slip.slipNo} · {slip.createdAt ? new Date(slip.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-emerald-600">{formatCurrency(slip.breakdown?.net)}</span>
                      <button
                        type="button"
                        onClick={() => downloadPayslip(slip.slipNo)}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100"
                      >
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-slate-500">No payslips generated yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Payslip History</h2>
              <p className="text-xs text-slate-500">
                {hasYearSelection ? `Filtered by ${selectedYear}` : 'Showing all payslips'}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Month', 'Slip #', 'Net pay', 'Generated on', 'Action'].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSlips.map((slip) => (
                  <tr key={slip.slipNo} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-800">{formatMonthLabel(slip.month)}</td>
                    <td className="px-4 py-3 text-slate-500">{slip.slipNo}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(slip.breakdown?.net)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {slip.createdAt ? new Date(slip.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => downloadPayslip(slip.slipNo)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-emerald-500 hover:text-emerald-600"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSlips.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">No payslips to display for this selection.</p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
