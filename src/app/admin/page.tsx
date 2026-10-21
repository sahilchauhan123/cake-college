'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ChefHat,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Download,
  Cake,
  RefreshCw,
  Phone,
  MessageCircle,
  AlertCircle,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order, CustomCakeRequest, Product } from '../../types/supabase';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'custom-cakes' | 'inventory' | 'analytics'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [cakeRequests, setCakeRequests] = useState<CustomCakeRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [orderRes, cakeRes, prodRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('custom_cake_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
      ]);

      if (orderRes.data) setOrders(orderRes.data);
      if (cakeRes.data) setCakeRequests(cakeRes.data);
      if (prodRes.data) setProducts(prodRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime orders updates
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update order status in Supabase
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await (supabase.from('orders') as any).update({ order_status: newStatus }).eq('id', orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  // Toggle product stock availability in Supabase
  const handleToggleProductStock = async (productId: string, currentStatus: boolean) => {
    try {
      await (supabase.from('products') as any).update({ is_available: !currentStatus }).eq('id', productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: !currentStatus } : p))
      );
    } catch (err) {
      console.error('Error toggling product stock:', err);
    }
  };

  // CSV Export for Orders
  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      alert('No orders to export.');
      return;
    }

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Fulfillment',
      'Delivery Date',
      'Slot',
      'Grand Total ($)',
      'Payment Status',
      'Order Status',
    ];

    const rows = orders.map((o) => [
      o.order_number,
      o.created_at ? new Date(o.created_at).toLocaleDateString() : '',
      `"${o.customer_name}"`,
      o.customer_phone,
      o.fulfillment_type,
      o.delivery_date,
      `"${o.delivery_slot}"`,
      o.grand_total,
      o.payment_status,
      o.order_status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bakery-orders-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for Customers CRM
  const exportCustomersCSV = () => {
    const customerMap = new Map<string, { name: string; phone: string; email?: string; totalSpent: number; ordersCount: number }>();

    orders.forEach((o) => {
      const phone = o.customer_phone;
      const existing = customerMap.get(phone) || {
        name: o.customer_name,
        phone,
        email: o.customer_email || undefined,
        totalSpent: 0,
        ordersCount: 0,
      };
      existing.totalSpent += Number(o.grand_total);
      existing.ordersCount += 1;
      customerMap.set(phone, existing);
    });

    const headers = ['Customer Name', 'Phone', 'Email', 'Total Orders', 'Total Lifetime Spend ($)'];
    const rows = Array.from(customerMap.values()).map((c) => [
      `"${c.name}"`,
      c.phone,
      c.email || '',
      c.ordersCount,
      c.totalSpent.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bakery-customers-crm-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics Calculation
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'PENDING').length;
  const bakingOrdersCount = orders.filter((o) => o.order_status === 'BAKING').length;
  const readyOrdersCount = orders.filter((o) => o.order_status === 'READY').length;

  return (
    <div className="py-8 bg-[#FAF4EB] min-h-screen">
      <div className="container-custom">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-[#E8DDD2] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B45309]">
              <ChefHat className="w-4 h-4 text-[#8B4513]" />
              Bakery Operations Hub
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-[#231815] mt-1">
              Kitchen & Order Management
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportOrdersCSV}
              className="btn-primary !py-2 !px-3.5 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Orders (CSV)
            </button>
            <button
              onClick={exportCustomersCSV}
              className="btn-gold !py-2 !px-3.5 text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CRM Data
            </button>
          </div>
        </div>

        {/* Top KPIs Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#E8DDD2] shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#7E6C65] uppercase">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-[#15803D]" />
            </div>
            <p className="font-serif text-2xl font-extrabold text-[#231815] mt-2">
              ${totalRevenue.toFixed(2)}
            </p>
            <span className="text-[11px] text-[#15803D] font-semibold">Across all channels</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DDD2] shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#7E6C65] uppercase">
              <span>Kitchen Pending</span>
              <AlertCircle className="w-4 h-4 text-[#B45309]" />
            </div>
            <p className="font-serif text-2xl font-extrabold text-[#B45309] mt-2">
              {pendingOrdersCount} Orders
            </p>
            <span className="text-[11px] text-[#7E6C65]">Awaiting preparation</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DDD2] shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#7E6C65] uppercase">
              <span>In The Oven</span>
              <ChefHat className="w-4 h-4 text-[#8B4513]" />
            </div>
            <p className="font-serif text-2xl font-extrabold text-[#8B4513] mt-2">
              {bakingOrdersCount} Orders
            </p>
            <span className="text-[11px] text-[#7E6C65]">Currently baking</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DDD2] shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-[#7E6C65] uppercase">
              <span>Custom Cake Inquiries</span>
              <Cake className="w-4 h-4 text-[#D97706]" />
            </div>
            <p className="font-serif text-2xl font-extrabold text-[#231815] mt-2">
              {cakeRequests.length}
            </p>
            <span className="text-[11px] text-[#D97706] font-semibold">Quote requests</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8DDD2] mb-6 gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-[#8B4513] text-[#8B4513]'
                : 'border-transparent text-[#7E6C65] hover:text-[#231815]'
            }`}
          >
            <Package className="w-4 h-4" />
            Live Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('custom-cakes')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'custom-cakes'
                ? 'border-[#8B4513] text-[#8B4513]'
                : 'border-transparent text-[#7E6C65] hover:text-[#231815]'
            }`}
          >
            <Cake className="w-4 h-4" />
            Custom Cake Inquiries ({cakeRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-[#8B4513] text-[#8B4513]'
                : 'border-transparent text-[#7E6C65] hover:text-[#231815]'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Menu Stock ({products.length})
          </button>
        </div>

        {/* TAB 1: LIVE ORDERS KANBAN / TABLE */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-[#E8DDD2]">
                <Package className="w-12 h-12 text-[#A8988D] mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold">No orders placed yet</h3>
                <p className="text-xs text-[#7E6C65] mt-1">
                  Placed customer orders will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map((order) => {
                  const statusColors: Record<string, string> = {
                    PENDING: 'bg-[#FEF3C7] text-[#B45309]',
                    BAKING: 'bg-[#FFEDD5] text-[#C2410C]',
                    READY: 'bg-[#DCFCE7] text-[#15803D]',
                    DELIVERED: 'bg-gray-100 text-gray-600',
                  };

                  return (
                    <div
                      key={order.id}
                      className="bg-white p-5 rounded-2xl border border-[#E8DDD2] shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F2EBE3]">
                          <div>
                            <span className="font-serif font-extrabold text-[#231815]">
                              #{order.order_number}
                            </span>
                            <span className="text-[10px] text-[#7E6C65] block">
                              {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}
                            </span>
                          </div>

                          <span
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              statusColors[order.order_status || 'PENDING']
                            }`}
                          >
                            {order.order_status || 'PENDING'}
                          </span>
                        </div>

                        {/* Customer Info */}
                        <div className="py-3 text-xs space-y-1">
                          <p className="font-bold text-[#231815]">{order.customer_name}</p>
                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#15803D] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            {order.customer_phone}
                          </a>
                          <p className="text-[#7E6C65]">
                            {order.fulfillment_type === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}: {order.delivery_date} ({order.delivery_slot})
                          </p>
                          {order.delivery_address && (
                            <p className="text-[11px] text-[#A8988D] italic truncate">
                              Addr: {order.delivery_address}
                            </p>
                          )}
                        </div>

                        {/* Order Notes */}
                        {order.order_notes && (
                          <div className="p-2 rounded-xl bg-[#FAF4EB] text-[11px] text-[#7E6C65] italic mb-3">
                            Note: {order.order_notes}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#F2EBE3] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#A8988D] uppercase font-bold block">Total</span>
                          <span className="font-serif font-bold text-base text-[#231815]">
                            ${Number(order.grand_total).toFixed(2)}
                          </span>
                        </div>

                        {/* Status Transition buttons */}
                        <div className="flex gap-1.5">
                          {order.order_status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'BAKING')}
                              className="px-3 py-1.5 rounded-lg bg-[#8B4513] hover:bg-[#72360E] text-white text-xs font-bold"
                            >
                              Start Baking
                            </button>
                          )}
                          {order.order_status === 'BAKING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                              className="px-3 py-1.5 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold"
                            >
                              Mark Ready
                            </button>
                          )}
                          {order.order_status === 'READY' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                              className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOM CAKE INQUIRIES */}
        {activeTab === 'custom-cakes' && (
          <div className="space-y-4">
            {cakeRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-[#E8DDD2]">
                <Cake className="w-12 h-12 text-[#A8988D] mx-auto mb-3" />
                <h3 className="font-serif text-lg font-bold">No custom cake requests</h3>
                <p className="text-xs text-[#7E6C65] mt-1">
                  Requests submitted through the Custom Cake Studio will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cakeRequests.map((cake) => {
                  const refImage = cake.reference_image_urls?.[0];
                  const waReplyText = `Hi ${cake.customer_name}! Thank you for your custom cake inquiry #${cake.request_number} for ${cake.event_date}. We can create this ${cake.cake_type} for an estimated quotation of $${cake.quoted_price || 60}. Would you like us to proceed? 🎂`;

                  return (
                    <div
                      key={cake.id}
                      className="bg-white p-5 rounded-2xl border border-[#E8DDD2] shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F2EBE3]">
                          <div>
                            <span className="font-serif font-extrabold text-[#231815]">
                              #{cake.request_number}
                            </span>
                            <span className="text-[10px] text-[#7E6C65] block">
                              For: {cake.event_date} ({cake.delivery_slot})
                            </span>
                          </div>

                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#B45309]">
                            {cake.status || 'PENDING'}
                          </span>
                        </div>

                        <div className="flex gap-4 py-3">
                          {refImage && (
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF4EB] shrink-0 relative border border-[#E8DDD2]">
                              <Image
                                src={refImage}
                                alt="Reference Design"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div className="text-xs space-y-1">
                            <p className="font-bold text-[#231815]">{cake.customer_name} ({cake.customer_phone})</p>
                            <p className="text-[#8B4513] font-semibold">{cake.cake_type}</p>
                            <p className="text-[#7E6C65]">{cake.sponge_flavor} + {cake.filling_flavor}</p>
                            <p className="text-[#7E6C65]">
                              {cake.tier_count} Tier(s) • Approx. {cake.estimated_weight_kg} kg
                            </p>
                            {cake.message_on_cake && (
                              <p className="text-[11px] text-[#B45309] font-medium italic">
                                &ldquo;{cake.message_on_cake}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        {cake.special_instructions && (
                          <div className="p-2.5 rounded-xl bg-[#FAF4EB] text-[11px] text-[#7E6C65] mb-3">
                            <strong>Note:</strong> {cake.special_instructions}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#F2EBE3] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#A8988D] uppercase font-bold block">Quoted</span>
                          <span className="font-serif font-bold text-lg text-[#231815]">
                            ${cake.quoted_price || 50}
                          </span>
                        </div>

                        <a
                          href={`https://wa.me/${cake.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(waReplyText)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-whatsapp !py-2 !px-3 text-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Reply on WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: INVENTORY STOCK TOGGLES */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-[#E8DDD2] p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-[#231815] mb-4">
              Menu Availability Management
            </h2>
            <p className="text-xs text-[#7E6C65] mb-6">
              Toggle items in and out of stock instantly. Changes update immediately on customer screens.
            </p>

            <div className="divide-y divide-[#F2EBE3]">
              {products.map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF4EB] overflow-hidden relative shrink-0">
                      {prod.images?.[0] && (
                        <Image
                          src={prod.images[0]}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#231815]">{prod.name}</p>
                      <span className="text-xs font-semibold text-[#8B4513]">
                        ${Number(prod.base_price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleProductStock(prod.id, prod.is_available ?? true)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      prod.is_available
                        ? 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {prod.is_available ? '● Available' : '○ Sold Out'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
