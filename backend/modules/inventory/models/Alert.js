import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['LOW_STOCK','NEAR_EXPIRY','EXPIRED'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Alert = mongoose.model('Alert', AlertSchema);
export default Alert;
