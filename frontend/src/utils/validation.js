export const noTripleRepeat = (v) => !(/(.)\1{2,}/.test(String(v)));
export const isPhone = (v) => /^(?:\+947\d{8}|07\d{8})$/.test(String(v));
export const strongPassword = (v) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>?,./]).{8,}$/.test(String(v));
export const onlyLetters = (v) => /^[A-Za-z ]+$/.test(String(v));

// Product categories (must match backend Product model CATEGORY_ENUM)
export const CATEGORIES = [
  'Black Tea',
  'Green Tea',
  'White Tea',
  'Herbal',
  'Flavoured'
];

// Product validation function
export const validateProduct = (product) => {
  const errors = {};

  if (!product.name?.trim()) {
    errors.name = 'Product name is required';
  }

  if (!product.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (!product.weight?.trim()) {
    errors.weight = 'Weight is required';
  }

  if (!product.price || product.price <= 0) {
    errors.price = 'Valid price is required';
  } else {
    // Check if price has more than 2 decimal places (matching backend validation)
    const priceStr = String(product.price);
    if (priceStr.includes('.') && priceStr.split('.')[1] && priceStr.split('.')[1].length > 2) {
      errors.price = 'Price can have at most 2 decimal places';
    }
  }

  if (product.stock < 0) {
    errors.stock = 'Stock cannot be negative';
  }

  if (!product.batchNo?.trim()) {
    errors.batchNo = 'Batch number is required';
  }

  if (!product.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  } else {
    const expiryDate = new Date(product.expiryDate);
    const today = new Date();
    if (expiryDate <= today) {
      errors.expiryDate = 'Expiry date must be in the future';
    }
  }

  return errors;
};