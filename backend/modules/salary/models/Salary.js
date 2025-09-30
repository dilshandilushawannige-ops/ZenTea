import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  epfNo: { type: String, trim: true, sparse: true, default: undefined },
  etfNo: { type: String, trim: true, sparse: true, default: undefined },
  basic: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  weekdayOtHours: { type: Number, default: 0 },
  holidayOtHours: { type: Number, default: 0 },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
}, { timestamps: true });

salarySchema.index({ epfNo: 1 }, { unique: true, sparse: true });
salarySchema.index({ etfNo: 1 }, { unique: true, sparse: true });

export default mongoose.model('Salary', salarySchema);
