import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import IngredientHighlight from '../components/IngredientHighlight';
import FeatureSteps from '../components/FeatureSteps.jsx';


import Footer from '../components/Footer';
import { InventoryAPI, toImageUrl } from '../api/inventoryApi';
import { useCart } from '../context/CartContext';

const fallbackProductImage = 'https://via.placeholder.com/400x400?text=Product';
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

export default Shop;

