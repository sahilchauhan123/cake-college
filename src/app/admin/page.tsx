'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChefHat,
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
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Sparkles,
  IndianRupee,
  LayoutDashboard,
  Users,
  TrendingUp,
  CreditCard,
  Bell,
  ArrowUpRight,
  Truck,
  Store,
  ExternalLink,
  Flame,
  Check,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order, CustomCakeRequest, Product, Category } from '../../types/supabase';

// High-res presets for quick Indian bakery item creation
const IMAGE_PRESETS = [
  { label: 'Rasmalai Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dutch Truffle', url: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kesar Pista', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bombay Mawa Cake', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Paneer Tikka Puff', url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80' },
  { label: 'Artisan Sourdough', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
];

interface SizeOption {
  label: string;
  extra_price: number;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'custom-cakes' | 'inventory' | 'crm'>('dashboard');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');

  const [orders, setOrders] = useState<Order[]>([]);
  const [cakeRequests, setCakeRequests] = useState<CustomCakeRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Menu inventory search & filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');

  // Product CRUD Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formBasePrice, setFormBasePrice] = useState<number | ''>(499);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsEggless, setFormIsEggless] = useState(true);
  const [formIsVegan, setFormIsVegan] = useState(false);
  const [formIsGlutenFree, setFormIsGlutenFree] = useState(false);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formSizes, setFormSizes] = useState<SizeOption[]>([
    { label: '0.5 kg (Serves 4-6)', extra_price: 0 },
    { label: '1.0 kg (Serves 8-12)', extra_price: 450 },
  ]);

  // Load all data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [orderRes, cakeRes, prodRes, catRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('custom_cake_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order'),
      ]);

      if (orderRes.data) setOrders(orderRes.data);
      if (cakeRes.data) setCakeRequests(cakeRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) {
        const catList = catRes.data as Category[];
        setCategories(catList);
        if (catList.length > 0 && !formCategoryId) {
          setFormCategoryId(catList[0].id);
        }
      }
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

  // OPEN CREATE MODAL
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || '');
    setFormBasePrice(499);
    setFormDescription('');
    setFormImageUrl(IMAGE_PRESETS[0].url);
    setFormIsEggless(true);
    setFormIsVegan(false);
    setFormIsGlutenFree(false);
    setFormIsAvailable(true);
    setFormIsFeatured(false);
    setFormSizes([
      { label: '0.5 kg (Serves 4-6)', extra_price: 0 },
      { label: '1.0 kg (Serves 8-12)', extra_price: 450 },
    ]);
    setIsItemModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategoryId(prod.category_id || categories[0]?.id || '');
    setFormBasePrice(prod.base_price);
    setFormDescription(prod.description || '');
    setFormImageUrl(prod.images?.[0] || IMAGE_PRESETS[0].url);
    setFormIsEggless(prod.is_eggless ?? true);
    setFormIsVegan(prod.is_vegan ?? false);
    setFormIsGlutenFree(prod.is_gluten_free ?? false);
    setFormIsAvailable(prod.is_available ?? true);
    setFormIsFeatured(prod.is_featured ?? false);

    let parsedSizes: SizeOption[] = [];
    if (Array.isArray(prod.available_sizes)) {
      parsedSizes = prod.available_sizes as unknown as SizeOption[];
    }
    setFormSizes(parsedSizes.length > 0 ? parsedSizes : [{ label: 'Standard', extra_price: 0 }]);
    setIsItemModalOpen(true);
  };

  // SAVE PRODUCT (CREATE OR UPDATE)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formBasePrice === '') {
      alert('Please fill in the item name and base price.');
      return;
    }

    setIsSavingProduct(true);
    try {
      const slug =
        editingProduct?.slug ||
        formName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') +
          '-' +
          Date.now().toString().slice(-4);

      const productPayload = {
        name: formName.trim(),
        slug,
        category_id: formCategoryId || null,
        base_price: Number(formBasePrice),
        description: formDescription.trim() || null,
        images: formImageUrl.trim() ? [formImageUrl.trim()] : [IMAGE_PRESETS[0].url],
        is_eggless: formIsEggless,
        is_vegan: formIsVegan,
        is_gluten_free: formIsGlutenFree,
        is_available: formIsAvailable,
        is_featured: formIsFeatured,
        available_sizes: formSizes as any,
      };

      if (editingProduct) {
        const { data, error } = await (supabase.from('products') as any)
          .update(productPayload)
          .eq('id', editingProduct.id)
          .select()
          .single();

        if (error) throw error;
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data : p)));
      } else {
        const { data, error } = await (supabase.from('products') as any)
          .insert(productPayload)
          .select()
          .single();

        if (error) throw error;
        setProducts((prev) => [data, ...prev]);
      }

      setIsItemModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('Could not save product: ' + (err.message || 'Please check input fields'));
    } finally {
      setIsSavingProduct(false);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${product.name}" from the menu?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert('Could not delete product: ' + (err.message || 'Error occurred'));
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
      'Grand Total (₹)',
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

    const headers = ['Customer Name', 'Phone', 'Email', 'Total Orders', 'Total Lifetime Spend (₹)'];
    const rows = Array.from(customerMap.values()).map((c) => [
      `"${c.name}"`,
      c.phone,
      c.email || '',
      c.ordersCount,
      Math.round(c.totalSpent),
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

  // Filtered Products for Inventory Tab
  const filteredInventoryProducts = useMemo(() => {
    return products.filter((p) => {
      if (inventoryCategoryFilter !== 'all' && p.category_id !== inventoryCategoryFilter) {
        return false;
      }
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, inventoryCategoryFilter, inventorySearch]);

  // Metrics Calculation
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.order_status === 'PENDING').length;
  const bakingOrdersCount = orders.filter((o) => o.order_status === 'BAKING').length;
  const readyOrdersCount = orders.filter((o) => o.order_status === 'READY').length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row text-[#111111]">
      {/* 1. LEFT SIDEBAR (Modeled on CoinDesk Sidebar Structure, styled in Milk Bar Theme) */}
      <aside className="w-full md:w-64 bg-white border-r-2 border-[#111111] flex flex-col justify-between shrink-0">
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b-2 border-[#111111] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E4007C] flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_#111111]">
              SD
            </div>
            <div>
              <span className="font-black text-lg tracking-tight uppercase text-[#111111] block leading-none">
                Sweet Delight
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#E4007C]">
                Bakery Ops Hub
              </span>
            </div>
          </div>

          {/* Sidebar Navigation Menu */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#E4007C] text-white shadow-[3px_3px_0px_#111111]'
                  : 'text-[#111111] hover:bg-[#FFF0F6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              <span className="text-[10px] opacity-75">●</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#E4007C] text-white shadow-[3px_3px_0px_#111111]'
                  : 'text-[#111111] hover:bg-[#FFF0F6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Live Orders</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-[#FFE600] text-[#111111]' : 'bg-[#111111] text-white'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('custom-cakes')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'custom-cakes'
                  ? 'bg-[#E4007C] text-white shadow-[3px_3px_0px_#111111]'
                  : 'text-[#111111] hover:bg-[#FFF0F6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cake className="w-4 h-4" />
                <span>Custom Cake Lab</span>
              </div>
              {cakeRequests.length > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === 'custom-cakes' ? 'bg-[#FFE600] text-[#111111]' : 'bg-[#E4007C] text-white'}`}>
                  {cakeRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'inventory'
                  ? 'bg-[#E4007C] text-white shadow-[3px_3px_0px_#111111]'
                  : 'text-[#111111] hover:bg-[#FFF0F6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4" />
                <span>Menu Inventory</span>
              </div>
              <span className="text-[10px] font-bold text-[#6B7280]">
                {products.length} bakes
              </span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === 'crm'
                  ? 'bg-[#E4007C] text-white shadow-[3px_3px_0px_#111111]'
                  : 'text-[#111111] hover:bg-[#FFF0F6]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Customers CRM</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: Kitchen Status & Storefront Link */}
        <div className="p-4 border-t-2 border-[#111111] space-y-3 bg-[#FAFAFA]">
          <div className="p-3 rounded-xl bg-white border border-[#111111]/20 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5A3] animate-pulse" />
            <div>
              <p className="text-[10px] font-black uppercase text-[#111111]">Kitchen Status</p>
              <p className="text-[10px] text-[#6B7280] font-semibold">5:00 AM Bakes Active</p>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#E4007C] transition-colors py-1"
          >
            <span>Visit Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="bg-white border-b-2 border-[#111111] p-4 md:px-8 md:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111111] flex items-center gap-2">
              <span>Kitchen Operations</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E4007C] bg-[#FFF0F6] border border-[#E4007C] px-2.5 py-0.5 rounded-full">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-[#6B7280] font-semibold mt-0.5">
              Live orders, bespoke cake requests, revenue metrics and bakery stock.
            </p>
          </div>

          {/* Action Buttons: Refresh, CSV Exports & Profile */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-full bg-[#F4F4F4] hover:bg-[#FFE5F0] text-[#111111] border border-[#111111] transition-all"
              title="Refresh Real-time Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={exportOrdersCSV}
              className="btn-secondary !py-2 !px-3.5 text-xs font-black flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Orders</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="btn-primary !py-2 !px-4 text-xs font-black flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Bake</span>
            </button>

            {/* Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#111111]/20">
              <div className="w-9 h-9 rounded-full bg-[#FFE600] border-2 border-[#111111] flex items-center justify-center font-black text-xs text-[#111111] shadow-xs">
                CHEF
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-4 md:p-8 space-y-8 flex-1">
          {/* Quick Pill Selector Bar (Crypto Coins Bar style from image) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7280] mr-1 shrink-0">
              QUICK FILTERS:
            </span>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${
                activeTab === 'dashboard'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
              }`}
            >
              ★ Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${
                activeTab === 'orders'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
              }`}
            >
              📦 Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('custom-cakes')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${
                activeTab === 'custom-cakes'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
              }`}
            >
              🎂 Cake Inquiries ({cakeRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${
                activeTab === 'inventory'
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
              }`}
            >
              🥐 Menu Items ({products.length})
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 border-dashed border-[#E4007C] text-[#E4007C] hover:bg-[#E4007C] hover:text-white flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          {/* MAIN DASHBOARD VIEW (Matching CoinDesk Layout from Image) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* TOP ROW: 3 CARDS (Bitcoin-style card, Ethereum-style card, Citibank Credit Card on right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Card 1: Revenue Card (like Bitcoin card with orange/yellow wave sparkline) */}
                <div className="md:col-span-4 bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[5px_5px_0px_#111111] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-[#111111] flex items-center justify-center font-black text-sm text-[#111111]">
                          <IndianRupee className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm uppercase text-[#111111]">Gross Sales</h3>
                          <span className="text-[10px] text-[#6B7280] font-bold">Today + Lifetime</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#111111]">
                          ₹{Math.round(totalRevenue).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-black text-[#059669] block">
                          ▲ +18.4%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Wave Sparkline Graph (like the yellow wave in screenshot) */}
                  <div className="pt-2">
                    <svg viewBox="0 0 200 60" className="w-full h-14 overflow-visible">
                      <path
                        d="M 0 35 Q 25 15, 50 38 T 100 48 T 150 20 T 200 28"
                        fill="none"
                        stroke="#FFE600"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="48" r="4.5" fill="#111111" stroke="#FFE600" strokeWidth="2" />
                    </svg>
                    <div className="flex justify-between text-[9px] font-black text-[#6B7280] uppercase mt-1">
                      <span>Mon</span>
                      <span className="text-[#111111]">Peak: ₹{Math.round(totalRevenue * 0.4).toLocaleString('en-IN')}</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Kitchen Oven Velocity (like Ethereum card with blue/pink wave sparkline) */}
                <div className="md:col-span-4 bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[5px_5px_0px_#111111] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0F6] border-2 border-[#E4007C] flex items-center justify-center font-black text-sm text-[#E4007C]">
                          <Flame className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm uppercase text-[#111111]">Kitchen Oven Flow</h3>
                          <span className="text-[10px] text-[#6B7280] font-bold">Active Baking Units</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-[#E4007C]">
                          {bakingOrdersCount} In Oven
                        </span>
                        <span className="text-[10px] font-black text-[#6B7280] block">
                          {pendingOrdersCount} queued
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Wave Sparkline Graph (in Milk Bar Hot Pink) */}
                  <div className="pt-2">
                    <svg viewBox="0 0 200 60" className="w-full h-14 overflow-visible">
                      <path
                        d="M 0 40 Q 25 45, 50 25 T 100 18 T 150 35 T 200 22"
                        fill="none"
                        stroke="#E4007C"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      <circle cx="100" cy="18" r="4.5" fill="#111111" stroke="#E4007C" strokeWidth="2" />
                    </svg>
                    <div className="flex justify-between text-[9px] font-black text-[#6B7280] uppercase mt-1">
                      <span>Morning 8 AM</span>
                      <span className="text-[#E4007C] font-black">+14 bakes/hr</span>
                      <span>Evening 4 PM</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Milk Bar Bakery Pass / Debit Card (like Citibank card in image) */}
                <div className="md:col-span-4 bg-gradient-to-tr from-[#E4007C] via-[#FF007A] to-[#FFE600] p-6 rounded-2xl border-2 border-[#111111] shadow-[5px_5px_0px_#111111] text-white flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/90 block">
                        BAKERY OPERATIONS PASS
                      </span>
                      <span className="text-base font-black uppercase tracking-wider text-white">
                        Sweet Delight Patisserie
                      </span>
                    </div>
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>

                  <div className="my-5">
                    <span className="text-xl sm:text-2xl font-mono font-black tracking-widest drop-shadow-sm block">
                      BKRY 4000 5000 2026
                    </span>
                  </div>

                  <div className="flex items-end justify-between text-xs font-bold pt-2 border-t border-white/20">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/80 block">HEAD BAKER</span>
                      <span className="font-black uppercase">CHEF MAYA • MUMBAI</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-white/80 block">DAILY TARGET</span>
                      <span className="font-black text-[#FFE600]">₹25,000 (ON TRACK)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: SPLIT INTO TWO SECTIONS (Recent Operations on left, Statistics chart on right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Section: Recent Operations (like Recent Operations list in screenshot) */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]/10">
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight text-[#111111]">
                        Recent Orders Flow
                      </h2>
                      <p className="text-[10px] text-[#6B7280] font-bold">
                        Latest customer tickets &amp; kitchen actions
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-black uppercase text-[#E4007C] hover:underline"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#6B7280] font-bold">
                      No customer orders placed yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => {
                        const statusColor =
                          order.order_status === 'BAKING'
                            ? 'bg-[#FFF0F6] text-[#E4007C] border-[#E4007C]'
                            : order.order_status === 'READY'
                            ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]'
                            : order.order_status === 'DELIVERED'
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : 'bg-[#FFE600] text-[#111111] border-[#111111]';

                        return (
                          <div
                            key={order.id}
                            className="p-3.5 rounded-xl border-2 border-[#111111] bg-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_#111111]"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[#F4F4F4] border border-[#111111] flex items-center justify-center shrink-0 text-[#111111]">
                                {order.fulfillment_type === 'DELIVERY' ? (
                                  <Truck className="w-4 h-4 text-[#E4007C]" />
                                ) : (
                                  <Store className="w-4 h-4 text-[#15803D]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-xs uppercase text-[#111111] truncate">
                                  {order.customer_name} (#{order.order_number})
                                </p>
                                <p className="text-[10px] text-[#6B7280] font-medium">
                                  {order.delivery_date} • {order.delivery_slot.split(' ')[0]}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-black text-sm text-[#111111] block">
                                ₹{Math.round(Number(order.grand_total))}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border inline-block ${statusColor}`}
                              >
                                {order.order_status || 'PENDING'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Section: Statistics Wave Chart (like Statistics section in screenshot) */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]/10">
                    <div>
                      <h2 className="text-lg font-black uppercase tracking-tight text-[#111111]">
                        Bakery Statistics
                      </h2>
                      <p className="text-[10px] text-[#6B7280] font-bold">
                        Weekly revenue &amp; volume trend
                      </p>
                    </div>

                    {/* Blue pill toggle (like Income/Expence in screenshot) */}
                    <div className="bg-[#111111] p-1 rounded-full flex items-center text-xs font-black uppercase">
                      <button
                        onClick={() => setChartMetric('revenue')}
                        className={`px-3 py-1 rounded-full transition-all ${
                          chartMetric === 'revenue'
                            ? 'bg-[#E4007C] text-white shadow-xs'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Revenue (₹)
                      </button>
                      <button
                        onClick={() => setChartMetric('orders')}
                        className={`px-3 py-1 rounded-full transition-all ${
                          chartMetric === 'orders'
                            ? 'bg-[#E4007C] text-white shadow-xs'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        Orders
                      </button>
                    </div>
                  </div>

                  {/* Wave Chart Graphic with Month Labels */}
                  <div className="relative pt-4">
                    {/* Floating Peak Label */}
                    <div className="text-center mb-1">
                      <span className="inline-block bg-[#111111] text-[#FFE600] border border-[#111111] px-3 py-1 rounded-full text-xs font-black shadow-[2px_2px_0px_#E4007C]">
                        {chartMetric === 'revenue' ? `Peak Day: ₹${Math.round(totalRevenue || 12450)}` : 'Peak Day: 28 Orders'}
                      </span>
                    </div>

                    {/* Smooth Wave SVG */}
                    <svg viewBox="0 0 500 180" className="w-full h-44 overflow-visible">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E4007C" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#E4007C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Horizontal Guide Lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="140" x2="500" y2="140" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Area Fill */}
                      <path
                        d="M 0 160 C 50 140, 80 150, 120 100 C 160 50, 200 120, 260 70 C 310 20, 360 40, 410 90 C 450 130, 480 120, 500 130 L 500 180 L 0 180 Z"
                        fill="url(#chartGradient)"
                      />
                      {/* Curve Line */}
                      <path
                        d="M 0 160 C 50 140, 80 150, 120 100 C 160 50, 200 120, 260 70 C 310 20, 360 40, 410 90 C 450 130, 480 120, 500 130"
                        fill="none"
                        stroke="#111111"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Peak Marker Dot */}
                      <circle cx="310" cy="20" r="6" fill="#FFE600" stroke="#111111" strokeWidth="3" />
                    </svg>

                    {/* Month X-Axis Labels (Jan - Jul like screenshot) */}
                    <div className="flex justify-between text-[11px] font-black uppercase text-[#6B7280] pt-2 border-t border-[#111111]/10">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span className="text-[#E4007C]">Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                      <span>Jul</span>
                    </div>
                  </div>

                  {/* Highlights Summary Box */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[#FFF0F6] border border-[#E4007C]/30 text-center">
                      <span className="text-[10px] text-[#6B7280] font-black uppercase block">Average Order</span>
                      <span className="text-base font-black text-[#E4007C]">₹720</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FFFDE0] border border-[#111111]/20 text-center">
                      <span className="text-[10px] text-[#6B7280] font-black uppercase block">Bestseller Share</span>
                      <span className="text-base font-black text-[#111111]">64% Cakes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIVE ORDERS VIEW */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase text-[#111111]">All Live Orders ({orders.length})</h2>
                  <p className="text-xs text-[#6B7280] font-medium">Manage preparation status, WhatsApp tracking and deliveries.</p>
                </div>
                <button
                  onClick={exportOrdersCSV}
                  className="btn-primary !py-2 !px-4 text-xs font-black flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Orders CSV</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
                  <Package className="w-12 h-12 text-[#E4007C] mx-auto mb-3" />
                  <h3 className="text-lg font-black uppercase text-[#111111]">No orders placed yet</h3>
                  <p className="text-xs text-[#6B7280] font-medium mt-1">
                    Placed customer orders will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-[#FFE600] text-[#111111] border border-[#111111]',
                      BAKING: 'bg-[#FFF0F6] text-[#E4007C] border border-[#E4007C]',
                      READY: 'bg-[#DCFCE7] text-[#15803D] border border-[#15803D]',
                      DELIVERED: 'bg-gray-100 text-gray-700 border border-gray-300',
                    };

                    return (
                      <div
                        key={order.id}
                        className="bg-white p-5 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]/10">
                            <div>
                              <span className="font-black text-sm uppercase text-[#111111]">
                                #{order.order_number}
                              </span>
                              <span className="text-[10px] text-[#6B7280] font-bold block">
                                {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                statusColors[order.order_status || 'PENDING']
                              }`}
                            >
                              {order.order_status || 'PENDING'}
                            </span>
                          </div>

                          {/* Customer Info */}
                          <div className="py-3 text-xs space-y-1 font-medium">
                            <p className="font-black uppercase text-[#111111]">{order.customer_name}</p>
                            <a
                              href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#059669] hover:underline flex items-center gap-1 font-bold"
                            >
                              <Phone className="w-3 h-3" />
                              {order.customer_phone}
                            </a>
                            <p className="text-[#6B7280]">
                              {order.fulfillment_type === 'DELIVERY' ? '🚚 Delivery' : '🏪 Pickup'}: {order.delivery_date} ({order.delivery_slot})
                            </p>
                            {order.delivery_address && (
                              <p className="text-[11px] text-[#6B7280] italic truncate">
                                Addr: {order.delivery_address}
                              </p>
                            )}
                          </div>

                          {/* Order Notes */}
                          {order.order_notes && (
                            <div className="p-2.5 rounded-xl bg-[#FFF0F6] text-[11px] text-[#111111] italic mb-3 border border-[#E4007C]/20">
                              Note: {order.order_notes}
                            </div>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-3 border-t-2 border-[#111111]/10 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-[#6B7280] uppercase font-black block">Total</span>
                            <span className="font-black text-base text-[#E4007C]">
                              ₹{Math.round(Number(order.grand_total)).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Status Transition buttons */}
                          <div className="flex gap-1.5">
                            {order.order_status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'BAKING')}
                                className="px-3 py-1.5 rounded-full bg-[#E4007C] hover:bg-[#111111] text-white text-xs font-black uppercase tracking-wider transition-all"
                              >
                                Start Baking
                              </button>
                            )}
                            {order.order_status === 'BAKING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                                className="px-3 py-1.5 rounded-full bg-[#00E5A3] hover:bg-[#111111] text-[#111111] hover:text-white border border-[#111111] text-xs font-black uppercase tracking-wider transition-all"
                              >
                                Mark Ready
                              </button>
                            )}
                            {order.order_status === 'READY' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                className="px-3 py-1.5 rounded-full bg-[#111111] hover:bg-[#E4007C] text-white text-xs font-black uppercase tracking-wider transition-all"
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

          {/* TAB: CUSTOM CAKE INQUIRIES VIEW */}
          {activeTab === 'custom-cakes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase text-[#111111]">Custom Cake Lab Inquiries ({cakeRequests.length})</h2>
                  <p className="text-xs text-[#6B7280] font-medium">Bespoke cake requests submitted with photo references and inscriptions.</p>
                </div>
              </div>

              {cakeRequests.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border-2 border-[#111111] shadow-[4px_4px_0px_#111111]">
                  <Cake className="w-12 h-12 text-[#E4007C] mx-auto mb-3" />
                  <h3 className="text-lg font-black uppercase text-[#111111]">No custom cake requests</h3>
                  <p className="text-xs text-[#6B7280] font-medium mt-1">
                    Requests submitted through the Custom Cake Studio will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cakeRequests.map((cake) => {
                    const refImage = cake.reference_image_urls?.[0];
                    const waReplyText = `Hi ${cake.customer_name}! Thank you for your custom cake inquiry #${cake.request_number} for ${cake.event_date}. We can create this ${cake.cake_type} for an estimated quotation of ₹${cake.quoted_price || 1200}. Would you like us to proceed? 🎂`;

                    return (
                      <div
                        key={cake.id}
                        className="bg-white p-5 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]/10">
                            <div>
                              <span className="font-black text-sm uppercase text-[#111111]">
                                #{cake.request_number}
                              </span>
                              <span className="text-[10px] text-[#6B7280] font-bold block">
                                For: {cake.event_date} ({cake.delivery_slot})
                              </span>
                            </div>

                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111]">
                              {cake.status || 'PENDING'}
                            </span>
                          </div>

                          <div className="flex gap-4 py-3">
                            {refImage && (
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FFF0F6] shrink-0 relative border-2 border-[#111111]">
                                <Image
                                  src={refImage}
                                  alt="Reference Design"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}

                            <div className="text-xs space-y-1 font-medium">
                              <p className="font-black uppercase text-[#111111]">{cake.customer_name} ({cake.customer_phone})</p>
                              <p className="text-[#E4007C] font-black uppercase">{cake.cake_type}</p>
                              <p className="text-[#6B7280]">{cake.sponge_flavor} + {cake.filling_flavor}</p>
                              <p className="text-[#6B7280] font-bold">
                                {cake.tier_count} Tier(s) • Approx. {cake.estimated_weight_kg} kg
                              </p>
                              {cake.message_on_cake && (
                                <p className="text-[11px] text-[#111111] bg-[#FFE600] border border-[#111111] px-2 py-0.5 rounded-full inline-block font-black mt-1">
                                  &ldquo;{cake.message_on_cake}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          {cake.special_instructions && (
                            <div className="p-2.5 rounded-xl bg-[#FFF0F6] text-[11px] text-[#111111] mb-3 border border-[#E4007C]/20">
                              <strong>Note:</strong> {cake.special_instructions}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t-2 border-[#111111]/10 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-[#6B7280] uppercase font-black block">Quoted</span>
                            <span className="font-black text-lg text-[#111111]">
                              ₹{cake.quoted_price || 1200}
                            </span>
                          </div>

                          <a
                            href={`https://wa.me/${cake.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(waReplyText)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-whatsapp !py-2 !px-3.5 text-xs font-black uppercase"
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

          {/* TAB: MENU INVENTORY CRUD VIEW */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border-2 border-[#111111] p-6 shadow-[5px_5px_0px_#111111] space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#111111]/10">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#111111]">
                    Bakery Item Management (CRUD)
                  </h2>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    Add new bakery items, update prices in ₹, edit sizes, manage pure veg indicators, or remove items.
                  </p>
                </div>

                <button
                  id="add-new-item-btn"
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="btn-primary !py-2.5 !px-5 text-xs flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New Bakery Item
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Search items by name or description..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-[#F4F4F4] border-2 border-[#111111] text-xs font-bold focus:outline-none focus:border-[#E4007C]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#111111] absolute left-3 top-3" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  <button
                    onClick={() => setInventoryCategoryFilter('all')}
                    className={`text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${
                      inventoryCategoryFilter === 'all'
                        ? 'bg-[#E4007C] text-white border-[#E4007C]'
                        : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setInventoryCategoryFilter(c.id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap transition-all border-2 ${
                        inventoryCategoryFilter === c.id
                          ? 'bg-[#E4007C] text-white border-[#E4007C]'
                          : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products List Cards */}
              <div className="divide-y divide-[#111111]/10">
                {filteredInventoryProducts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#6B7280] font-bold">
                    No bakery items found matching your filter. Click &ldquo;Add New Bakery Item&rdquo; above!
                  </div>
                ) : (
                  filteredInventoryProducts.map((prod) => {
                    const cat = categories.find((c) => c.id === prod.category_id);
                    const sizes = Array.isArray(prod.available_sizes) ? (prod.available_sizes as any[]) : [];

                    return (
                      <div
                        key={prod.id}
                        className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#FFF0F6]/40 p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-xl bg-[#FFF0F6] overflow-hidden relative shrink-0 border-2 border-[#111111]">
                            {prod.images?.[0] ? (
                              <Image
                                src={prod.images[0]}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#E4007C]">
                                <ChefHat className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {prod.is_eggless && (
                                <span
                                  className="w-3.5 h-3.5 border border-[#15803D] flex items-center justify-center p-0.5 rounded-xs bg-white shrink-0"
                                  title="100% Pure Veg (Eggless)"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                                </span>
                              )}
                              <h3 className="text-sm font-black uppercase text-[#111111] truncate">
                                {prod.name}
                              </h3>
                              {cat && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111]">
                                  {cat.name}
                                </span>
                              )}
                              {prod.is_featured && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E4007C] text-white flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Bestseller
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#6B7280] font-medium line-clamp-1 max-w-lg">
                              {prod.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-black text-[#111111] text-sm">
                                ₹{Math.round(Number(prod.base_price))}
                              </span>
                              {sizes.length > 0 && (
                                <span className="text-[11px] text-[#6B7280] font-bold">
                                  ({sizes.length} size{sizes.length > 1 ? 's' : ''}: {sizes.map((s) => s.label).join(', ')})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Stock Toggle, Edit, Delete */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => handleToggleProductStock(prod.id, prod.is_available ?? true)}
                            className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all border ${
                              prod.is_available
                                ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]'
                                : 'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            {prod.is_available ? '● In Stock' : '○ Sold Out'}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 rounded-xl bg-white hover:bg-[#FFE600] text-[#111111] transition-colors border-2 border-[#111111]"
                            title="Edit Item Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS CRM VIEW */}
          {activeTab === 'crm' && (
            <div className="bg-white rounded-2xl border-2 border-[#111111] p-6 shadow-[5px_5px_0px_#111111] space-y-4">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#111111]/10">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#111111]">
                    Customers &amp; Loyalty CRM
                  </h2>
                  <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                    Customer contact registry, order frequency, and lifetime bakery spend.
                  </p>
                </div>
                <button
                  onClick={exportCustomersCSV}
                  className="btn-primary !py-2 !px-4 text-xs font-black flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CRM CSV</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6B7280] font-bold">
                  No customer records available yet.
                </div>
              ) : (
                <div className="divide-y divide-[#111111]/10">
                  {Array.from(
                    orders.reduce((acc, o) => {
                      const phone = o.customer_phone;
                      const existing = acc.get(phone) || {
                        name: o.customer_name,
                        phone,
                        email: o.customer_email,
                        totalSpent: 0,
                        ordersCount: 0,
                        lastOrderDate: o.delivery_date,
                      };
                      existing.totalSpent += Number(o.grand_total);
                      existing.ordersCount += 1;
                      acc.set(phone, existing);
                      return acc;
                    }, new Map<string, any>()).values()
                  ).map((cust, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-sm uppercase text-[#111111]">{cust.name}</p>
                        <p className="text-xs text-[#6B7280] font-medium flex items-center gap-2">
                          <span>{cust.phone}</span>
                          {cust.email && <span>• {cust.email}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-[#E4007C] block">
                          ₹{Math.round(cust.totalSpent).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-[#6B7280]">
                          {cust.ordersCount} {cust.ordersCount === 1 ? 'Order' : 'Orders'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ITEM CREATE / EDIT MODAL */}
        {isItemModalOpen && (
          <div
            id="item-crud-modal"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          >
            <div className="bg-white rounded-2xl border-2 border-[#111111] shadow-[8px_8px_0px_#111111] max-w-2xl w-full p-6 md:p-8 my-8 relative">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#F4F4F4] text-[#111111] hover:bg-[#E4007C] hover:text-white transition-colors border border-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-[#E4007C]">
                <Sparkles className="w-4 h-4" />
                {editingProduct ? 'UPDATE MENU ITEM' : 'CREATE NEW MENU ITEM'}
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#111111] mb-6">
                {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Bakery Bake'}
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Rasmalai Cake"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                      Base Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="499"
                      value={formBasePrice}
                      onChange={(e) => setFormBasePrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full text-xs font-bold p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                      Dietary Type
                    </label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-1.5 text-xs font-black text-[#15803D] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsEggless}
                          onChange={(e) => setFormIsEggless(e.target.checked)}
                          className="w-4 h-4 rounded-sm text-[#15803D] focus:ring-[#15803D]"
                        />
                        100% Pure Veg (Eggless)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsVegan}
                          onChange={(e) => setFormIsVegan(e.target.checked)}
                          className="w-4 h-4 rounded-sm"
                        />
                        Vegan
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#111111] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsGlutenFree}
                          onChange={(e) => setFormIsGlutenFree(e.target.checked)}
                          className="w-4 h-4 rounded-sm"
                        />
                        Gluten-Free
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                    Description &amp; Ingredients
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Rich cardamom milk sponge soaked in rabdi cream, topped with Bengali rasmalai..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-xs font-medium p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111] mb-1.5">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full text-xs font-mono p-3 rounded-xl bg-[#F4F4F4] border-2 border-[#111111] focus:outline-none focus:border-[#E4007C] mb-2"
                  />
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <span className="text-[10px] text-[#6B7280] uppercase font-black shrink-0">
                      Quick Presets:
                    </span>
                    {IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 transition-colors ${
                          formImageUrl === preset.url
                            ? 'bg-[#E4007C] text-white border-[#E4007C]'
                            : 'bg-white text-[#111111] hover:bg-[#FFE600] border-[#111111]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-black uppercase tracking-wider text-[#111111]">
                      Available Sizes &amp; Extra Price (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormSizes([...formSizes, { label: '1.5 kg', extra_price: 650 }])
                      }
                      className="text-xs font-black uppercase text-[#E4007C] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Size Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formSizes.map((sz, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 0.5 kg (Serves 4-6)"
                          value={sz.label}
                          onChange={(e) => {
                            const updated = [...formSizes];
                            updated[index].label = e.target.value;
                            setFormSizes(updated);
                          }}
                          className="flex-1 text-xs font-bold p-2.5 rounded-xl bg-[#F4F4F4] border-2 border-[#111111]"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-[#111111] font-black">+₹</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="Extra Price"
                            value={sz.extra_price}
                            onChange={(e) => {
                              const updated = [...formSizes];
                              updated[index].extra_price = Number(e.target.value);
                              setFormSizes(updated);
                            }}
                            className="w-24 text-xs font-bold p-2.5 rounded-xl bg-[#F4F4F4] border-2 border-[#111111]"
                          />
                        </div>
                        {formSizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormSizes(formSizes.filter((_, i) => i !== index));
                            }}
                            className="p-2 text-red-500 hover:text-red-700 font-bold"
                            title="Remove Size"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t-2 border-[#111111]/10">
                  <label className="flex items-center gap-2 text-xs font-black uppercase text-[#111111] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsAvailable}
                      onChange={(e) => setFormIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-[#15803D]"
                    />
                    In Stock (Ready to Bake)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-black uppercase text-[#E4007C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-[#E4007C]"
                    />
                    Feature on Homepage (Bestseller)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#111111]/10">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="btn-secondary !py-2.5 !px-5 text-xs font-black"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="btn-primary !py-2.5 !px-6 text-xs font-black flex items-center gap-2"
                  >
                    {isSavingProduct ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving to Bakery Menu...
                      </>
                    ) : (
                      <>{editingProduct ? 'Update Item' : 'Add Item to Menu'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
