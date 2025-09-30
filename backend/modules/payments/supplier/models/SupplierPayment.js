import mongoose from 'mongoose';

const supplierPaymentSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true, required: true },
    supplierId: { type: String, required: true },
    collectorId: { type: String, required: true },
    weightKg: { type: Number, required: true },
    rate: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['QR Generated', 'Pending', 'Paid'],
      default: 'Pending',
    },
    qrToken: { type: String }, // stored JWT
    qrExp: { type: Date },     // expiry of QR
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('SupplierPayment', supplierPaymentSchema);
