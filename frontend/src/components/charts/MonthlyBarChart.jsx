import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const createGradient = (ctx, chartArea) => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
  gradient.addColorStop(0.4, 'rgba(16, 185, 129, 0.45)');
  gradient.addColorStop(1, 'rgba(5, 150, 105, 0.92)');
  return gradient;
};

export default function MonthlyBarChart({ data = [], activeMonth }) {
  const chartData = useMemo(() => {
    const labels = data.map((item) => item.label);
    const totals = data.map((item) => item.net);

    return {
      labels,
      datasets: [
        {
          label: 'Net payout (LKR)',
          data: totals,
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: (context) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return 'rgba(16,185,129,0.8)';
            return createGradient(ctx, chartArea);
          },
          hoverBackgroundColor: 'rgba(4, 120, 87, 0.95)',
        },
      ],
    };
  }, [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 12,
        callbacks: {
          label: (ctx) => ` Net: LKR ${Number(ctx.parsed.y || 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#475569',
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.25)',
          drawBorder: false,
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          callback: (value) => (value >= 1000 ? `${value / 1000}k` : value),
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  }), []);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Performance Overview</p>
          <p className="text-lg font-semibold text-emerald-700">
            LKR {data.reduce((sum, item) => sum + item.net, 0).toLocaleString()}
          </p>
        </div>
        {activeMonth ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Focus: {activeMonth}
          </span>
        ) : null}
      </div>
      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
