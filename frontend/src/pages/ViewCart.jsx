import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (value) => {
  const numeric = Number(value) || 0;
  return `LKR ${numeric.toFixed(2)}`;
};

const ViewCart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    isEligibleForFreeDelivery
  } = useCart();

  const navigate = useNavigate();

  const handleDecrease = (item) => {
    if (item.quantity <= 1) return;
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const total = formatPrice(getTotalPrice());
  const isEmpty = cartItems.length === 0;

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Cart</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-12">Shopping Cart</h1>

        {isEmpty ? (
          <div className="rounded-3xl border border-[#e3d7c5] bg-white px-10 py-16 text-center shadow-sm">
            <p className="text-2xl/font-semibold text-gray-900">Your cart is empty</p>
            <p className="mt-3 text-gray-600">Browse our shop to discover your new favourite tea.</p>
            <button
              type="button"
              onClick={() => navigate('/shop')}
              className="mt-8 inline-flex items-center justify-center rounded-full border border-gray-900 px-8 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:pl-12">
            <div className="rounded-3xl border border-[#e3d7c5] bg-white shadow-sm">
              <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-4 border-b border-[#eadfcd] bg-[#DCFCE7] px-8 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
                <span>Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
              </div>

              <div className="divide-y divide-[#f0e4d2]">
                {cartItems.map((item) => {
                  const basePrice = parseFloat(item.price) || 0;
                  const lineTotal = basePrice * item.quantity;

                  return (
                    <div key={item.id} className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] gap-4 px-8 py-6">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-[#eadfcd] bg-white">
                          <img
                            src={item.image || 'https://via.placeholder.com/120x120?text=Product'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900">{formatPrice(basePrice)}</p>
                          <p className="text-sm leading-relaxed text-gray-700">{item.name}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-[2.5rem] text-center text-base font-semibold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition-colors hover:bg-gray-100"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-sm font-medium text-gray-600 underline underline-offset-4 transition-colors hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex items-center justify-end">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(lineTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              {isEligibleForFreeDelivery() && (
                <div className="rounded-2xl border border-[#bde5c8] bg-[#e9fbef] px-6 py-4 text-sm font-medium text-[#0f5132] shadow-sm">
                  You are eligible for free shipping!
                </div>
              )}

              <div className="rounded-3xl border border-[#e3d7c5] bg-white px-8 py-10 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">Total</p>
                <p className="mt-4 text-[40px] leading-none font-semibold text-gray-900">{total}</p>
                <p className="mt-4 text-sm text-gray-500">Taxes and shipping calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={() => window.scrollTo({ top: 0 })}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-gray-900 px-7 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
                >
                  Check Out
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ViewCart;
