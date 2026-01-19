import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api/ordersApi';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2';

const formatPrice = (value) => {
  const numeric = Number(value) || 0;
  return `LKR ${numeric.toFixed(2)}`;
};

const formatPriceUSD = (value) => {
  const numeric = Number(value) || 0;
  // Simple conversion for display (you should use real exchange rates)
  const usdValue = numeric / 200; // Rough LKR to USD conversion
  return `$${usdValue.toFixed(2)}`;
};

const Checkout = () => {
  const {
    cartItems,
    getTotalPrice,
    isEligibleForFreeDelivery,
    clearCart
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    discountCode: ''
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation functions
  const validateShippingForm = (data) => {
    const newErrors = {};

    // First Name - only letters
    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (data.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (data.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    } else if (!/^[A-Za-z\s]+$/.test(data.firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters and spaces';
    }

    // Last Name - only letters
    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (data.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (data.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    } else if (!/^[A-Za-z\s]+$/.test(data.lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters and spaces';
    }

    // City - only letters
    if (!data.city.trim()) {
      newErrors.city = 'City is required';
    } else if (data.city.trim().length < 2) {
      newErrors.city = 'City name must be at least 2 characters';
    } else if (data.city.trim().length > 50) {
      newErrors.city = 'City name must be less than 50 characters';
    } else if (!/^[A-Za-z\s]+$/.test(data.city.trim())) {
      newErrors.city = 'City name can only contain letters and spaces';
    }

    // Zip Code - positive numbers only
    if (!data.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d+$/.test(data.zipCode.trim())) {
      newErrors.zipCode = 'ZIP code can only contain numbers';
    } else if (data.zipCode.trim().length < 5) {
      newErrors.zipCode = 'ZIP code must be at least 5 digits';
    } else if (data.zipCode.trim().length > 10) {
      newErrors.zipCode = 'ZIP code must be less than 10 digits';
    } else if (parseInt(data.zipCode.trim()) <= 0) {
      newErrors.zipCode = 'ZIP code must be a positive number';
    }

    // Phone - exactly 10 digits starting with 07
    if (!data.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^07\d{8}$/.test(data.phone.trim())) {
      newErrors.phone = 'Phone must be exactly 10 digits starting with 07 (e.g., 0771234567)';
    }

    // Address - letters, numbers, "/", "," and spaces only
    if (!data.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (data.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    } else if (data.address.trim().length > 200) {
      newErrors.address = 'Address must be less than 200 characters';
    } else if (!/^[A-Za-z0-9\s\/,]+$/.test(data.address.trim())) {
      newErrors.address = 'Address can only contain letters, numbers, spaces, "/" and ","';
    }

    // Apartment - characters only (letters, numbers, spaces)
    if (data.apartment.trim() && data.apartment.trim().length > 50) {
      newErrors.apartment = 'Apartment details must be less than 50 characters';
    } else if (data.apartment.trim() && !/^[A-Za-z0-9\s]+$/.test(data.apartment.trim())) {
      newErrors.apartment = 'Apartment details can only contain letters, numbers and spaces';
    }

    // State is required
    if (!data.state.trim()) {
      newErrors.state = 'State is required';
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let filteredValue = value;
    
    // Filter input based on field type
    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'city':
        // Allow only letters and spaces
        filteredValue = value.replace(/[^A-Za-z\s]/g, '');
        break;
      case 'zipCode':
        // Allow only positive numbers
        filteredValue = value.replace(/[^0-9]/g, '');
        break;
      case 'phone':
        // Allow only digits and limit to exactly 10 characters
        filteredValue = value.replace(/[^0-9]/g, '').slice(0, 10);
        break;
      case 'address':
        // Allow only letters, numbers, spaces, "/" and ","
        filteredValue = value.replace(/[^A-Za-z0-9\s\/,]/g, '');
        break;
      case 'apartment':
        // Allow only letters, numbers and spaces
        filteredValue = value.replace(/[^A-Za-z0-9\s]/g, '');
        break;
      default:
        filteredValue = value;
    }
    
    // Update form data
    const updatedData = {
      ...formData,
      [name]: filteredValue
    };
    setFormData(updatedData);

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Real-time validation for specific fields
    const newErrors = { ...errors };
    
    switch (name) {
      case 'firstName':
        if (filteredValue.trim() && !/^[A-Za-z\s]+$/.test(filteredValue.trim())) {
          newErrors.firstName = 'First name can only contain letters and spaces';
        }
        break;
      case 'lastName':
        if (filteredValue.trim() && !/^[A-Za-z\s]+$/.test(filteredValue.trim())) {
          newErrors.lastName = 'Last name can only contain letters and spaces';
        }
        break;
      case 'city':
        if (filteredValue.trim() && !/^[A-Za-z\s]+$/.test(filteredValue.trim())) {
          newErrors.city = 'City name can only contain letters and spaces';
        }
        break;
      case 'zipCode':
        if (filteredValue.trim() && (!/^\d+$/.test(filteredValue.trim()) || parseInt(filteredValue.trim()) <= 0)) {
          newErrors.zipCode = 'ZIP code must be positive numbers only';
        }
        break;
      case 'phone':
        if (filteredValue.trim()) {
          if (filteredValue.startsWith('+94')) {
            if (!/^\+947\d{0,8}$/.test(filteredValue)) {
              newErrors.phone = 'Phone must be in format +947xxxxxxxx';
            } else if (filteredValue.length === 12 && !/^\+947\d{8}$/.test(filteredValue)) {
              newErrors.phone = 'Phone must be exactly +947xxxxxxxx (12 characters)';
            }
          } else {
            if (!/^07/.test(filteredValue) && filteredValue.length > 0) {
              newErrors.phone = 'Phone number must start with 07 or +947';
            } else if (filteredValue.length === 10 && !/^07\d{8}$/.test(filteredValue)) {
              newErrors.phone = 'Phone must be exactly 10 digits starting with 07';
            } else if (filteredValue.length > 0 && filteredValue.length < 10 && !filteredValue.startsWith('07')) {
              newErrors.phone = 'Phone number must start with 07';
            }
          }
        }
        break;
      case 'address':
        if (filteredValue.trim() && !/^[A-Za-z0-9\s\/,]+$/.test(filteredValue.trim())) {
          newErrors.address = 'Address can only contain letters, numbers, spaces, "/" and ","';
        }
        break;
      case 'apartment':
        if (filteredValue.trim() && !/^[A-Za-z0-9\s]+$/.test(filteredValue.trim())) {
          newErrors.apartment = 'Apartment can only contain letters, numbers and spaces';
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleApplyDiscount = () => {
    // Discount code logic here
    console.log('Applying discount code:', formData.discountCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate form data
      const validationErrors = validateShippingForm(formData);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsProcessing(false);
        
        // Show validation error message
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: 'Please correct the errors in the form before proceeding.',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Check if user is logged in
      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please login to complete your order',
          confirmButtonText: 'Go to Login'
        }).then(() => {
          navigate('/login');
        });
        setIsProcessing(false);
        return;
      }

      // Prepare order data
      const orderData = {
        shippingInfo: formData,
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: parseFloat(item.price) || 0,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        shippingCost: shipping,
        total
      };

      // Create order
      const response = await ordersApi.createOrder(orderData);
      
      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          text: `Your order #${response.order._id.slice(-6)} has been placed.`,
          confirmButtonText: 'View My Orders'
        }).then(() => {
          clearCart();
          navigate('/my-orders');
        });
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.response?.data?.message || 'Failed to place order. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = getTotalPrice();
  const shipping = isEligibleForFreeDelivery() ? 0 : 500;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to proceed to checkout.</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-8">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/cart" className="hover:text-gray-900 transition-colors">Cart</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Shipping Form */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                     
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                        errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                    {!errors.firstName && (
                      <p className="mt-1 text-xs text-gray-500">Letters and spaces only </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                        errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                    {!errors.lastName && (
                      <p className="mt-1 text-xs text-gray-500">Letters and spaces only </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="relative">
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  
                    required
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                      errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Letters, numbers, spaces, "/" and "," allowed </p>
                </div>

                {/* Apartment */}
                <div>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                  
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                      errors.apartment ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.apartment && (
                    <p className="mt-1 text-sm text-red-600">{errors.apartment}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Optional - letters, numbers and spaces only </p>
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                     
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                        errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                    {!errors.city && (
                      <p className="mt-1 text-xs text-gray-500">Letters and spaces only </p>
                    )}
                  </div>
                  <div>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white ${
                        errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">State</option>
                      <option value="Western">Western</option>
                      <option value="Central">Central</option>
                      <option value="Southern">Southern</option>
                      <option value="Northern">Northern</option>
                      <option value="Eastern">Eastern</option>
                      <option value="North Western">North Western</option>
                      <option value="North Central">North Central</option>
                      <option value="Uva">Uva</option>
                      <option value="Sabaragamuwa">Sabaragamuwa</option>
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                    
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                        errors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                    {!errors.zipCode && (
                      <p className="mt-1 text-xs text-gray-500">Numbers only </p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    
                    maxLength="10"
                    required
                    className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500 ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                  {!errors.phone && (
                    <p className="mt-1 text-xs text-gray-500">Enter 10 digits starting with 07 </p>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={item.image || 'https://via.placeholder.com/60x60?text=Product'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.weight || 'Standard'}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    name="discountCode"
                    value={formData.discountCode}
                    onChange={handleInputChange}
                    placeholder="Discount code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Order Totals */}
              <div className="space-y-3 py-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal · {cartItems.length} items</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full mt-6 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Lock className="h-5 w-5" />
                <span>{isProcessing ? 'Processing...' : 'Complete Order'}</span>
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;