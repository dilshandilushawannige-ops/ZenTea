import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import WeatherWidget from '../../components/common/WeatherWidget.jsx';
import DashboardShell from '../../components/common/DashboardShell.jsx';
import { listPlots } from '../../api/plotsApi.js';
import { listCrops } from '../../api/cropsApi.js';

export default function AdminPanelDashboard() {
  const [plots, setPlots] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  // PDF Report Generation Function
  const generateCultivationReport = async (plots, crops, reportType) => {
    try {
      setGeneratingReport(true);
      
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(11, 107, 60); // emerald-600
      doc.text('ZenTea Cultivation Report', 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${currentDate}`, 20, 40);
      
      let yPosition = 60;
      
      // Report Title based on type
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      const reportTitles = {
        complete: 'Complete Cultivation Report',
        plots: 'Plots Summary Report',
        crops: 'Crops Summary Report'
      };
      doc.text(reportTitles[reportType], 20, yPosition);
      yPosition += 20;
      
      // Summary Statistics
      const totalPlots = plots.length;
      const activeCrops = crops.filter(c => c.status === 'Active').length;
      const retiredCrops = crops.filter(c => c.status === 'Retired').length;
      const replantedCrops = crops.filter(c => c.status === 'Replanted').length;
      const totalArea = plots.reduce((sum, p) => sum + (Number(p.areaHa) || 0), 0);
      
      doc.setFontSize(12);
      doc.text('Summary Statistics:', 20, yPosition);
      yPosition += 10;
      doc.text(`• Total Plots: ${totalPlots}`, 30, yPosition);
      yPosition += 7;
      doc.text(`• Active Crops: ${activeCrops}`, 30, yPosition);
      yPosition += 7;
      doc.text(`• Retired Crops: ${retiredCrops}`, 30, yPosition);
      yPosition += 7;
      doc.text(`• Replanted Crops: ${replantedCrops}`, 30, yPosition);
      yPosition += 7;
      doc.text(`• Total Area: ${totalArea.toFixed(2)} hectares`, 30, yPosition);
      yPosition += 20;
      
      // Plots Table (if included in report type)
      if (reportType === 'complete' || reportType === 'plots') {
        doc.setFontSize(14);
        doc.text('Plots Information', 20, yPosition);
        yPosition += 10;
        
        const plotsData = plots.map(plot => [
          plot.name || 'N/A',
          plot.estateName || 'N/A',
          `${plot.areaHa || 0} ha`,
          `${plot.elevationM || 0} m`,
          plot.soilType || 'Other',
          new Date(plot.createdAt).toLocaleDateString()
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Plot Name', 'Estate', 'Area', 'Elevation', 'Soil Type', 'Created']],
          body: plotsData,
          theme: 'grid',
          headStyles: { fillColor: [11, 107, 60] },
          styles: { fontSize: 10 },
          margin: { left: 20, right: 20 }
        });
        
        yPosition = doc.lastAutoTable.finalY + 20;
      }
      
      // Crops Table (if included in report type)
      if ((reportType === 'complete' || reportType === 'crops') && yPosition < 250) {
        if (yPosition > 200) {
          doc.addPage();
          yPosition = 30;
        }
        
        doc.setFontSize(14);
        doc.text('Crops Information', 20, yPosition);
        yPosition += 10;
        
        const cropsData = crops.map(crop => [
          crop.cultivarName || 'N/A',
          crop.plot?.name || 'N/A',
          new Date(crop.plantingDate).toLocaleDateString(),
          `${crop.expectedMaturityMonths || 0} months`,
          crop.status || 'N/A',
          (crop.notes || 'No notes').substring(0, 50) + (crop.notes && crop.notes.length > 50 ? '...' : '')
        ]);
        
        autoTable(doc, {
          startY: yPosition,
          head: [['Cultivar', 'Plot', 'Planting Date', 'Maturity', 'Status', 'Notes']],
          body: cropsData,
          theme: 'grid',
          headStyles: { fillColor: [11, 107, 60] },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 },
          columnStyles: {
            5: { cellWidth: 40 } // Notes column
          }
        });
      }
      
      // Soil Type Distribution (for complete and plots reports)
      if ((reportType === 'complete' || reportType === 'plots') && plots.length > 0) {
        const soilCounts = {};
        plots.forEach(plot => {
          const soil = plot.soilType || 'Other';
          soilCounts[soil] = (soilCounts[soil] || 0) + 1;
        });
        
        if (doc.lastAutoTable && doc.lastAutoTable.finalY > 220) {
          doc.addPage();
          yPosition = 30;
        } else {
          yPosition = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : yPosition + 20;
        }
        
        doc.setFontSize(14);
        doc.text('Soil Type Distribution', 20, yPosition);
        yPosition += 10;
        
        Object.entries(soilCounts).forEach(([soil, count]) => {
          const percentage = ((count / totalPlots) * 100).toFixed(1);
          doc.text(`• ${soil}: ${count} plots (${percentage}%)`, 30, yPosition);
          yPosition += 7;
        });
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 20, 285);
        doc.text('ZenTea Cultivation Management System', 120, 285);
      }
      
      // Save the PDF
      const fileName = `ZenTea_${reportTitles[reportType].replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Error generating PDF report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([listPlots(), listCrops()])
      .then(([p, c]) => {
        if (!mounted) return;
        setPlots(p.data || []);
        setCrops(c.data || []);
      })
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const totalPlots = plots.length;
    const activeCrops = crops.filter((c) => c.status === 'Active').length;
    const totalArea = plots.reduce((sum, p) => sum + (Number(p.areaHa) || 0), 0);
    return { totalPlots, activeCrops, totalArea };
  }, [plots, crops]);

  return (
    <DashboardShell
      title="Cultivation Management"
      subtitle="Overview"
      menu={[
        { label: 'Main Dashboard', to: '/admin' },
        { label: 'Dashboard', to: '/admin/panel' },
        { label: 'Plots Management', to: '/admin/panel/plots' },
        { label: 'Crops Management', to: '/admin/panel/crops' },
      ]}
    >
      {/* Background image: fills viewport, subtle/faded */}
      {/* Background layers - only these fade */}
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[url('/images/agriBackground.jpg')] bg-cover bg-center bg-no-repeat opacity-20" />
      <div className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">Total Plots</p>
              <p className="mt-2 text-3xl font-semibold text-slate-800">{kpis.totalPlots}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">Active Crops</p>
              <p className="mt-2 text-3xl font-semibold text-slate-800">{kpis.activeCrops}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">Total Area (ha)</p>
              <p className="mt-2 text-3xl font-semibold text-slate-800">{kpis.totalArea.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <WeatherWidget />
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">Planting Insights</h3>
              </div>
              <PlantingInsights crops={crops} plots={plots} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">Recent Plots</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="px-2 py-2">Name</th>
                      <th className="px-2 py-2">Estate</th>
                      <th className="px-2 py-2">Area (ha)</th>
                      <th className="px-2 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(plots.slice(0, 5)).map((p) => (
                      <tr key={p._id} className="border-t border-slate-100">
                        <td className="px-2 py-2">{p.name}</td>
                        <td className="px-2 py-2">{p.estateName || '—'}</td>
                        <td className="px-2 py-2">{p.areaHa}</td>
                        <td className="px-2 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800">Recent Crops</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="px-2 py-2">Cultivar</th>
                      <th className="px-2 py-2">Plot</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2">Planted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(crops.slice(0, 5)).map((c) => (
                      <tr key={c._id} className="border-t border-slate-100">
                        <td className="px-2 py-2">{c.cultivarName}</td>
                        <td className="px-2 py-2">{c.plot?.name || '—'}</td>
                        <td className="px-2 py-2">{c.status}</td>
                        <td className="px-2 py-2">{new Date(c.plantingDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cultivation Report Generation Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Cultivation Reports</h3>
              <p className="text-sm text-slate-600">Generate comprehensive PDF reports of your cultivation data</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Complete Report</h4>
                    <p className="text-xs text-slate-500">All plots and crops data</p>
                  </div>
                </div>
                <button 
                  onClick={() => generateCultivationReport(plots, crops, 'complete')}
                  disabled={generatingReport}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingReport ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Download PDF'}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Plots Summary</h4>
                    <p className="text-xs text-slate-500">Plot details and statistics</p>
                  </div>
                </div>
                <button 
                  onClick={() => generateCultivationReport(plots, crops, 'plots')}
                  disabled={generatingReport}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingReport ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Download PDF'}
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-4a2 2 0 01-2-2V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Crops Summary</h4>
                    <p className="text-xs text-slate-500">Crop details and analytics</p>
                  </div>
                </div>
                <button 
                  onClick={() => generateCultivationReport(plots, crops, 'crops')}
                  disabled={generatingReport}
                  className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingReport ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Download PDF'}
                </button>
              </div>
            </div>
          </div>
          
        </div>
      )}
    </DashboardShell>
  );
}

// Most planted days plot and soil type
function PlantingInsights({ crops, plots }) {
  const info = useMemo(() => {
    if (!Array.isArray(crops) || crops.length === 0) {
      return { topDays: [], topPlots: [], topSoils: [], topMonths: [], total: 0 };
    }
    const dayCounts = new Array(7).fill(0);
    const plotCounts = new Map();
    const soilCounts = new Map();
    const monthCounts = new Array(12).fill(0);

    const plotIdToSoil = new Map();
    if (Array.isArray(plots)) {
      for (const p of plots) {
        if (p?._id) plotIdToSoil.set(p._id, p.soilType || 'Other');
      }
    }
    for (const c of crops) {
      if (!c?.plantingDate) continue;
      const d = new Date(c.plantingDate);
      if (isNaN(d)) continue;
      const day = d.getDay(); // 0 Sun ... 6 Sat
      dayCounts[day] += 1;
      monthCounts[d.getMonth()] += 1; // 0 Jan ... 11 Dec
      const plotName = c.plot?.name || c.plot || 'Unknown Plot';
      plotCounts.set(plotName, (plotCounts.get(plotName) || 0) + 1);
      const soil = c.plot?._id ? (plotIdToSoil.get(c.plot._id) || 'Other') : (c.plot?.soilType || 'Other');
      soilCounts.set(soil, (soilCounts.get(soil) || 0) + 1);
    }
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const pairs = dayCounts.map((count, idx) => ({ name: names[idx], idx, count }));
    pairs.sort((a, b) => b.count - a.count);
    const topDays = pairs.filter(p => p.count > 0).slice(0, 3);
    const topPlots = Array.from(plotCounts.entries()).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 3);
    const topSoils = Array.from(soilCounts.entries()).map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 3);
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const topMonths = monthCounts
      .map((count, idx) => ({ name: monthNames[idx], idx, count }))
      .filter(m => m.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    return { topDays, topPlots, topSoils, topMonths, total: crops.length };
  }, [crops]);


  if (info.total === 0) {
    return <p className="text-sm text-slate-500">No planting data yet.</p>;
  }

  return (
    <div className="space-y-6">
      {info.topMonths.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Best planting months</p>
          <div className="flex flex-wrap gap-2">
            {info.topMonths.map((m) => (
              <span key={m.name} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                {m.name} · {m.count} plantings
              </span>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Top Plots</p>
        <ul className="space-y-2">
          {info.topPlots.length === 0 ? (
            <li className="text-sm text-slate-500">No plot data available.</li>
          ) : (
            info.topPlots.map((p) => (
              <li key={p.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-slate-700">{p.name}</span>
                <span className="text-xs text-slate-500">{p.count} plantings</span>
              </li>
            ))
          )}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Top Soil Types</p>
        <ul className="space-y-2">
          {info.topSoils.length === 0 ? (
            <li className="text-sm text-slate-500">No soil type data available.</li>
          ) : (
            info.topSoils.map((s) => (
              <li key={s.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-slate-700">{s.name}</span>
                <span className="text-xs text-slate-500">{s.count} plantings</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}