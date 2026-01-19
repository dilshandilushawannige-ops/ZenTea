import React, { useMemo, useState } from 'react';
import DashboardShell from '../../components/common/DashboardShell';
import { saveSalary, generatePayslip, listPayslipsByEmployee } from '../../api/salaryApi';
import ToastNotification from '../../components/common/ToastNotification.jsx';
import MonthlyBarChart from '../../components/charts/MonthlyBarChart.jsx';

const numericFields = [
  'basic',
  'allowances',
  'weekdayOtHours',
  'holidayOtHours',
  'bonus',
  'deductions',
  'loan',
];

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const createInitialForm = () => ({
  employeeId: '',
  basic: '',
  allowances: '',
  weekdayOtHours: '',
  holidayOtHours: '',
  bonus: '',
  deductions: '',
  loan: '',
  month: new Date().toISOString().substring(0, 7),
});

const formatMonthLabel = (isoMonth) => {
  if (!isoMonth) return '';
  const [year, month] = isoMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return `${date.toLocaleString('default', { month: 'short' })} ${year}`;
};

export default function SalaryManagement() {
  const menu = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/salary', label: 'Salary Management' },
  ];

  const [form, setForm] = useState(createInitialForm());
  const [slips, setSlips] = useState([]);
  const slipList = Array.isArray(slips) ? slips : Array.isArray(slips?.slips) ? slips.slips : Array.isArray(slips?.data) ? slips.data : [];
  const [filters, setFilters] = useState({ month: 'all', year: 'all' });
  const [searchId, setSearchId] = useState('');
  const [previewSlip, setPreviewSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmployeeId = (id) => {
    const pattern = /^EM\d{3}$/;
    if (!id) return 'Employee ID is required';
    if (id.length !== 5) return 'Employee ID must be exactly 5 characters (EM###)';
    if (!pattern.test(id)) return 'Employee ID must follow EM### pattern (e.g., EM001, EM002)';
    return null;
  };

  const validateNumericField = (value, fieldName, min = 0, max = null) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min) return `${fieldName} cannot be negative`;
    if (max !== null && num > max) return `${fieldName} cannot exceed ${max}`;
    return null;
  };

  const validateMonth = (month) => {
    if (!month) return 'Month is required';
    const selectedDate = new Date(month + '-01');
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    if (selectedDate < currentMonth) {
      return 'Month cannot be in the past. Please select current or future month.';
    }
    return null;
  };

  const validateOTHours = (hours, fieldName) => {
    const error = validateNumericField(hours, fieldName, 0, 300);
    if (error) return error;
    const num = Number(hours || 0);
    if (num > 300) return `${fieldName} cannot exceed 300 hours per month`;
    return null;
  };

  const validateTotalEarnings = (formData = form) => {
    const basic = Number(formData.basic || 0);
    const allowances = Number(formData.allowances || 0);
    const bonus = Number(formData.bonus || 0);
    const deductions = Number(formData.deductions || 0);
    const loan = Number(formData.loan || 0);
    const weekdayOtRate = 100; // Assumed rate per hour
    const holidayOtRate = 150; // Assumed rate per hour
    const weekdayOtAmount = Number(formData.weekdayOtHours || 0) * weekdayOtRate;
    const holidayOtAmount = Number(formData.holidayOtHours || 0) * holidayOtRate;
    
    const totalEarnings = basic + allowances + bonus + weekdayOtAmount + holidayOtAmount;
    const totalDeductions = deductions + loan;
    const netEarnings = totalEarnings - totalDeductions;
    
    if (netEarnings < 0) {
      return 'Total deductions and loan amount exceed total earnings. Net salary cannot be negative.';
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Employee ID validation
    const employeeIdError = validateEmployeeId(form.employeeId);
    if (employeeIdError) newErrors.employeeId = employeeIdError;
    
    // Numeric fields validation
    const basicError = validateNumericField(form.basic, 'Basic salary');
    if (basicError) newErrors.basic = basicError;
    
    const allowancesError = validateNumericField(form.allowances, 'Allowances');
    if (allowancesError) newErrors.allowances = allowancesError;
    
    const bonusError = validateNumericField(form.bonus, 'Bonus');
    if (bonusError) newErrors.bonus = bonusError;
    
    const deductionsError = validateNumericField(form.deductions, 'Deductions');
    if (deductionsError) newErrors.deductions = deductionsError;
    
    const loanError = validateNumericField(form.loan, 'Loan');
    if (loanError) newErrors.loan = loanError;
    
    // OT Hours validation
    const weekdayOtError = validateOTHours(form.weekdayOtHours, 'Weekday OT hours');
    if (weekdayOtError) newErrors.weekdayOtHours = weekdayOtError;
    
    const holidayOtError = validateOTHours(form.holidayOtHours, 'Holiday OT hours');
    if (holidayOtError) newErrors.holidayOtHours = holidayOtError;
    
    // Month validation
    const monthError = validateMonth(form.month);
    if (monthError) newErrors.month = monthError;
    
    // Total earnings validation
    const totalEarningsError = validateTotalEarnings();
    if (totalEarningsError) newErrors.totalEarnings = totalEarningsError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showToast = (type, title, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  const change = (e) => {
    const { name, value } = e.target;
    
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (numericFields.includes(name)) {
      const sanitised = value === '' ? '' : String(Number(value.replace(/[^0-9]/g, '') || 0));
      setForm((prev) => {
        const newForm = { ...prev, [name]: sanitised };
        
        // Real-time validation for numeric fields
        setTimeout(() => {
          let error = null;
          if (name === 'weekdayOtHours' || name === 'holidayOtHours') {
            error = validateOTHours(sanitised, name === 'weekdayOtHours' ? 'Weekday OT hours' : 'Holiday OT hours');
          } else {
            error = validateNumericField(sanitised, name.charAt(0).toUpperCase() + name.slice(1));
          }
          
          if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
          }
          
          // Check total earnings consistency when relevant fields change
          if (['basic', 'allowances', 'bonus', 'deductions', 'loan', 'weekdayOtHours', 'holidayOtHours'].includes(name)) {
            const totalError = validateTotalEarnings(newForm);
            setErrors(prev => {
              const newErrors = { ...prev };
              if (totalError) {
                newErrors.totalEarnings = totalError;
              } else {
                delete newErrors.totalEarnings;
              }
              return newErrors;
            });
          }
        }, 300);
        
        return newForm;
      });
    } else if (name === 'employeeId') {
      // Special handling for Employee ID - restrict input format
      let sanitizedValue = value.toUpperCase();
      
      // Remove any characters that are not E, M, or digits
      sanitizedValue = sanitizedValue.replace(/[^EM0-9]/g, '');
      
      // Ensure it starts with "EM" if user types anything
      if (sanitizedValue.length > 0 && !sanitizedValue.startsWith('EM')) {
        if (sanitizedValue.startsWith('E')) {
          sanitizedValue = 'EM' + sanitizedValue.substring(1);
        } else if (sanitizedValue.match(/^\d/)) {
          sanitizedValue = 'EM' + sanitizedValue;
        } else {
          sanitizedValue = 'EM';
        }
      }
      
      // Limit to exactly 5 characters (EM + 3 digits)
      if (sanitizedValue.length > 5) {
        sanitizedValue = sanitizedValue.substring(0, 5);
      }
      
      // Ensure the format is correct: if it's longer than 2 chars, the rest must be digits
      if (sanitizedValue.length > 2) {
        const prefix = sanitizedValue.substring(0, 2);
        const suffix = sanitizedValue.substring(2).replace(/[^0-9]/g, '');
        sanitizedValue = prefix + suffix;
      }
      
      setForm((prev) => {
        const newForm = { ...prev, [name]: sanitizedValue };
        
        // Real-time validation for employee ID
        setTimeout(() => {
          const error = validateEmployeeId(sanitizedValue);
          if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
          }
        }, 300);
        
        return newForm;
      });
    } else {
      setForm((prev) => {
        const newForm = { ...prev, [name]: value };
        
        // Real-time validation for other fields
        setTimeout(() => {
          let error = null;
          if (name === 'month') {
            error = validateMonth(value);
          }
          
          if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
          }
        }, 300);
        
        return newForm;
      });
    }
  };

  const buildPayload = () => ({
    ...form,
    ...numericFields.reduce((acc, key) => {
      acc[key] = Number(form[key] || 0);
      return acc;
    }, {}),
  });

  const handleSearch = async () => {
    const id = searchId.trim();
    if (!id) {
      return showToast('info', 'Employee ID required', 'Enter an ID such as EM001 to load payslips.');
    }
    
    // Validate Employee ID format before searching
    const validationError = validateEmployeeId(id);
    if (validationError) {
      return showToast('error', 'Invalid Employee ID', validationError);
    }
    
    try {
      setLoading(true);
      const { data } = await listPayslipsByEmployee(id);
      const list = Array.isArray(data) ? data : Array.isArray(data?.slips) ? data.slips : [];
      setSlips(list);
      setForm((prev) => ({ ...prev, employeeId: id }));
      setFilters({ month: 'all', year: 'all' });
      showToast('success', 'Payslips loaded', `Showing records for ${id}.`);
    } catch (err) {
      showToast('error', 'Unable to load payslips', err.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchIdChange = (e) => {
    const { value } = e.target;
    
    // Apply the same Employee ID formatting logic as the form
    let sanitizedValue = value.toUpperCase();
    
    // Remove any characters that are not E, M, or digits
    sanitizedValue = sanitizedValue.replace(/[^EM0-9]/g, '');
    
    // Ensure it starts with "EM" if user types anything
    if (sanitizedValue.length > 0 && !sanitizedValue.startsWith('EM')) {
      if (sanitizedValue.startsWith('E')) {
        sanitizedValue = 'EM' + sanitizedValue.substring(1);
      } else if (sanitizedValue.match(/^\d/)) {
        sanitizedValue = 'EM' + sanitizedValue;
      } else {
        sanitizedValue = 'EM';
      }
    }
    
    // Limit to exactly 5 characters (EM + 3 digits)
    if (sanitizedValue.length > 5) {
      sanitizedValue = sanitizedValue.substring(0, 5);
    }
    
    // Ensure the format is correct: if it's longer than 2 chars, the rest must be digits
    if (sanitizedValue.length > 2) {
      const prefix = sanitizedValue.substring(0, 2);
      const suffix = sanitizedValue.substring(2).replace(/[^0-9]/g, '');
      sanitizedValue = prefix + suffix;
    }
    
    setSearchId(sanitizedValue);
  };

  const save = async () => {
    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please fix the validation errors before saving.');
      return;
    }
    
    try {
      // Save the salary data
      const payload = buildPayload();
      const { data } = await saveSalary(payload);
      showToast('success', 'Salary saved', data.message || 'Details recorded successfully.');
      
      // Automatically generate payslip after saving
      try {
        showToast('info', 'Generating payslip...', 'Creating payslip for this salary data.');
        
        const payslipPayload = { employeeId: form.employeeId, month: form.month };
        const payslipResult = await generatePayslip(payslipPayload);
        
        const absolute = payslipResult.data?.pdfPath
          ? payslipResult.data.pdfPath.startsWith('http')
            ? payslipResult.data.pdfPath
            : `${apiBase}${payslipResult.data.pdfPath}`
          : null;
        
        showToast('success', 'Payslip generated', 'Salary saved and payslip created successfully.');
        
        // Open the generated payslip in a new tab
        if (absolute) {
          window.open(absolute, '_blank', 'noopener');
        }
        
        // Refresh the payslips list to show the new payslip
        if (form.employeeId) {
          const slipsRes = await listPayslipsByEmployee(form.employeeId);
          const refreshed = Array.isArray(slipsRes.data) ? slipsRes.data : Array.isArray(slipsRes.data?.slips) ? slipsRes.data.slips : [];
          setSlips(refreshed);
        }
        
      } catch (payslipErr) {
        console.error('Payslip generation error:', payslipErr);
        const payslipErrorMessage = payslipErr.response?.data?.message || 'Could not generate payslip.';
        
        if (payslipErrorMessage.includes('already exists')) {
          showToast('warning', 'Payslip exists', 'Salary saved successfully, but payslip for this month already exists.');
        } else {
          showToast('warning', 'Payslip generation failed', `Salary saved, but payslip generation failed: ${payslipErrorMessage}`);
        }
      }
      
      // Clear form after successful save
      setForm(createInitialForm());
      setErrors({});
      
    } catch (err) {
      showToast('error', 'Save failed', err.response?.data?.message || 'Could not save salary details.');
    }
  };

  const gen = async () => {
    // Validate form before generating payslip
    if (!form.employeeId) {
      return showToast('error', 'Employee ID required', 'Please enter a valid Employee ID before generating payslip.');
    }
    
    if (!form.month) {
      return showToast('error', 'Month required', 'Please select a month before generating payslip.');
    }
    
    // Check if form has validation errors
    if (!validateForm()) {
      return showToast('error', 'Form validation failed', 'Please fix all validation errors before generating payslip.');
    }
    
    // Check if salary data exists for this employee (basic salary at minimum)
    if (!form.basic || Number(form.basic) <= 0) {
      return showToast('error', 'Salary data required', 'Please enter basic salary information before generating payslip.');
    }
    
    try {
      // First, save the salary data
      showToast('info', 'Processing...', 'Saving salary data and generating payslip...');
      
      const payload = buildPayload();
      await saveSalary(payload);
      
      // Then generate the payslip
      const payslipPayload = { employeeId: form.employeeId, month: form.month };
      const { data } = await generatePayslip(payslipPayload);
      
      const absolute = data?.pdfPath
        ? data.pdfPath.startsWith('http')
          ? data.pdfPath
          : `${apiBase}${data.pdfPath}`
        : null;
      
      showToast('success', 'Payslip generated successfully', 'Payslip has been created and saved.');
      
      if (absolute) {
        // Open PDF in new tab
        window.open(absolute, '_blank', 'noopener');
      }
      
      // Refresh the payslips list
      const slipsRes = await listPayslipsByEmployee(form.employeeId);
      const refreshed = Array.isArray(slipsRes.data) ? slipsRes.data : Array.isArray(slipsRes.data?.slips) ? slipsRes.data.slips : [];
      setSlips(refreshed);
      
    } catch (err) {
      console.error('Payslip generation error:', err);
      const errorMessage = err.response?.data?.message || 'Could not create payslip.';
      
      if (errorMessage.includes('Employee not found')) {
        showToast('error', 'Employee not found', 'Please save salary data first, then generate payslip.');
      } else if (errorMessage.includes('already exists')) {
        showToast('error', 'Payslip already exists', 'A payslip for this employee and month already exists.');
      } else {
        showToast('error', 'Generation failed', errorMessage);
      }
    }
  };

  const handleSummaryClick = (month) => {
    setFilters(prev => ({
      ...prev,
      month: prev.month === month ? 'all' : month
    }));
  };

  const monthlyAggregates = useMemo(() => {
    const map = new Map();
    slipList.forEach((slip) => {
      if (!slip.month) return;
      if (!map.has(slip.month)) {
        map.set(slip.month, { month: slip.month, net: 0, gross: 0, count: 0 });
      }
      const entry = map.get(slip.month);
      entry.net += Number(slip.breakdown?.net || 0);
      entry.gross += Number(slip.breakdown?.gross || 0);
      entry.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [slipList]);

  const monthYearOptions = useMemo(() => {
    const months = new Set();
    const years = new Set();
    monthlyAggregates.forEach((entry) => {
      months.add(entry.month);
      years.add(entry.month.slice(0, 4));
    });
    return {
      months: Array.from(months).sort().reverse(),
      years: Array.from(years).sort().reverse(),
    };
  }, [monthlyAggregates]);

  const summaryYear = filters.year !== 'all'
    ? filters.year
    : (monthYearOptions.years[0] || new Date().getFullYear().toString());

  const summaryMonths = useMemo(
    () => monthlyAggregates.filter((entry) => entry.month.startsWith(summaryYear)),
    [monthlyAggregates, summaryYear]
  );

  const maxSummaryNet = summaryMonths.length
    ? Math.max(...summaryMonths.map((entry) => entry.net))
    : 0;

  const ytdNet = summaryMonths.reduce((sum, entry) => sum + entry.net, 0);
  const previousYear = (Number(summaryYear) - 1).toString();
  const prevYearNet = monthlyAggregates
    .filter((entry) => entry.month.startsWith(previousYear))
    .reduce((sum, entry) => sum + entry.net, 0);
  const deltaPercent = prevYearNet > 0 ? ((ytdNet - prevYearNet) / prevYearNet) * 100 : null;

  const barChartData = summaryMonths.map((entry) => ({
    label: formatMonthLabel(entry.month),
    net: entry.net,
  }));

  const sparklinePoints = (() => {
    if (!summaryMonths.length) return '';
    const sorted = [...summaryMonths].sort((a, b) => a.month.localeCompare(b.month));
    const maxValue = Math.max(...sorted.map((entry) => entry.net)) || 1;
    const width = 120;
    const height = 40;
    const usableHeight = height - 6;
    return sorted
      .map((entry, index) => {
        const x = sorted.length === 1 ? width / 2 : (width / (sorted.length - 1)) * index;
        const y = height - 3 - (entry.net / maxValue) * usableHeight;
        return `${x},${y}`;
      })
      .join(' ');
  })();

  const filteredSlips = useMemo(() => (
    slipList.filter((slip) => {
      const matchesMonth = filters.month === 'all' || slip.month === filters.month;
      const matchesYear = filters.year === 'all' || (slip.month || '').startsWith(filters.year);
      return matchesMonth && matchesYear;
    })
  ), [slipList, filters]);

  const totalNet = filteredSlips.reduce((sum, slip) => sum + Number(slip.breakdown?.net || 0), 0);
  const totalGross = filteredSlips.reduce((sum, slip) => sum + Number(slip.breakdown?.gross || 0), 0);
  const avgNet = filteredSlips.length ? totalNet / filteredSlips.length : 0;

  const pdfUrl = (slipNo) => `${apiBase}/files/${slipNo}.pdf`;
  
  const handleDownload = async (slipNo, month) => {
    try {
      const url = pdfUrl(slipNo);
      
      // Try to fetch the file first to check if it exists
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        showToast('error', 'Download failed', 'Payslip file not found on server. Please regenerate the payslip.');
        return;
      }
      
      // Create a temporary link element for download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${slipNo}_${formatMonthLabel(month).replace(' ', '_')}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('success', 'Download started', `Payslip ${slipNo} download initiated.`);
    } catch (error) {
      console.error('Download error:', error);
      showToast('error', 'Download failed', 'Unable to download payslip. Please check your internet connection and try again.');
    }
  };
  const exportPdf = () => {
    if (!filteredSlips.length) {
      showToast('info', 'Nothing to export', 'Adjust filters to include at least one payslip.');
      return;
    }

    const targetYear = filters.year === 'all' ? summaryYear : filters.year;
    const periodLabel = filters.month === 'all'
      ? `All months ${targetYear}`
      : formatMonthLabel(filters.month);

    const monthlyBreakdown = filteredSlips.reduce((acc, slip) => {
      const key = slip.month;
      if (!acc[key]) {
        acc[key] = { net: 0, gross: 0, count: 0 };
      }
      acc[key].net += Number(slip.breakdown?.net || 0);
      acc[key].gross += Number(slip.breakdown?.gross || 0);
      acc[key].count += 1;
      return acc;
    }, {});

    const breakdownRows = Object.entries(monthlyBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => `
        <tr>
          <td>${formatMonthLabel(month)}</td>
          <td>LKR ${data.net.toFixed(2)}</td>
          <td>LKR ${data.gross.toFixed(2)}</td>
          <td>${data.count}</td>
        </tr>
      `)
      .join('');

    const html = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Payslip Summary</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 24px; color: #1f2933; }
            h1 { margin-bottom: 4px; font-size: 24px; }
            h2 { margin-top: 24px; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #d2d6dc; padding: 8px 10px; font-size: 13px; }
            th { background: #f4f5f7; text-align: left; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
            .summary-card { padding: 12px 14px; border-radius: 10px; background: #f8fafc; border: 1px solid #d2d6dc; }
            .summary-card span { display: block; font-size: 12px; color: #64748b; text-transform: uppercase; }
            .summary-card strong { display: block; margin-top: 4px; font-size: 16px; color: #0f172a; }
          </style>
        </head>
        <body>
          <h1>Payslip Summary</h1>
          <p><strong>Period:</strong> ${periodLabel}</p>
          <div class="summary-grid">
            <div class="summary-card">
              <span>Total Net</span>
              <strong>LKR ${totalNet.toFixed(2)}</strong>
            </div>
            <div class="summary-card">
              <span>Total Gross</span>
              <strong>LKR ${totalGross.toFixed(2)}</strong>
            </div>
            <div class="summary-card">
              <span>Average Net</span>
              <strong>LKR ${avgNet.toFixed(2)}</strong>
            </div>
          </div>
          <h2>Monthly Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Net</th>
                <th>Total Gross</th>
                <th>Payslips</th>
              </tr>
            </thead>
            <tbody>
              ${breakdownRows}
            </tbody>
          </table>
        </body>
      </html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      showToast('warning', 'Popup blocked', 'Allow popups to print or save the summary.');
      URL.revokeObjectURL(url);
      return;
    }
    win.onload = () => {
      win.focus();
      win.print();
      URL.revokeObjectURL(url);
    };
  };
  const topMonths = [...summaryMonths].sort((a, b) => b.net - a.net).slice(0, 3);

  const statCards = [
    { label: 'Net Payout', value: `LKR ${totalNet.toFixed(2)}`, detail: `${filteredSlips.length} payslips`, accent: 'from-emerald-400 to-emerald-600', icon: '??' },
    { label: 'Gross Payout', value: `LKR ${totalGross.toFixed(2)}`, detail: 'Before deductions', accent: 'from-sky-400 to-sky-600', icon: '??' },
    { label: 'Average Net', value: `LKR ${avgNet.toFixed(2)}`, detail: 'Per payslip', accent: 'from-purple-400 to-purple-600', icon: '??' },
    { label: 'Payslips Issued', value: filteredSlips.length.toString(), detail: filters.month === 'all' ? 'All months' : formatMonthLabel(filters.month), accent: 'from-amber-400 to-amber-500', icon: '???' },
  ];

  return (
    <DashboardShell
      menu={menu}
      title="Payroll Overview"
      subtitle="Track salary disbursements and manage employee payslips"
    >
      <div className="space-y-8">
        <div className="pointer-events-none fixed top-6 right-6 z-50 flex flex-col gap-3">
          {toasts.map((toast) => (
            <ToastNotification
              key={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => dismissToast(toast.id)}
            />
          ))}
        </div>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r opacity-90 ${card.accent}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.detail}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Payout Overview</p>
                <p className="text-lg font-semibold text-slate-900">Monthly net totals</p>
              </div>
              <select
                value={summaryYear}
                onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value, month: 'all' }))}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {[summaryYear, ...monthYearOptions.years.filter((y) => y !== summaryYear)].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {barChartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">No salary activity recorded for {summaryYear} yet.</p>
            ) : (
              <MonthlyBarChart data={barChartData} activeMonth={filters.month !== 'all' ? formatMonthLabel(filters.month) : null} />
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-700">Top Payout Months</p>
            <ul className="mt-4 space-y-4">
              {topMonths.length === 0 ? (
                <li className="text-sm text-slate-500">No data for selected year.</li>
              ) : (
                topMonths.map((entry) => (
                  <li key={entry.month} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{formatMonthLabel(entry.month)}</p>
                      <p className="text-xs text-slate-500">{entry.count} payslips</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">LKR {entry.net.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Gross {entry.gross.toFixed(2)}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase text-slate-500">Search Employee</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={searchId}
                  onChange={handleSearchIdChange}
                  placeholder="Employee ID e.g. EM001"
                  maxLength={5}
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
                  disabled={loading}
                >
                  {loading ? 'Searching�' : 'Search'}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <div>
                <label className="block text-xs text-slate-500">Filter Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters((prev) => ({ ...prev, year: e.target.value }))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                >
                  <option value="all">All</option>
                  {monthYearOptions.years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500">Filter Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
                >
                  <option value="all">All</option>
                  {monthYearOptions.months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={exportPdf}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Salary Form (Admin)</h2>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
                {/* Display total earnings error if exists */}
                {errors.totalEarnings && (
                  <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Calculation Error</h3>
                        <p className="mt-1 text-sm text-red-700">{errors.totalEarnings}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid gap-4 md:grid-cols-2">
                  {['employeeId', ...numericFields].map((k) => (
                    <div key={k}>
                      <label className="text-xs font-semibold uppercase text-slate-500">{k}</label>
                      <input
                        name={k}
                        value={form[k] ?? ''}
                        placeholder={numericFields.includes(k) ? '0' : (k === 'employeeId' ? 'EM001' : '')}
                        inputMode={numericFields.includes(k) ? 'numeric' : 'text'}
                        onChange={change}
                        className={`mt-1 w-full rounded-2xl border px-4 py-2 text-sm focus:outline-none ${
                          errors[k] 
                            ? 'border-red-300 bg-red-50 focus:border-red-500' 
                            : 'border-slate-200 bg-white focus:border-emerald-500'
                        }`}
                      />
                      {errors[k] && (
                        <p className="mt-1 text-xs text-red-600">{errors[k]}</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-500">Month</label>
                    <input
                      type="month"
                      name="month"
                      value={form.month}
                      min={new Date().toISOString().substring(0, 7)} // Prevent past months
                      onChange={change}
                      className={`mt-1 w-full rounded-2xl border px-4 py-2 text-sm focus:outline-none ${
                        errors.month 
                          ? 'border-red-300 bg-red-50 focus:border-red-500' 
                          : 'border-slate-200 bg-white focus:border-emerald-500'
                      }`}
                    />
                    {errors.month && (
                      <p className="mt-1 text-xs text-red-600">{errors.month}</p>
                    )}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={save} className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-500">
                    Save Salary
                  </button>
                  <button type="button" onClick={gen} className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-600">
                    Generate Payslip
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Payslips</h2>
              <div className="max-h-80 overflow-y-auto">
                {filteredSlips.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">No payslips to display.</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {filteredSlips.map((s) => {
                      const absolutePath = pdfUrl(s.slipNo);
                      return (
                        <li key={s._id || s.slipNo} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">{formatMonthLabel(s.month)}</p>
                              <p className="text-xs text-slate-500">Slip #{s.slipNo}</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewSlip(absolutePath)}
                                className="rounded-full border border-emerald-500 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(s.slipNo, s.month)}
                                className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-slate-600">Net: LKR {Number(s.breakdown?.net || 0).toFixed(2)}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Monthly Summary ({summaryYear})</h2>
            <p className="text-xs text-slate-500">Click a month to filter payslips.</p>
          </div>
          {summaryMonths.length === 0 ? (
            <p className="text-sm text-slate-500">No payslip activity available yet for {summaryYear}.</p>
          ) : (
            <div className="space-y-3">
              {summaryMonths.map((entry) => {
                const netRatio = maxSummaryNet ? (entry.net / maxSummaryNet) * 100 : 0;
                const isActive = filters.month === entry.month;
                return (
                  <button
                    type="button"
                    key={entry.month}
                    onClick={() => handleSummaryClick(entry.month)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                      isActive ? 'border-emerald-500 bg-emerald-50/70 shadow-inner' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-slate-800">{formatMonthLabel(entry.month)}</span>
                      <span className="text-xs text-slate-500">{entry.count} slips</span>
                    </div>
                    <div className="mt-3 h-2.5 w-full rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.min(100, Math.max(netRatio, 6))}%` }}
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-3 text-xs text-slate-600">
                      <span>Net: LKR {entry.net.toFixed(2)}</span>
                      <span>Gross: LKR {entry.gross.toFixed(2)}</span>
                      <span className="text-right">Avg: LKR {(entry.net / entry.count).toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {previewSlip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 h-[80vh] rounded-3xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
              <h3 className="text-sm font-semibold text-slate-700">Payslip Preview</h3>
              <button type="button" onClick={() => setPreviewSlip(null)} className="text-xs font-medium text-emerald-600 hover:text-emerald-500">Close</button>
            </div>
            <iframe src={previewSlip} title="Payslip Preview" className="flex-1" />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}


