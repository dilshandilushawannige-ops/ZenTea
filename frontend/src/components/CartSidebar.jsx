import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartSidebar = () => {
  const {
    cartItems,
    isCartOpen,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    isEligibleForFreeDelivery,
    closeCart
  } = useCart();

  const formatPrice = (price) => {
    const numeric = parseFloat(price) || 0;
    return `LKR ${numeric.toFixed(2)}`;
  };

  useEffect(() => {
    const preventScroll = (e) => {
      const cartSidebar = document.querySelector('[data-cart-sidebar]');
      if (cartSidebar && cartSidebar.contains(e.target)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    if (isCartOpen) {
      const scrollY = window.scrollY;

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      document.body.setAttribute('data-scroll-y', scrollY.toString());

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('keydown', (e) => {
        const cartSidebar = document.querySelector('[data-cart-sidebar]');
        if (cartSidebar && cartSidebar.contains(e.target)) {
          return;
        }

        if ([32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode)) {
          e.preventDefault();
        }
      });
    } else {
      const scrollY = document.body.getAttribute('data-scroll-y') || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');

      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);

      window.scrollTo(0, parseInt(scrollY, 10));
    }

    return () => {
      const scrollY = document.body.getAttribute('data-scroll-y') || '0';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.removeAttribute('data-scroll-y');
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      window.scrollTo(0, parseInt(scrollY, 10));
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black"
            onClick={closeCart}
          />

          <motion.div
            data-cart-sidebar
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto bg-[#DCFCE7] shadow-2xl scrollbar-hide"
          >
            <div className="flex items-center justify-between p-6 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                Shopping Cart ({getTotalItems()})
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {isEligibleForFreeDelivery() && (
              <div className="bg-gray-800 text-white p-4 mx-6 rounded-lg flex-shrink-0">
                <p className="text-center font-medium">
                  You are eligible for free shipping!
                </p>
              </div>
            )}

            <div className="px-6 py-4 flex-1 bg-[#DCFCE7]">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBag className="h-16 w-16 mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-sm text-center">
                    Add some products to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || 'https://via.placeholder.com/80x80?text=Product'}
                          alt={item.name}
                          className="w-20 h-20 object-cover border border-gray-200"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {formatPrice(item.price)}
                        </p>
                        <h3 className="text-sm text-gray-900 mb-3 leading-tight">
                          {item.name}
                        </h3>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-3 w-3 text-gray-600" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-3 w-3 text-gray-600" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-sm text-gray-600 underline hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-[#DCFCE7] px-6 py-8">
                <div className="text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-800">Total</p>
                  <p className="mt-3 text-[40px] font-semibold text-gray-900 leading-none">{formatPrice(getTotalPrice())}</p>
                  <p className="mt-3 text-sm text-gray-500">Taxes and shipping calculated at checkout</p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="min-w-[150px] rounded-full bg-gray-900 px-7 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-black"
                  >
                    View Cart
                  </Link>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="min-w-[150px] rounded-full border border-gray-900 px-7 py-3 text-center text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                  >
                    Check Out
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
