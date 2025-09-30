import mongoose from 'mongoose';

export function generateTransactionId() {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TX-${stamp}-${rand}`;
}

const TransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    default: generateTransactionId
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['IN','OUT'], required: true },
  quantity: { type: Number, required: true, min: [1,'Quantity must be at least 1'], validate: { validator: Number.isInteger, message: 'Quantity must be an integer' } },
  reason: { type: String, enum: ['purchase','sale','wastage','adjustment'], required: true },
  note: { type: String, default: '' },
  batchNumber: { type: String, default: '' },
  createdBy: { type: String, default: 'system' }
}, { timestamps: true });

TransactionSchema.index({ transactionId: 1 }, { unique: true });

const Transaction = mongoose.model('Transaction', TransactionSchema);
export default Transaction;
