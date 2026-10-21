'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Truck,
  Store,
  CreditCard,
  Banknote,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  Printer,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../lib/cart';
import { supabase } from '../../lib/supabase';
import { formatOrderWhatsAppMessage, getWhatsAppUrl } from '../../lib/whatsapp';

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    fulfillmentType,
    setFulfillmentType,
    clearCart,
  } = useCart();

  // Contact & Delivery form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Date selection (minimum today or tomorrow)
  const todayString = new Date().toISOString().split('T')[0];
  const [deliveryDate, setDeliveryDate] = useState(todayString);
  const [deliverySlot, setDeliverySlot] = useState('11:00 - 14:00 (Lunch Time)');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE' | 'UPI' | 'STORE_PICKUP'>('COD');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and contact phone number');
      return;
    }
    if (fulfillmentType === 'DELIVERY' && !deliveryAddress.trim()) {
      alert('Please provide your complete delivery address');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

      // 1. Insert into Supabase `orders` table
      const { data: orderData, error: orderError } = await (supabase
        .from('orders') as any)
        .insert({
          order_number: orderNumber,
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_email: customerEmail.trim() || null,
          fulfillment_type: fulfillmentType,
          delivery_address: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : null,
          delivery_date: deliveryDate,
          delivery_slot: deliverySlot,
          order_notes: orderNotes.trim() || null,
          subtotal: Number(subtotal.toFixed(2)),
          delivery_fee: Number(deliveryFee.toFixed(2)),
          grand_total: Number(total.toFixed(2)),
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'COD' || paymentMethod === 'STORE_PICKUP' ? 'PENDING' : 'PAID',
          order_status: 'PENDING',
        })
        .select()
        .single();

      if (orderError) {
        console.warn('Orders table note:', orderError.message);
      }

      // 2. Insert order items into `order_items` table
      if (orderData?.id) {
        const orderItemsPayload = items.map((item) => ({
          order_id: orderData.id,
          product_id: item.productId.length === 36 ? item.productId : null,
          product_name: item.name,
          selected_size: item.selectedSize,
          cake_message: item.cakeMessage || null,
          unit_price: Number(item.price.toFixed(2)),
          quantity: item.quantity,
          total_price: Number((item.price * item.quantity).toFixed(2)),
        }));

        await (supabase.from('order_items') as any).insert(orderItemsPayload);
      }

      // 3. Format WhatsApp link
      const waMessage = formatOrderWhatsAppMessage({
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        fulfillmentType,
        deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
        deliveryDate,
        deliverySlot,
        items: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          size: i.selectedSize,
          price: i.price,
          message: i.cakeMessage,
        })),
        subtotal,
        deliveryFee,
        grandTotal: total,
        notes: orderNotes.trim(),
      });

      const url = getWhatsAppUrl(waMessage);
      setWhatsappUrl(url);

      setConfirmedOrder({
        orderNumber,
        customerName,
        customerPhone,
        fulfillmentType,
        deliveryAddress,
        deliveryDate,
        deliverySlot,
        items: [...items],
        subtotal,
        deliveryFee,
        total,
        paymentMethod,
      });

      // Clear the shopping cart
      clearCart();

      // Trigger Celebration Confetti
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B4513', '#D97706', '#22C55E', '#BE123C'],
      });
    } catch (err) {
      console.error('Error placing order:', err);
      alert('There was an issue processing your order. Please place via WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ORDER SUCCESS RECEIPT SCREEN
  if (confirmedOrder) {
    return (
      <div className="py-12 bg-[#FDFBF7]">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#E8DDD2] shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-[#B45309]">
              Order Confirmed & Sent to Kitchen
            </span>
            <h1 className="font-serif text-3xl font-extrabold text-[#231815] mt-1">
              Thank You, {confirmedOrder.customerName}!
            </h1>
            <p className="text-xs text-[#7E6C65] mt-1">
              Order Number: <strong className="text-[#8B4513]">#{confirmedOrder.orderNumber}</strong>
            </p>

            {/* Receipt Box */}
            <div className="mt-6 p-6 rounded-2xl bg-[#FAF4EB] border border-[#E8DDD2] text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-[#E8DDD2] pb-2 font-bold text-[#231815]">
                <span>Fulfillment Type</span>
                <span>{confirmedOrder.fulfillmentType === 'DELIVERY' ? 'Home Delivery' : 'Bakery Pickup'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7E6C65]">Scheduled For:</span>
                <span className="font-semibold">{confirmedOrder.deliveryDate} ({confirmedOrder.deliverySlot})</span>
              </div>
              {confirmedOrder.fulfillmentType === 'DELIVERY' && (
                <div className="flex justify-between">
                  <span className="text-[#7E6C65]">Address:</span>
                  <span className="font-semibold text-right max-w-xs">{confirmedOrder.deliveryAddress}</span>
                </div>
              )}

              {/* Items */}
              <div className="pt-2 border-t border-[#E8DDD2]">
                <p className="font-bold text-[#231815] mb-2">Order Items:</p>
                <div className="space-y-1.5">
                  {confirmedOrder.items.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {i.quantity}x {i.name} ({i.selectedSize})
                        {i.cakeMessage && <span className="block text-[10px] text-[#A8988D] italic">Message: &ldquo;{i.cakeMessage}&rdquo;</span>}
                      </span>
                      <span className="font-semibold">${(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-[#E8DDD2] space-y-1">
                <div className="flex justify-between text-[#7E6C65]">
                  <span>Subtotal</span>
                  <span>${confirmedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#7E6C65]">
                  <span>Delivery Charge</span>
                  <span>{confirmedOrder.deliveryFee > 0 ? `$${confirmedOrder.deliveryFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#231815] pt-1">
                  <span>Grand Total</span>
                  <span className="text-[#8B4513]">${confirmedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp w-full sm:w-auto"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Order via WhatsApp
                </a>
              )}
              <button
                onClick={() => window.print()}
                className="btn-secondary w-full sm:w-auto"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <Link href="/catalogue" className="btn-primary w-full sm:w-auto">
                Order More Bakes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (items.length === 0) {
    return (
      <div className="py-20 bg-[#FDFBF7] text-center">
        <div className="container-custom max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#FAF4EB] text-[#8B4513] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 opacity-40" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#231815]">Your box is empty</h1>
          <p className="text-xs text-[#7E6C65] mt-2 mb-6">
            Please add cakes, pastries, or artisan breads before proceeding to checkout.
          </p>
          <Link href="/catalogue" className="btn-primary">
            Browse Bakery Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-[#FDFBF7]">
      <div className="container-custom max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/catalogue"
            className="text-xs font-bold text-[#8B4513] hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalogue
          </Link>
          <span className="text-xs text-[#7E6C65] font-semibold">Step 2 of 2: Checkout</span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#231815] mb-8">
          Complete Your Order
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Details & Delivery */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Fulfillment Toggle */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[#231815] mb-3">
                1. Delivery or Pickup
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('DELIVERY')}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    fulfillmentType === 'DELIVERY'
                      ? 'border-[#8B4513] bg-[#F7EFE8] ring-1 ring-[#8B4513]'
                      : 'border-[#E8DDD2] bg-[#FAF4EB]'
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#8B4513]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#231815]">Doorstep Delivery</p>
                    <p className="text-[10px] text-[#7E6C65]">$5.00 delivery fee</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('PICKUP')}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    fulfillmentType === 'PICKUP'
                      ? 'border-[#8B4513] bg-[#F7EFE8] ring-1 ring-[#8B4513]'
                      : 'border-[#E8DDD2] bg-[#FAF4EB]'
                  }`}
                >
                  <Store className="w-5 h-5 text-[#8B4513]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#231815]">Bakery Pickup</p>
                    <p className="text-[10px] text-[#15803D] font-bold">FREE Pickup</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Customer Information */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[#231815] mb-3">
                2. Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sophia Martinez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 555 234 5678"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="sophia@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                />
              </div>

              {fulfillmentType === 'DELIVERY' && (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                    Delivery Address & Apartment *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Flat 4B, Sunflower Apts, Maple Boulevard..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                  />
                </div>
              )}
            </div>

            {/* 3. Date & Time Window */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[#231815] mb-3">
                3. Date & Preferred Slot
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayString}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full text-sm p-3 pl-10 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                      required
                    />
                    <Calendar className="w-4 h-4 text-[#7E6C65] absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                    Time Window
                  </label>
                  <div className="relative">
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full text-sm p-3 pl-10 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                    >
                      <option value="08:00 - 11:00 (Breakfast Hot Bakes)">8:00 AM - 11:00 AM (Breakfast Hot Bakes)</option>
                      <option value="11:00 - 14:00 (Lunch Time)">11:00 AM - 2:00 PM (Lunch Time)</option>
                      <option value="15:00 - 18:00 (Afternoon Tea)">3:00 PM - 6:00 PM (Afternoon Tea)</option>
                      <option value="18:00 - 21:00 (Dinner / Party)">6:00 PM - 9:00 PM (Dinner / Party)</option>
                    </select>
                    <Clock className="w-4 h-4 text-[#7E6C65] absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1.5">
                  Order Note / Free Gift Message Card
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring bell twice, or write 'Warmest Wishes from David' on note card"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                />
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm">
              <h2 className="font-serif text-lg font-bold text-[#231815] mb-3">
                4. Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#8B4513] bg-[#F7EFE8] ring-1 ring-[#8B4513]'
                      : 'border-[#E8DDD2] bg-[#FAF4EB]'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#8B4513]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#231815]">Cash / Card on Delivery</p>
                    <p className="text-[10px] text-[#7E6C65]">Pay at doorstep</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#8B4513] bg-[#F7EFE8] ring-1 ring-[#8B4513]'
                      : 'border-[#E8DDD2] bg-[#FAF4EB]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#8B4513]" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#231815]">UPI / Instant QR Pay</p>
                    <p className="text-[10px] text-[#15803D] font-bold">Fast & Contactless</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Box */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm sticky top-28 space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#231815] pb-3 border-b border-[#E8DDD2]">
                Order Summary ({items.length} items)
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF4EB] overflow-hidden shrink-0 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#231815] truncate">{item.name}</p>
                      <p className="text-[10px] text-[#B45309]">{item.selectedSize}</p>
                      {item.cakeMessage && (
                        <p className="text-[10px] text-[#7E6C65] italic truncate">
                          &ldquo;{item.cakeMessage}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#231815]">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-[#7E6C65]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t border-[#E8DDD2] space-y-2 text-xs">
                <div className="flex justify-between text-[#7E6C65]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#231815]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#7E6C65]">
                  <span>Fulfillment ({fulfillmentType === 'DELIVERY' ? 'Delivery' : 'Pickup'})</span>
                  <span className="font-semibold text-[#231815]">
                    {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'FREE'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-extrabold text-[#231815] pt-2 border-t border-[#E8DDD2]">
                  <span>Total Amount</span>
                  <span className="text-[#8B4513] font-serif">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? 'Sending to Kitchen...' : `Confirm & Place Order ($${total.toFixed(2)})`}
              </button>

              <p className="text-[11px] text-center text-[#7E6C65]">
                🔒 Orders directly transmit to kitchen staff. You will receive an instant WhatsApp confirmation link!
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
