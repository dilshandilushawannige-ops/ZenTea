import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Package, Clock, CheckCircle, XCircle, Truck, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ordersApi } from '../api/ordersApi';
import { useAuth } from '../context/AuthContext';

const formatPrice = (value) => {
  const numeric = Number(value) || 0;
  return `LKR ${numeric.toFixed(2)}`;
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All time');
  const [generatingReport, setGeneratingReport] = useState(false);

  const { user } = useAuth();

  const statusOptions = [
    { value: 'All', label: 'All' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const timeOptions = [
    { value: 'All time', label: 'All time' },
    { value: 'Last 7 days', label: 'Last 7 days' },
    { value: 'Last 30 days', label: 'Last 30 days' },
    { value: 'Last 3 months', label: 'Last 3 months' },
    { value: 'Last year', label: 'Last year' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    if (!user) {
      setError('Please login to view your orders');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await ordersApi.getUserOrders();
      setOrders(response.orders || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on status and time (no search)
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== 'All time') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (timeFilter) {
        case 'Last 7 days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'Last 30 days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case 'Last 3 months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'Last year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          filterDate.setFullYear(1970);
      }
      
      filtered = filtered.filter(order => 
        new Date(order.createdAt) >= filterDate
      );
    }

    return filtered;
  }, [orders, statusFilter, timeFilter]);

  const generateOrdersReport = async () => {
    setGeneratingReport(true);
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Orders Summary Report', 20, 20);
      
      // Add user info
      doc.setFontSize(12);
      doc.text(`Customer: ${user.name || 'N/A'}`, 20, 35);
      doc.text(`Email: ${user.email || 'N/A'}`, 20, 45);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55);
      
      // Use filtered orders for the report
      const ordersToReport = filteredOrders.length > 0 ? filteredOrders : orders;
      
      // Prepare table data
      const tableData = ordersToReport.map(order => [
        order._id?.slice(-8) || 'N/A',
        new Date(order.createdAt).toLocaleDateString(),
        order.status || 'N/A',
        order.items?.length || 0,
        formatPrice(order.total) || 'N/A'
      ]);
      
      // Add table using autoTable function
      autoTable(doc, {
        head: [['Order ID', 'Date', 'Status', 'Items', 'Total']],
        body: tableData,
        startY: 70,
        theme: 'striped',
        headStyles: { fillColor: [34, 197, 94] }, // Green color
        styles: { fontSize: 10 }
      });
      
      // Add summary statistics
      const totalOrders = ordersToReport.length;
      const totalAmount = ordersToReport.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
      const completedOrders = ordersToReport.filter(order => order.status === 'Delivered').length;
      
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 70;
      
      doc.setFontSize(12);
      doc.text('Summary Statistics:', 20, finalY + 20);
      doc.text(`Total Orders: ${totalOrders}`, 20, finalY + 35);
      doc.text(`Completed Orders: ${completedOrders}`, 20, finalY + 45);
      doc.text(`Total Amount: ${formatPrice(totalAmount)}`, 20, finalY + 55);
      
      // Add filter information if applied
      if (statusFilter !== 'All' || timeFilter !== 'All time') {
        doc.text('Applied Filters:', 20, finalY + 70);
        if (statusFilter !== 'All') {
          doc.text(`- Status: ${statusFilter}`, 25, finalY + 80);
        }
        if (timeFilter !== 'All time') {
          doc.text(`- Time Period: ${timeFilter}`, 25, finalY + 90);
        }
      }
      
      // Save the PDF
      doc.save(`orders-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to view your orders.</p>
            <a 
              href="/login" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Go to Login
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          
          {/* Filters and Report Generation Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Status Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 self-center mr-2">Filter by Status:</span>
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === status.value
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Time Period:</span>
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {timeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              {(statusFilter !== 'All' || timeFilter !== 'All time') && (
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setTimeFilter('All time');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Report Generation Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Generate Orders Report</h2>
                  </div>
                  <p className="text-gray-600">
                    Download a comprehensive PDF summary of your {statusFilter !== 'All' || timeFilter !== 'All time' ? 'filtered ' : ''}orders including order details, 
                    status information, and summary statistics.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="bg-gray-50 rounded-lg p-4 text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
                    <div className="text-sm text-gray-600">
                      {statusFilter !== 'All' || timeFilter !== 'All time' ? 'Filtered' : 'Total'} Orders
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 text-center min-w-[120px]">
                    <div className="text-2xl font-bold text-green-600">
                      {filteredOrders.filter(order => order.status === 'Delivered').length}
                    </div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                  
                  <button
                    onClick={generateOrdersReport}
                    disabled={generatingReport || filteredOrders.length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {generatingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          {orders.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
                {statusFilter !== 'All' && ` with status "${statusFilter}"`}
                {timeFilter !== 'All time' && ` from ${timeFilter.toLowerCase()}`}
              </p>
            </div>
          )}

          {/* Orders List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <a 
                href="/shop" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id?.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600 border border-blue-200">
                        <Clock className="w-4 h-4 mr-1" />
                        {order.status}
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4">
                              <img
                                src={item.image || 'https://via.placeholder.com/60x60?text=Product'}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm text-gray-600">
                            {order.items.length} items
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            Total: {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const PRICE_FILTERS = [
  { id: 'all', label: 'Price', predicate: () => true },
  { id: 'under-1000', label: 'Under 1,000', predicate: (price) => price !== null && price < 1000 },
  {
    id: '1000-2000',
    label: '1,000 - 2,000',
    predicate: (price) => price !== null && price >= 1000 && price <= 2000
  },
  { id: 'over-2000', label: 'Over 2,000', predicate: (price) => price !== null && price > 2000 }
];

const sortOptions = [
  { id: 'alphabetical-asc', label: 'Alphabetically, A-Z' },
  { id: 'alphabetical-desc', label: 'Alphabetically, Z-A' },
  { id: 'price-low-high', label: 'Price, Low to High' },
  { id: 'price-high-low', label: 'Price, High to Low' }
];

const CaretDownIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
    <path
      d="M4.5 6.5L8 10l3.5-3.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getNumericPrice = (product) => {
  const rawPrice = product?.price;
  if (rawPrice === undefined || rawPrice === null || rawPrice === '') return null;
  const numeric = Number(rawPrice);
  return Number.isFinite(numeric) ? numeric : null;
};

const extractTeaType = (product) => {
  const candidate =
    product?.teaType ||
    product?.tea_type ||
    product?.tea_type_name ||
    product?.category ||
    product?.categoryName ||
    product?.category_name ||
    product?.type ||
    product?.productType ||
    product?.product_type;

  if (!candidate) return '';
  return String(candidate).trim();
};

const getDescription = (product) => {
  const content = [product?.shortDescription, product?.short_description, product?.description]
    .find((value) => value && String(value).trim());
  if (!content) return '';
  return String(content).replace(/<[^>]+>/g, '').trim();
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [teaTypeFilter, setTeaTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState(sortOptions[0].id);
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        const data = await InventoryAPI.listProductsPublic();
        if (!active) return;
        setProducts(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        if (!active) return;
        const message = err?.response?.data?.message || err?.message || 'Unable to load products right now.';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (product) => {
    if (product?.price === undefined || product?.price === null || product?.price === '') return '';
    const numeric = Number(product.price);
    if (Number.isNaN(numeric)) return '';
    const currency = (product.currency || 'LKR').toUpperCase();
    return `${currency} ${numeric.toFixed(2)}`;
  };

  const availableTeaTypes = [
    { value: 'black-tea', label: 'Black Tea' },
    { value: 'green-tea', label: 'Green Tea' },
    { value: 'white-tea', label: 'White Tea' },
    { value: 'herbal', label: 'Herbal' },
    { value: 'flavoured', label: 'Flavoured' }
  ];

  const availablePriceFilters = useMemo(() => {
    const priceValues = products
      .map((product) => getNumericPrice(product))
      .filter((value) => value !== null);

    if (priceValues.length === 0) {
      return PRICE_FILTERS.filter((filter) => filter.id === 'all');
    }

    return PRICE_FILTERS.filter((filter) =>
      filter.id === 'all' || priceValues.some((value) => filter.predicate(value))
    );
  }, [products]);

  useEffect(() => {
    if (!availablePriceFilters.some((filter) => filter.id === priceFilter)) {
      setPriceFilter('all');
    }
  }, [availablePriceFilters, priceFilter]);


  const filteredAndSortedProducts = useMemo(() => {
    const pricePredicate = PRICE_FILTERS.find((filter) => filter.id === priceFilter)?.predicate || (() => true);

    const list = products
      .filter((product) => {
        const numericPrice = getNumericPrice(product);
        if (!pricePredicate(numericPrice)) return false;

        if (teaTypeFilter !== 'all') {
          const productTeaType = extractTeaType(product).toLowerCase();
          const normalizedProductType = productTeaType.replace(/\s+/g, '-');
          if (!productTeaType || normalizedProductType !== teaTypeFilter) return false;
        }

        return true;
      })
      .map((product) => ({ ...product }));

    const compareByName = (a, b) => {
      const nameA = (a?.name || a?.title || '').toString().toLowerCase();
      const nameB = (b?.name || b?.title || '').toString().toLowerCase();
      return nameA.localeCompare(nameB);
    };

    const compareByPrice = (a, b) => {
      const priceA = getNumericPrice(a);
      const priceB = getNumericPrice(b);
      if (priceA === null && priceB === null) return 0;
      if (priceA === null) return 1;
      if (priceB === null) return -1;
      return priceA - priceB;
    };

    switch (sortBy) {
      case 'alphabetical-desc':
        return list.sort((a, b) => compareByName(b, a));
      case 'price-low-high':
        return list.sort(compareByPrice);
      case 'price-high-low':
        return list.sort((a, b) => compareByPrice(b, a));
      case 'alphabetical-asc':
      default:
        return list.sort(compareByName);
    }
  }, [products, priceFilter, teaTypeFilter, sortBy]);

  const handlePriceChange = (event) => {
    setPriceFilter(event.target.value);
  };

  const handleTeaTypeChange = (event) => {
    setTeaTypeFilter(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleAddToCart = (product) => {
    const productToAdd = {
      id: product?.id ?? product?._id ?? product?.sku,
      name: product?.name || product?.title || 'Product',
      price: product?.price || 0,
      image: product?.image ? toImageUrl(product.image) : fallbackProductImage,
      description: getDescription(product)
    };
    addToCart(productToAdd);
  };

  const resultsText = loading ? 'Loading products...' : `${filteredAndSortedProducts.length} products`;

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        {/* Hero Section */}
        <section
          className="min-h-screen relative flex items-start pt-24 md:pt-32 pb-16"
          style={{
            backgroundImage: 'url(/images/shopBg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10"></div>
          <div className="container mx-auto px-4 z-10">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-[#0b6b3c] text-xs md:text-sm tracking-[0.35em] uppercase font-medium"
              >
                SHOP & LEARN
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[32px] font-semibold text-[#006838] leading-tight"
              >
                bring the wonder of nature to everyday moments with our delicious herbal teas
              </motion.h1>
            </div>
          </div>
        </section>

        {/* Shop Intro Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 md:ml-12">
                <h2 className="text-4xl font-semibold text-gray-900">Shop</h2>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-[2px] w-20 bg-gray-900"></span>
                  <span className="h-px flex-1 bg-gray-200"></span>
                </div>
                <p className="mt-8 text-gray-700 leading-relaxed">
                  Enjoy the perfect cup of Ceylon Tea and feel the magic of our Connoisseur Collection, Premium Collection,
                  luxury teas and herbal infusions that bring a sense of elegance to your cup of tea. We have perfected the art
                  of tea so no matter which variety of ZenTea tea you decide to experience you will always enjoy a cup of Sri
                  Lanka's finest.
                </p>
              </div>
              <div className="md:pl-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  We are here to answer any questions you may have about our products or services.
                </p>
                <p className="mt-6 text-gray-700 leading-relaxed">
                  Reach out to us today and we will respond to you as soon as possible.
                </p>
                <a
                  href="mailto:customercare@zestaceylontea.com"
                  className="mt-6 inline-block text-green-900 font-semibold"
                >
                  customercare@zenteaceylon.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            

            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">Filter:</span>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                          <select
                            value={priceFilter}
                            onChange={handlePriceChange}
                            className="w-[120px] appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors duration-200 focus:outline-none"
                          >
                            {availablePriceFilters.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <CaretDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                        </div>
                        <div className="relative">
                          <select
                            value={teaTypeFilter}
                            onChange={handleTeaTypeChange}
                            className="w-[120px] appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors duration-200 focus:outline-none"
                          >
                            <option value="all">Tea Type</option>
                            <option value="black-tea">Black Tea</option>
                            <option value="green-tea">Green Tea</option>
                            <option value="white-tea">White Tea</option>
                            <option value="herbal">Herbal</option>
                            <option value="flavoured">Flavoured</option>
                          </select>
                          <CaretDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Sort by:</span>
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={handleSortChange}
                          className="w-[200px] appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors duration-200 focus:outline-none"
                        >
                          {sortOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <CaretDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">{resultsText}</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-red-700">
                {error}
              </div>
            )}

            {!loading && !error && filteredAndSortedProducts.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-gray-600">
                No products match the selected filters. Please adjust your filters and try again.
              </div>
            )}

            {!loading && !error && filteredAndSortedProducts.length > 0 && (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={gridVariants}
                className="grid grid-cols-1 justify-center justify-items-center gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto"
              >
                {filteredAndSortedProducts.map((product, index) => {
                  const rawImage = product?.image;
                  const imageUrl = rawImage ? toImageUrl(rawImage) : '';
                  const displayImage = imageUrl || fallbackProductImage;
                  const price = formatPrice(product);
                  const description = getDescription(product);
                  const trimmedDescription = description && description.length > 140 ? `${description.slice(0, 137)}...` : description;
                  const name = product?.name || product?.title || 'Product';

                  return (
                    <motion.div
                      key={product?.id ?? product?._id ?? product?.sku ?? index}
                      variants={cardVariants}
                      className="group flex h-[456px] w-full max-w-[256px] flex-col overflow-hidden rounded-none bg-white shadow-md transition-transform duration-300 hover:shadow-lg hover:scale-[1.02]"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={displayImage}
                          alt={name}
                          className="h-[280px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex flex-1 flex-col px-5 py-5">
                        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
                        {trimmedDescription && (
                          <p className="mt-2 flex-1 text-sm text-gray-600">{trimmedDescription}</p>
                        )}
                        {price && (
                          <p className="mt-4 text-sm font-semibold text-gray-900">{price}</p>
                        )}
                        <div className="mt-auto pt-4">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="w-full h-[44px] rounded-full border border-gray-900 bg-white text-base font-medium text-gray-900 transition-colors duration-200 hover:bg-black hover:text-white focus:outline-none"
                          >
                            Buy now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </section>
      </div>
      <IngredientHighlight />
      <FeatureSteps 
        features={[
          {
            step: "Step 1",
            title: "mint",
            content: "Our herbal teas feature refreshing spearmint and cool peppermint, organically grown worldwide for optimal flavour and freshness.",
            image: "/images/Tea1.png",
          },
          {
            step: "Step 2",
            title: "chamomile",
            content: "Chamomile, sourced from organic farms worldwide, infuses our teas with natural soothing essence, bringing comfort and relaxation in every sip.",
            image: "/images/Tea2.png",
          },
          {
            step: "Step 3",
            title: "green tea",
            content: "Rich in nutrients, green tea has long been valued for its invigorating qualities. Blended with matcha, it energizes and connects you with nature’s best.",
            image: "/images/Tea3.png",
          },
        ]}
        title=""
        imageHeight="h-[460px] w-[460px]"
      />
      
      <Footer />
    </>
  );
};
