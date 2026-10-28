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
  Sparkles,
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

      // Trigger Celebration Confetti (Milk Bar Colors)
      confetti({
        particleCount: 100,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#E4007C', '#FFE600', '#00E5A3', '#111111'],
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
      <div className="py-12 bg-white">
        <div className="container-custom max-w-2xl">
          <div className="bg-[#FFF0F6] rounded-2xl p-8 md:p-10 border-2 border-[#111111] shadow-[6px_6px_0px_#111111] text-center">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] border-2 border-[#15803D] text-[#15803D] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-[#E4007C] bg-white border border-[#111111] px-3 py-1 rounded-full">
              ORDER CONFIRMED &amp; TRANSMITTED TO OVEN
            </span>
            <h1 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-3">
              THANK YOU, {confirmedOrder.customerName}!
            </h1>
            <p className="text-xs text-[#6B7280] font-bold mt-1">
              Order Number: <strong className="text-[#E4007C]">#{confirmedOrder.orderNumber}</strong>
            </p>

            {/* Receipt Box */}
            <div className="mt-6 p-6 rounded-xl bg-white border-2 border-[#111111] text-left text-xs space-y-3 shadow-[3px_3px_0px_#111111]">
              <div className="flex justify-between border-b border-[#111111]/10 pb-2 font-black uppercase text-[#111111]">
                <span>Fulfillment Type</span>
                <span>{confirmedOrder.fulfillmentType === 'DELIVERY' ? 'Doorstep Delivery' : 'Bakery Pickup'}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[#6B7280]">Scheduled For:</span>
                <span className="font-bold text-[#111111]">{confirmedOrder.deliveryDate} ({confirmedOrder.deliverySlot})</span>
              </div>
              {confirmedOrder.fulfillmentType === 'DELIVERY' && (
                <div className="flex justify-between font-medium">
                  <span className="text-[#6B7280]">Address:</span>
                  <span className="font-bold text-[#111111] text-right max-w-xs">{confirmedOrder.deliveryAddress}</span>
                </div>
              )}

              {/* Items */}
              <div className="pt-2 border-t border-[#111111]/10">
                <p className="font-black uppercase text-[#111111] mb-2">Order Items:</p>
                <div className="space-y-1.5 font-medium">
                  {confirmedOrder.items.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        <strong className="text-[#111111]">{i.quantity}x</strong> {i.name} ({i.selectedSize})
                        {i.cakeMessage && <span className="block text-[10px] text-[#6B7280] italic">Message: &ldquo;{i.cakeMessage}&rdquo;</span>}
                      </span>
                      <span className="font-black text-[#111111]">₹{Math.round(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-[#111111]/10 space-y-1">
                <div className="flex justify-between font-bold text-[#6B7280]">
                  <span>Subtotal</span>
                  <span>₹{Math.round(confirmedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#6B7280]">
                  <span>Delivery Charge</span>
                  <span>{confirmedOrder.deliveryFee > 0 ? `₹${Math.round(confirmedOrder.deliveryFee)}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#111111] pt-1 border-t border-[#111111]/10">
                  <span className="uppercase">Grand Total</span>
                  <span className="text-[#E4007C]">₹{Math.round(confirmedOrder.total)}</span>
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
                  className="btn-whatsapp w-full sm:w-auto text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Order via WhatsApp
                </a>
              )}
              <button
                onClick={() => window.print()}
                className="btn-secondary w-full sm:w-auto text-xs"
              >
                <Printer className="w-4 h-4" />
                Print Receipt
              </button>
              <Link href="/catalogue" className="btn-primary w-full sm:w-auto text-xs">
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
      <div className="py-20 bg-white text-center">
        <div className="container-custom max-w-md">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F6] border-2 border-[#111111] text-[#E4007C] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#111111]">Your box is empty</h1>
          <p className="text-xs text-[#6B7280] font-medium mt-2 mb-6">
            Please add celebration cakes, pastries, or artisan breads before proceeding to checkout.
          </p>
          <Link href="/catalogue" className="btn-primary">
            Browse Bakery Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="container-custom max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/catalogue"
            className="text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#E4007C] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalogue
          </Link>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#E4007C] bg-[#FFF0F6] border border-[#E4007C]/30 px-3 py-1 rounded-full">
            STEP 2 OF 2: CHECKOUT
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#111111] mb-8">
          COMPLETE YOUR ORDER
        </h1>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form: Details & Delivery */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Fulfillment Toggle */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <h2 className="text-base font-black uppercase tracking-tight text-[#111111] mb-3">
                1. Delivery or Pickup
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('DELIVERY')}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    fulfillmentType === 'DELIVERY'
                      ? 'border-[#E4007C] bg-[#FFF0F6] shadow-[2px_2px_0px_#E4007C]'
                      : 'border-[#111111] bg-[#F4F4F4]'
                  }`}
                >
                  <Truck className="w-5 h-5 text-[#E4007C]" />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-[#111111]">Doorstep Delivery</p>
                    <p className="text-[10px] text-[#6B7280] font-bold">₹60 (FREE above ₹1,000)</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('PICKUP')}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    fulfillmentType === 'PICKUP'
                      ? 'border-[#E4007C] bg-[#FFF0F6] shadow-[2px_2px_0px_#E4007C]'
                      : 'border-[#111111] bg-[#F4F4F4]'
                  }`}
                >
                  <Store className="w-5 h-5 text-[#E4007C]" />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-[#111111]">Bakery Pickup</p>
                    <p className="text-[10px] text-[#15803D] font-black uppercase">FREE Pickup</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Customer Information */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <h2 className="text-base font-black uppercase tracking-tight text-[#111111] mb-3">
                2. Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Priya Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="priya.sharma@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                />
              </div>

              {fulfillmentType === 'DELIVERY' && (
                <div className="mt-4">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                    Delivery Address &amp; Landmark (Flat, Society, Street, City, PIN) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Flat 402, Gokul Heights, 14th Road, Bandra West, Mumbai - 400050"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full text-xs font-medium p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                  />
                </div>
              )}
            </div>

            {/* 3. Date & Time Window */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <h2 className="text-base font-black uppercase tracking-tight text-[#111111] mb-3">
                3. Date &amp; Preferred Slot
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayString}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full text-xs font-bold p-3 pl-10 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                      required
                    />
                    <Calendar className="w-4 h-4 text-[#111111] absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                    Time Window
                  </label>
                  <div className="relative">
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full text-xs font-bold p-3 pl-10 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                    >
                      <option value="08:00 - 11:00 (Breakfast Hot Bakes)">8:00 AM - 11:00 AM (Breakfast Hot Bakes)</option>
                      <option value="11:00 - 14:00 (Lunch Time)">11:00 AM - 2:00 PM (Lunch Time)</option>
                      <option value="15:00 - 18:00 (Evening Chai & Pastries)">3:00 PM - 6:00 PM (Evening Chai &amp; Pastries)</option>
                      <option value="18:00 - 21:00 (Dinner / Celebration)">6:00 PM - 9:00 PM (Dinner / Celebration)</option>
                    </select>
                    <Clock className="w-4 h-4 text-[#111111] absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                  Order Note / Free Gift Message Card
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ring doorbell twice, or write 'Happy 25th Birthday Rohan!' on note card"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs font-medium p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                />
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
              <h2 className="text-base font-black uppercase tracking-tight text-[#111111] mb-3">
                4. Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#E4007C] bg-[#FFF0F6] shadow-[2px_2px_0px_#E4007C]'
                      : 'border-[#111111] bg-[#F4F4F4]'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#E4007C]" />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-[#111111]">Cash / Pay on Delivery</p>
                    <p className="text-[10px] text-[#6B7280] font-bold">Cash or UPI at doorstep</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-[#E4007C] bg-[#FFF0F6] shadow-[2px_2px_0px_#E4007C]'
                      : 'border-[#111111] bg-[#F4F4F4]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#E4007C]" />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-[#111111]">UPI / Instant QR Pay</p>
                    <p className="text-[10px] text-[#15803D] font-black uppercase">GPay, PhonePe, Paytm</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Box */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[6px_6px_0px_#111111] sticky top-28 space-y-4">
              <h2 className="text-base font-black uppercase tracking-tight text-[#111111] pb-3 border-b-2 border-[#111111]">
                Order Summary ({items.length} items)
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF0F6] border border-[#111111]/20 overflow-hidden shrink-0 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs uppercase text-[#111111] truncate">{item.name}</p>
                      <p className="text-[10px] font-black text-[#E4007C] uppercase">{item.selectedSize}</p>
                      {item.cakeMessage && (
                        <p className="text-[10px] text-[#6B7280] italic truncate">
                          &ldquo;{item.cakeMessage}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#111111]">
                        ₹{Math.round(item.price * item.quantity)}
                      </p>
                      <p className="text-[10px] text-[#6B7280] font-bold">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t-2 border-[#111111]/10 space-y-2 text-xs">
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
                <div className="flex justify-between text-lg font-black text-[#111111] pt-2 border-t-2 border-[#111111]">
                  <span className="uppercase">TOTAL AMOUNT</span>
                  <span className="text-[#E4007C]">₹{Math.round(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? 'Transmitting to Kitchen...' : `Confirm & Place Order (₹${Math.round(total)})`}
              </button>

              <p className="text-[10px] text-center text-[#6B7280] font-semibold">
                🔒 Orders directly transmit to kitchen staff. You will receive an instant WhatsApp confirmation link!
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
