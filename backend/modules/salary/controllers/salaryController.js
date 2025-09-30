import Salary from '../models/Salary.js';
import Payslip from '../models/Payslip.js';
import { computeSalary } from '../salaryCalculator.js';
import { generatePayslipPDF } from '../pdfGenerator.js';
import path from 'path';
import fs from 'fs';
import { sendSMS } from '../../../utils/smsService.js';

const nextSlipNo = () => `SLIP${Date.now()}`;

const formatMonthLabel = (month) => {
  if (!month) return 'this period';
  const parsed = new Date(`${month}-01T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return month;
  try {
    return parsed.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  } catch (err) {
    console.warn('[salary] failed to format payslip month', err.message);
    return month;
  }
};

const numericKeys = ['basic', 'allowances', 'weekdayOtHours', 'holidayOtHours', 'bonus', 'deductions', 'loan'];

// ---------------- ADMIN ----------------

export const createOrUpdateSalary = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    payload.employeeId = payload.employeeId?.trim();
    if (!payload.employeeId) {
      return res.status(400).json({ message: 'employeeId is required' });
    }

    numericKeys.forEach((key) => {
      payload[key] = Number(payload[key] || 0);
    });

    ['epfNo', 'etfNo'].forEach((key) => {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
      }
      if (payload[key] === '' || payload[key] === null) {
        delete payload[key];
      }
    });

    const result = computeSalary(payload);
    if (result.errors) return res.status(400).json({ message: result.errors[0] });

    const record = await Salary.findOneAndUpdate(
      { employeeId: payload.employeeId },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Salary saved', data: record });
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      return res.status(409).json({ message: `Duplicate value for ${field?.toUpperCase() || 'unique field'}.` });
    }
    next(err);
  }
};

// Admin generates payslip
export const generatePayslip = async (req, res, next) => {
  try {
    const { employeeId, month } = req.body;
    const emp = await Salary.findOne({ employeeId });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const exists = await Payslip.findOne({ employeeId, month });
    if (exists) return res.status(400).json({ message: 'Payslip already exists' });

    const breakdown = computeSalary(emp);
    const slipNo = nextSlipNo();
    await Payslip.create({ slipNo, employeeId, month, breakdown });

    const outDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    const filePath = path.join(outDir, `${slipNo}.pdf`);

    await generatePayslipPDF(filePath, {
      logoPath: path.join(process.cwd(), 'logo.png'),
      employee: { name: emp.name, employeeId },
      breakdown: { ...breakdown, month, slipNo },
    });

    if (emp.phone) {
      const monthLabel = formatMonthLabel(month);
      const smsBody = `Dear ${emp.name}, your salary for ${monthLabel} has been processed. Net pay LKR ${breakdown.net}. Payslip ${slipNo}.`;
      try {
        const ok = await sendSMS(emp.phone, smsBody);
        if (!ok) console.warn(`[sms] failed to send salary alert to ${emp.phone}`);
      } catch (smsErr) {
        console.warn('[salary] error while sending salary alert', smsErr.message);
      }
    }

    res.json({ message: 'Payslip generated', pdfPath: `/files/${slipNo}.pdf` });
  } catch (err) {
    next(err);
  }
};

// Admin lists payslips for employee
export const listPayslipsByEmployee = async (req, res, next) => {
  try {
    const slips = await Payslip.find({ employeeId: req.params.employeeId }).sort({ createdAt: -1 });
    res.json(slips);
  } catch (err) {
    next(err);
  }
};

// ---------------- EMPLOYEE ----------------

export const getSalaryByEmployee = async (req, res, next) => {
  try {
    const salary = await Salary.findOne({ employeeId: req.user.uniqueId });
    if (!salary) return res.status(404).json({ message: 'No salary found' });
    const breakdown = computeSalary(salary);
    res.json({ ...salary.toObject(), breakdown });
  } catch (err) {
    next(err);
  }
};

export const listMyPayslips = async (req, res, next) => {
  try {
    const slips = await Payslip.find({ employeeId: req.user.uniqueId }).sort({ createdAt: -1 });
    res.json(slips);
  } catch (err) {
    next(err);
  }
};

// ---------------- SHARED ----------------

export const downloadPayslip = async (req, res, next) => {
  try {
    const slipNo = req.params.id;
    const slip = await Payslip.findOne({ slipNo });
    if (!slip) return res.status(404).json({ message: 'Payslip not found' });

    if (req.user.role === 'Employee' && slip.employeeId !== req.user.uniqueId) {
      return res.status(403).json({ message: 'Not authorized to download this payslip' });
    }

    const filePath = path.join(process.cwd(), 'tmp', `${slipNo}.pdf`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Payslip PDF not found on server' });
    }

    res.download(filePath);
  } catch (err) {
    next(err);
  }
};
