'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Store, Sparkles } from 'lucide-react';
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

  const freeDeliveryThreshold = 1000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountRemaining = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="drawer-overlay" onClick={() => setIsCartOpen(false)}>
      <div
        className="drawer-panel p-6 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#111111]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E4007C] flex items-center justify-center text-white font-black text-sm">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-[#111111]">Your Box</h2>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-[#F4F4F4] text-[#111111] hover:text-[#E4007C] transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Milk Bar Free Delivery Progress Bar */}
          <div className="mt-4 bg-[#FFF0F6] border border-[#E4007C]/30 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-1.5">
              <span className="text-[#111111] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E4007C]" />
                {amountRemaining > 0 ? (
                  <>Add <span className="text-[#E4007C]">₹{Math.round(amountRemaining)}</span> for FREE Delivery!</>
                ) : (
                  <span className="text-[#059669]">🎉 You qualified for FREE Delivery!</span>
                )}
              </span>
              <span className="text-[10px] text-[#6B7280]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#111111]/20">
              <div
                className="h-full bg-[#E4007C] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Fulfillment Toggle */}
          <div className="mt-3 bg-[#F4F4F4] p-1 rounded-xl flex items-center text-xs font-black uppercase tracking-wider border border-[#111111]/10">
            <button
              onClick={() => setFulfillmentType('DELIVERY')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                fulfillmentType === 'DELIVERY'
                  ? 'bg-white text-[#111111] shadow-sm border border-[#111111]'
                  : 'text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#E4007C]" />
              Delivery (₹60)
            </button>
            <button
              onClick={() => setFulfillmentType('PICKUP')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                fulfillmentType === 'PICKUP'
                  ? 'bg-white text-[#111111] shadow-sm border border-[#111111]'
                  : 'text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#E4007C]" />
              Bakery Pickup (FREE)
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F6] border-2 border-[#111111] flex items-center justify-center text-[#E4007C] mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-lg font-black uppercase tracking-tight text-[#111111]">Your box is empty</p>
              <p className="text-xs text-[#6B7280] mt-1 max-w-[220px] font-medium">
                Treat yourself to famous celebration cakes, croissants, or custom dessert bakes!
              </p>
              <Link
                href="/catalogue"
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary !py-2 !px-5 text-xs mt-4"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white border-2 border-[#111111] flex gap-3 relative shadow-[3px_3px_0px_#111111] group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#FFF0F6] shrink-0 relative border border-[#111111]/20">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-black uppercase tracking-tight text-[#111111] truncate">
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#6B7280] hover:text-[#E4007C] p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-wider text-[#111111] bg-[#FFE600] border border-[#111111] inline-block px-2 py-0.5 rounded-full mt-1">
                    {item.selectedSize}
                  </p>

                  {item.cakeMessage && (
                    <p className="text-[10px] text-[#6B7280] italic truncate mt-1">
                      Piping: &ldquo;{item.cakeMessage}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-sm font-black text-[#111111]">
                      ₹{Math.round(item.price * item.quantity)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-[#F4F4F4] border border-[#111111] rounded-full px-2 py-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-[#111111] hover:text-[#E4007C] p-0.5 font-black"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-[#111111] hover:text-[#E4007C] p-0.5 font-black"
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
          <div className="pt-4 border-t-2 border-[#111111] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-[#6B7280]">
                <span>SUBTOTAL</span>
                <span className="font-black text-[#111111]">₹{Math.round(subtotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#6B7280]">
                <span>FULFILLMENT ({fulfillmentType === 'DELIVERY' ? 'DELIVERY' : 'PICKUP'})</span>
                <span className="font-black text-[#111111]">
                  {deliveryFee > 0 ? `₹${Math.round(deliveryFee)}` : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-[#111111] pt-2 border-t border-[#111111]/10">
                <span className="uppercase">TOTAL</span>
                <span className="text-[#E4007C]">₹{Math.round(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary w-full text-center text-sm py-3.5 flex items-center justify-center gap-2"
            >
              <span>CHECKOUT NOW</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
