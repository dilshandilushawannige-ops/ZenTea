import mongoose from 'mongoose';

const SalesSchema = new mongoose.Schema({
  // User info
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: false, default: '' },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  
  // Order details
  items: [{
    productId: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String }
  }],
  
  // Legacy fields (for backward compatibility)
  quantity: { type: Number },
  description: { type: String },
  
  // Order totals
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Order status
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  
  // Shipping info
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    apartment: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  }
}, { timestamps: true });

const Sales = mongoose.model('Sales', SalesSchema);

export default Sales;
