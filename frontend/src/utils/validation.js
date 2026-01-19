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

// Function to check batch number uniqueness
export const checkBatchUniqueness = async (batchNo, currentProductId = null) => {
  try {
    const { InventoryAPI } = await import('../api/inventoryApi');
    const products = await InventoryAPI.listProducts({ search: batchNo });
    
    // Check if any product has the same batch number
    const existingProduct = products.find(product => 
      product.batchNo === batchNo && product._id !== currentProductId
    );
    
    return !existingProduct; // Return true if unique, false if duplicate
  } catch (error) {
    console.error('Error checking batch uniqueness:', error);
    return true; // Allow validation to pass if API call fails
  }
};

// Product validation function
export const validateProduct = (product) => {
  const errors = {};

  // Name validation - only letters and spaces, minimum 3 characters
  if (!product.name?.trim()) {
    errors.name = 'Product name is required';
  } else if (product.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  } else if (!onlyLetters(product.name.trim())) {
    errors.name = 'Name can only contain letters and spaces';
  }

  if (!product.category?.trim()) {
    errors.category = 'Category is required';
  }

  if (!product.weight?.trim()) {
    errors.weight = 'Weight is required';
  }

  // Price validation - must be greater than 0
  if (!product.price || product.price <= 0) {
    errors.price = 'Price must be greater than 0';
  } else {
    // Check if price has more than 2 decimal places (matching backend validation)
    const priceStr = String(product.price);
    if (priceStr.includes('.') && priceStr.split('.')[1] && priceStr.split('.')[1].length > 2) {
      errors.price = 'Price can have at most 2 decimal places';
    }
  }

  // Stock validation - must be greater than 0
  if (product.stock === '' || product.stock === null || product.stock === undefined) {
    errors.stock = 'Stock is required';
  } else if (product.stock <= 0) {
    errors.stock = 'Stock must be greater than 0';
  }

  if (!product.batchNo?.trim()) {
    errors.batchNo = 'Batch number is required';
  }

  // Expiry date validation - must be future date
  if (!product.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  } else {
    const expiryDate = new Date(product.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    if (expiryDate <= today) {
      errors.expiryDate = 'Expiry date must be in the future';
    }
  }

  // Minimum stock validation - must be greater than 0
  if (product.minStock === '' || product.minStock === null || product.minStock === undefined) {
    errors.minStock = 'Minimum stock is required';
  } else if (product.minStock <= 0) {
    errors.minStock = 'Minimum stock must be greater than 0';
  }

  return errors;
};