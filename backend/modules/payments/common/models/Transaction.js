import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true, required: true },
  type: { type: String, enum: ['Supplier', 'Employee'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  meta: { type: Object }, // arbitrary details
}, { timestamps: true });

export default mongoose.model('PaymentTransaction', transactionSchema);
