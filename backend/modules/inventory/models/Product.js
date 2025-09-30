import mongoose from 'mongoose';

const CATEGORY_ENUM = ['Black Tea','Green Tea','White Tea','Herbal','Flavoured'];

function hasMaxTwoDecimals(num) {
  return Number.isFinite(num) && Math.round(num * 100) === num * 100;
}

const ProductSchema = new mongoose.Schema({
  name: {
    type: String, required: [true,'Product name is required'],
    minlength: [3,'Name must be at least 3 characters'],
    maxlength: [100,'Name must be at most 100 characters'],
    validate: { validator: v => /^[A-Za-z ]+$/.test(v), message: 'Name can contain only letters and spaces' },
    trim: true
  },
  category: { type: String, required: [true,'Category is required'], enum: { values: CATEGORY_ENUM, message: 'Invalid category' } },
  description: { type: String, default: '' },

  // ✅ NEW WEIGHT FIELD
  weight: { 
    type: String, 
    required: [true, 'Weight is required'], 
    enum: { 
      values: ['100g','250g','500g','1kg'], 
      message: 'Invalid weight option' 
    } 
  },

  price: { type: Number, required: [true,'Price is required'], min: [0.01,'Price must be greater than 0'], max: [100000,'Price must be ≤ 100000'], validate: { validator: hasMaxTwoDecimals, message: 'Price can have at most 2 decimals' } },
  stock: { type: Number, required: true, min: [0,'Stock cannot be negative'], validate: { validator: Number.isInteger, message: 'Stock must be an integer' } },
  batchNo: { type: String, required: [true,'Batch No is required'], trim: true, unique: true },
  expiryDate: { type: Date, required: [true,'Expiry date is required'], validate: { validator: v => v && v.getTime() > Date.now(), message: 'Expiry date must be in the future' } },
  minStock: { type: Number, required: [true,'Minimum stock is required'], min: [0,'Minimum stock cannot be negative'], validate: { validator: Number.isInteger, message: 'Minimum stock must be an integer' } },
  image: { type: String, default: '' }
}, { timestamps: true });

ProductSchema.virtual('status').get(function(){
  const nearExpiryDays = 14;
  const now = new Date();
  if (this.expiryDate <= now) return 'EXPIRED';
  const diffDays = Math.ceil((this.expiryDate - now)/(1000*60*60*24));
  const nearExpiry = diffDays <= nearExpiryDays;
  const lowStock = this.stock < this.minStock;
  if (lowStock && nearExpiry) return 'LOW_STOCK_NEAR_EXPIRY';
  if (lowStock) return 'LOW_STOCK';
  if (nearExpiry) return 'NEAR_EXPIRY';
  return 'OK';
});

const Product = mongoose.model('Product', ProductSchema);
export default Product;
export { CATEGORY_ENUM };
