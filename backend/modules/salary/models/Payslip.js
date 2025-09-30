import mongoose from 'mongoose';

const payslipSchema = new mongoose.Schema({
  slipNo: { type: String, unique: true, required: true },
  employeeId: { type: String, required: true },
  month: { type: String, required: true }, // YYYY-MM
  breakdown: { type: Object, required: true }
}, { timestamps: true });

export default mongoose.model('Payslip', payslipSchema);
