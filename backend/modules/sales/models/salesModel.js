import mongoose from 'mongoose';

const SalesSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  quantity: { type: Number, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  }
}, { timestamps: true });

const Sales = mongoose.model('Sales', SalesSchema);

export default Sales;
