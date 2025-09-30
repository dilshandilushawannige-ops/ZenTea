export const computeSalary = (data) => {
  const errors = [];
  const minWage = 20000; // example threshold

  const basic = Number(data.basic) || 0;
  const allowances = Number(data.allowances) || 0;
  const weekdayOtHours = Number(data.weekdayOtHours) || 0;
  const holidayOtHours = Number(data.holidayOtHours) || 0;
  const bonus = Number(data.bonus) || 0;
  const deductions = Number(data.deductions) || 0;
  const loan = Number(data.loan) || 0;

  if (basic < minWage) errors.push('❌ Basic salary must be above minimum wage');
  if (allowances < 0) errors.push('❌ Allowances cannot be negative');
  if (weekdayOtHours > 20) errors.push('❌ OT hours exceed maximum per week');
  if (holidayOtHours > 12) errors.push('❌ Holiday OT hours exceed max per day');
  if (bonus > basic * 0.5) errors.push('❌ Bonus cannot exceed 50% of basic salary');

  const weekdayOt = (basic / (28 * 8)) * weekdayOtHours;
  const holidayOt = (basic / (28 * 8)) * 1.5 * holidayOtHours;
  const gross = basic + allowances + bonus + weekdayOt + holidayOt;
  const epf = basic * 0.2;
  const etf = basic * 0.03;
  const net = gross - (epf + etf + deductions + loan);

  if (net <= 0) errors.push('❌ Net salary must be greater than 0');
  if (loan > net) errors.push('❌ Loan deduction cannot exceed net salary');

  return {
    errors: errors.length ? errors : null,
    basic, allowances, weekdayOtHours, holidayOtHours,
    bonus, deductions, loan,
    weekdayOT: weekdayOt.toFixed(2),
    holidayOT: holidayOt.toFixed(2),
    gross: gross.toFixed(2),
    epf: epf.toFixed(2),
    etf: etf.toFixed(2),
    net: net.toFixed(2)
  };
};
