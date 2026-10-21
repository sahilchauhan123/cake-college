'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Store } from 'lucide-react';
import { useCart } from '../lib/cart';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    removeItem,
    updateQuantity,
    subtotal,
    deliveryFee,
    total,
    fulfillmentType,
    setFulfillmentType,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div
        className="drawer-panel p-6 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#E8DDD2]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FAF4EB] flex items-center justify-center text-[#8B4513]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-xl font-bold text-[#231815]">Your Fresh Box</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#FAF4EB] text-[#7E6C65] transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fulfillment Toggle */}
          <div className="mt-4 bg-[#FAF4EB] p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setFulfillmentType('DELIVERY')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                fulfillmentType === 'DELIVERY'
                  ? 'bg-white text-[#8B4513] shadow-sm'
                  : 'text-[#7E6C65] hover:text-[#231815]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Home Delivery ($5)
            </button>
            <button
              onClick={() => setFulfillmentType('PICKUP')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                fulfillmentType === 'PICKUP'
                  ? 'bg-white text-[#8B4513] shadow-sm'
                  : 'text-[#7E6C65] hover:text-[#231815]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Bakery Pickup (Free)
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#FAF4EB] flex items-center justify-center text-[#8B4513] mb-3">
                <ShoppingBag className="w-8 h-8 opacity-40" />
              </div>
              <p className="font-serif text-lg font-bold text-[#231815]">Your box is empty</p>
              <p className="text-xs text-[#7E6C65] mt-1 max-w-[200px]">
                Treat yourself to fresh croissants, artisan sourdough, or custom celebration cakes!
              </p>
              <Link
                href="/catalogue"
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary !py-2 !px-4 text-xs mt-4"
              >
                Browse Fresh Menu
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E8DDD2] flex gap-3 relative group"
              >
                <div className="w-18 h-18 rounded-xl overflow-hidden bg-[#FAF4EB] shrink-0 relative">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={72}
                    height={72}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-[#231815] truncate">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#A8988D] hover:text-[#BE123C] p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] font-medium text-[#B45309] bg-[#FEF3C7] inline-block px-2 py-0.5 rounded-full mt-0.5">
                    {item.selectedSize}
                  </p>

                  {item.cakeMessage && (
                    <p className="text-[11px] text-[#7E6C65] italic truncate mt-1">
                      Message: &ldquo;{item.cakeMessage}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-sm font-extrabold text-[#231815]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-white border border-[#E8DDD2] rounded-full px-2 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-[#7E6C65] hover:text-[#8B4513] p-0.5"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-[#7E6C65] hover:text-[#8B4513] p-0.5"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-[#E8DDD2] space-y-3">
            <div className="space-y-1.5 text-xs text-[#7E6C65]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#231815]">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment ({fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Store Pickup'})</span>
                <span className="font-semibold text-[#231815]">
                  {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#231815] pt-1 border-t border-[#E8DDD2]">
                <span>Estimated Total</span>
                <span className="text-[#8B4513]">${total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary w-full text-center text-sm py-3.5 flex items-center justify-center gap-2"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
