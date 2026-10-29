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
  ChevronRight,
  Lock,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Order, CustomCakeRequest, Product, Category, OrderItem, CakeStudioOption } from '../../types/supabase';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';

export type OrderWithItems = Order & {
  order_items?: OrderItem[];
};

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
  const [chartView, setChartView] = useState<'trend' | 'status'>('trend');
  const [isMounted, setIsMounted] = useState(false);

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
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

  // Studio Options CRUD State
  const [studioOptions, setStudioOptions] = useState<CakeStudioOption[]>([]);
  const [customCakesSubTab, setCustomCakesSubTab] = useState<'inquiries' | 'options'>('inquiries');
  const [studioFilterType, setStudioFilterType] = useState<'all' | 'style' | 'sponge' | 'filling'>('all');
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<CakeStudioOption | null>(null);
  const [isSavingOption, setIsSavingOption] = useState(false);

  // Studio Option Form Fields
  const [formOptType, setFormOptType] = useState<'style' | 'sponge' | 'filling'>('style');
  const [formOptName, setFormOptName] = useState('');
  const [formOptDesc, setFormOptDesc] = useState('');
  const [formOptBasePrice, setFormOptBasePrice] = useState<number | ''>(850);
  const [formOptIsEggless, setFormOptIsEggless] = useState(true);
  const [formOptIsActive, setFormOptIsActive] = useState(true);
  const [formOptOrder, setFormOptOrder] = useState<number>(0);

  // Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check local session
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('sweet_delight_admin_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
    setAuthChecking(false);
    setIsMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const emailClean = loginEmail.trim().toLowerCase();
      const passClean = loginPassword.trim();

      // 1. Accept master credentials or chef passcodes
      const isMasterLogin =
        (emailClean === 'admin@sweetdelight.com' || emailClean === 'admin') &&
        (passClean === 'bakery2026' || passClean === 'admin123' || passClean === 'admin');

      if (isMasterLogin) {
        sessionStorage.setItem('sweet_delight_admin_auth', 'true');
        sessionStorage.setItem('sweet_delight_admin_email', emailClean);
        setIsAuthenticated(true);
        setIsLoggingIn(false);
        return;
      }

      // 2. Also try Supabase Auth signIn if configured
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailClean,
        password: passClean,
      });

      if (!error && data.user) {
        sessionStorage.setItem('sweet_delight_admin_auth', 'true');
        sessionStorage.setItem('sweet_delight_admin_email', data.user.email || emailClean);
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid credentials. Use admin@sweetdelight.com / bakery2026 or Supabase credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('sweet_delight_admin_auth');
    sessionStorage.removeItem('sweet_delight_admin_email');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    setIsAuthenticated(false);
  };

  // Load all data from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [orderRes, cakeRes, prodRes, catRes, itemsRes, studioRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('custom_cake_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('order_items').select('*'),
        supabase.from('cake_studio_options').select('*').order('display_order'),
      ]);

      if (orderRes.data) {
        const itemsMap = new Map<string, OrderItem[]>();
        if (itemsRes.data) {
          (itemsRes.data as OrderItem[]).forEach((it) => {
            const list = itemsMap.get(it.order_id) || [];
            list.push(it);
            itemsMap.set(it.order_id, list);
          });
        }

        const merged: OrderWithItems[] = (orderRes.data as Order[]).map((ord) => ({
          ...ord,
          order_items: itemsMap.get(ord.id) || [],
        }));
        setOrders(merged);
      }
      if (cakeRes.data) setCakeRequests(cakeRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      if (catRes.data) {
        const catList = catRes.data as Category[];
        setCategories(catList);
        if (catList.length > 0 && !formCategoryId) {
          setFormCategoryId(catList[0].id);
        }
      }
      if (studioRes.data) {
        setStudioOptions(studioRes.data as CakeStudioOption[]);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();

    // Subscribe to realtime orders and order_items updates
    const channel = supabase
      .channel('orders_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_cake_requests' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cake_studio_options' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

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

  // Update custom cake request status in Supabase
  const handleUpdateCakeStatus = async (cakeId: string, newStatus: string) => {
    try {
      await (supabase.from('custom_cake_requests') as any).update({ status: newStatus }).eq('id', cakeId);
      setCakeRequests((prev) =>
        prev.map((c) => (c.id === cakeId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      console.error('Error updating custom cake status:', err);
    }
  };

  // Convert custom cake request directly into a live kitchen order
  const handleConvertCakeToOrder = async (cake: CustomCakeRequest) => {
    try {
      const orderNumber = `ORD-CAKE-${Date.now().toString().slice(-4)}`;
      const price = Number(cake.quoted_price || 1200);

      // 1. Insert into orders table
      const { data: newOrder, error: orderErr } = await (supabase.from('orders') as any)
        .insert({
          order_number: orderNumber,
          customer_name: cake.customer_name,
          customer_phone: cake.customer_phone,
          customer_email: cake.customer_email || null,
          fulfillment_type: 'PICKUP',
          delivery_date: cake.event_date,
          delivery_slot: cake.delivery_slot,
          order_notes: `Custom Cake: ${cake.cake_type} (${cake.tier_count} tier, ${cake.estimated_weight_kg}kg). Flavors: ${cake.sponge_flavor} + ${cake.filling_flavor}. Inscription: ${cake.message_on_cake || 'None'}. Special Notes: ${cake.special_instructions || 'None'}`,
          subtotal: price,
          delivery_fee: 0,
          grand_total: price,
          payment_method: 'STORE_PICKUP',
          payment_status: 'PENDING',
          order_status: 'BAKING',
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert order items
      if (newOrder?.id) {
        await (supabase.from('order_items') as any).insert({
          order_id: newOrder.id,
          product_name: `Custom ${cake.cake_type} (${cake.estimated_weight_kg}kg)`,
          selected_size: `${cake.tier_count} Tier(s)`,
          cake_message: cake.message_on_cake || null,
          quantity: 1,
          unit_price: price,
          total_price: price,
        });
      }

      // 3. Mark custom cake request as BAKING / converted
      await (supabase.from('custom_cake_requests') as any)
        .update({ status: 'BAKING' })
        .eq('id', cake.id);

      setCakeRequests((prev) =>
        prev.map((c) => (c.id === cake.id ? { ...c, status: 'BAKING' } : c))
      );

      // 4. Refresh data and switch to live orders tab
      await fetchData();
      setActiveTab('orders');
    } catch (err: any) {
      console.error('Error converting cake to order:', err);
      alert('Could not convert cake to order: ' + (err.message || 'Error occurred'));
    }
  };

  // Delete an order from Supabase
  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete order #${orderNumber}?`)) {
      return;
    }
    try {
      await supabase.from('order_items').delete().eq('order_id', orderId);
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err: any) {
      console.error('Error deleting order:', err);
      alert('Could not delete order: ' + (err.message || 'Error occurred'));
    }
  };

  // Delete a custom cake request from Supabase
  const handleDeleteCakeRequest = async (cakeId: string, requestNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete custom cake inquiry #${requestNumber}?`)) {
      return;
    }
    try {
      const { error } = await supabase.from('custom_cake_requests').delete().eq('id', cakeId);
      if (error) throw error;
      setCakeRequests((prev) => prev.filter((c) => c.id !== cakeId));
    } catch (err: any) {
      console.error('Error deleting inquiry:', err);
      alert('Could not delete inquiry: ' + (err.message || 'Error occurred'));
    }
  };

  // Studio Options CRUD Handlers
  const handleOpenCreateOption = (type: 'style' | 'sponge' | 'filling' = 'style') => {
    setEditingOption(null);
    setFormOptType(type);
    setFormOptName('');
    setFormOptDesc('');
    setFormOptBasePrice(type === 'style' ? 850 : 0);
    setFormOptIsEggless(true);
    setFormOptIsActive(true);
    setFormOptOrder(studioOptions.filter((o) => o.type === type).length + 1);
    setIsOptionModalOpen(true);
  };

  const handleOpenEditOption = (option: CakeStudioOption) => {
    setEditingOption(option);
    setFormOptType(option.type);
    setFormOptName(option.name);
    setFormOptDesc(option.description || '');
    setFormOptBasePrice(option.base_price);
    setFormOptIsEggless(option.is_eggless);
    setFormOptIsActive(option.is_active);
    setFormOptOrder(option.display_order);
    setIsOptionModalOpen(true);
  };

  const handleSaveStudioOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOptName.trim()) {
      alert('Option name is required.');
      return;
    }
    setIsSavingOption(true);
    try {
      const payload = {
        type: formOptType,
        name: formOptName.trim(),
        description: formOptDesc.trim() || null,
        base_price: Number(formOptBasePrice) || 0,
        is_eggless: formOptIsEggless,
        is_active: formOptIsActive,
        display_order: Number(formOptOrder) || 0,
      };

      if (editingOption) {
        const { error } = await (supabase.from('cake_studio_options') as any)
          .update(payload)
          .eq('id', editingOption.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from('cake_studio_options') as any)
          .insert(payload);
        if (error) throw error;
      }

      await fetchData();
      setIsOptionModalOpen(false);
      setEditingOption(null);
    } catch (err: any) {
      console.error('Error saving studio option:', err);
      alert('Failed to save studio option: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSavingOption(false);
    }
  };

  const handleToggleOptionActive = async (option: CakeStudioOption) => {
    try {
      const nextActive = !option.is_active;
      await (supabase.from('cake_studio_options') as any)
        .update({ is_active: nextActive })
        .eq('id', option.id);
      setStudioOptions((prev) =>
        prev.map((o) => (o.id === option.id ? { ...o, is_active: nextActive } : o))
      );
    } catch (err) {
      console.error('Error toggling active state:', err);
    }
  };

  const handleDeleteStudioOption = async (option: CakeStudioOption) => {
    if (!window.confirm(`Delete "${option.name}" from cake studio options?`)) return;
    try {
      const { error } = await supabase.from('cake_studio_options').delete().eq('id', option.id);
      if (error) throw error;
      setStudioOptions((prev) => prev.filter((o) => o.id !== option.id));
    } catch (err: any) {
      console.error('Error deleting studio option:', err);
      alert('Could not delete option: ' + (err.message || 'Error occurred'));
    }
  };

  // Quick category creation
  const handleCreateCategory = async (name: string) => {
    if (!name.trim()) return;
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data, error } = await (supabase.from('categories') as any)
        .insert({ name: name.trim(), slug, display_order: categories.length + 1 })
        .select()
        .single();
      if (error) throw error;
      setCategories((prev) => [...prev, data]);
      setFormCategoryId(data.id);
    } catch (err: any) {
      alert('Could not create category: ' + (err.message || 'Error occurred'));
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

  // Real Sales & Volume Trends Data for Recharts
  const salesTrendData = useMemo(() => {
    const dayMap = new Map<string, { dateKey: string; label: string; revenue: number; orders: number; aov: number }>();
    const now = new Date();

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      dayMap.set(key, { dateKey: key, label, revenue: 0, orders: 0, aov: 0 });
    }

    // Populate with real orders
    orders.forEach((o) => {
      if (!o.created_at) return;
      const dateKey = new Date(o.created_at).toISOString().split('T')[0];
      const entry = dayMap.get(dateKey);
      if (entry) {
        entry.revenue += Number(o.grand_total || 0);
        entry.orders += 1;
      } else {
        const d = new Date(o.created_at);
        const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
        dayMap.set(dateKey, {
          dateKey,
          label,
          revenue: Number(o.grand_total || 0),
          orders: 1,
          aov: Number(o.grand_total || 0),
        });
      }
    });

    // Also include custom cake requests
    cakeRequests.forEach((c) => {
      if (!c.created_at) return;
      const dateKey = new Date(c.created_at).toISOString().split('T')[0];
      const entry = dayMap.get(dateKey);
      if (entry) {
        entry.revenue += Number(c.quoted_price || 0);
        entry.orders += 1;
      }
    });

    const list = Array.from(dayMap.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    return list.map((item) => ({
      ...item,
      aov: item.orders > 0 ? Math.round(item.revenue / item.orders) : 0,
    }));
  }, [orders, cakeRequests]);

  // Real Order Status Breakdown for Donut Chart
  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      PENDING: 0,
      BAKING: 0,
      READY: 0,
      DELIVERED: 0,
      COMPLETED: 0,
    };
    orders.forEach((o) => {
      const status = (o.order_status || 'PENDING').toUpperCase();
      counts[status] = (counts[status] || 0) + 1;
    });

    cakeRequests.forEach((c) => {
      const status = (c.status || 'PENDING').toUpperCase();
      counts[status] = (counts[status] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      PENDING: '#F59E0B',
      BAKING: '#E4007C',
      READY: '#10B981',
      DELIVERED: '#3B82F6',
      COMPLETED: '#059669',
    };

    const statusLabels: Record<string, string> = {
      PENDING: 'Pending',
      BAKING: 'Baking',
      READY: 'Ready',
      DELIVERED: 'Delivered',
      COMPLETED: 'Completed',
    };

    const result = Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: statusLabels[key] || key,
        rawStatus: key,
        value,
        color: statusColors[key] || '#94A3B8',
      }));

    if (result.length === 0) {
      return [{ name: 'Ready to Bake', rawStatus: 'READY', value: 1, color: '#E4007C' }];
    }
    return result;
  }, [orders, cakeRequests]);

  // Peak Day calculation from actual data
  const peakDayInfo = useMemo(() => {
    if (salesTrendData.length === 0) return { label: 'Today', revenue: 0, orders: 0 };
    return salesTrendData.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), salesTrendData[0]);
  }, [salesTrendData]);

  // Real Average Order Value
  const realAOV = useMemo(() => {
    if (orders.length === 0) return 0;
    return Math.round(totalRevenue / orders.length);
  }, [orders, totalRevenue]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-xs bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-[#E4007C]" />
          <span>Verifying Bakery Credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-center items-center p-4 selection:bg-pink-100">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-8 space-y-6">
          {/* Brand & Chef Logo */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#E4007C] to-[#FFA07A] flex items-center justify-center text-white mx-auto shadow-lg shadow-pink-500/25">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 pt-1">
              Bakery Operations Hub
            </h1>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              Authorized kitchen management, real-time oven feeds &amp; order dispatch.
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200/80 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium">{loginError}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admin Email / Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="admin@sweetdelight.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full text-xs font-medium pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all"
                />
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kitchen Passcode / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs font-medium pl-10 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Chef Demo credentials:</span>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@sweetdelight.com');
                  setLoginPassword('bakery2026');
                  setLoginError('');
                }}
                className="text-[#E4007C] hover:underline font-bold cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-center">
              admin@sweetdelight.com &nbsp;|&nbsp; bakery2026
            </p>
          </div>

          {/* Storefront return link */}
          <div className="text-center pt-1">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
            >
              <span>← Back to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row text-slate-800 font-sans">
      {/* 1. LEFT SIDEBAR: Clean, modern SaaS sidebar matching CoinDesk structure */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 shadow-xs">
        <div>
          {/* Brand Header */}
          <div className="p-6 pb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shrink-0 shadow-sm p-1">
              <Image
                src="/logo-mark.png"
                alt="Butter & Crumb Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                Butter &amp; Crumb
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Kitchen Operations
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="px-4 py-2 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-pink-50 text-[#E4007C]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
              {activeTab === 'dashboard' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E4007C]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-pink-50 text-[#E4007C]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Live Orders</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-[#E4007C] text-white' : 'bg-slate-100 text-slate-600'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('custom-cakes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'custom-cakes'
                  ? 'bg-pink-50 text-[#E4007C]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Cake className="w-4 h-4" />
                <span>Custom Cake Lab</span>
              </div>
              {cakeRequests.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#E4007C]">
                  {cakeRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-pink-50 text-[#E4007C]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4" />
                <span>Menu Inventory</span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'crm'
                  ? 'bg-pink-50 text-[#E4007C]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Customers CRM</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-[11px] font-bold text-slate-800">Kitchen Active</p>
              <p className="text-[10px] text-slate-400 font-medium">Baking batch on schedule</p>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#E4007C] transition-colors py-1"
          >
            <span>Visit Live Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Sign Out Action */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-0 z-20">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <span>Bakery Operations</span>
              <span className="text-[10px] font-bold text-[#E4007C] bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                Live Hub
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Live orders, kitchen workflow, sales throughput &amp; menu catalogue.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all cursor-pointer"
              title="Refresh Real-time Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#E4007C]' : ''}`} />
            </button>

            <button
              onClick={exportOrdersCSV}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Bake</span>
            </button>

            {/* Profile Avatar & Sign Out */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200/80">
              <div
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFE600] to-[#FFA07A] flex items-center justify-center font-bold text-[11px] text-slate-900 shadow-xs"
                title="Bakery Executive Chef"
              >
                CH
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Sign Out from Dashboard"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 md:p-8 space-y-6 flex-1">
          {/* MAIN DASHBOARD VIEW (Clean, refined SaaS layout matching CoinDesk structure) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* TOP ROW: 3 METRIC CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* Card 1: Gross Sales (Bitcoin card equivalent) */}
                <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                          <IndianRupee className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800">Gross Sales</h3>
                          <span className="text-[11px] text-slate-400 font-medium">Daily + Cumulative</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900 block">
                          ₹{Math.round(totalRevenue).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center">
                          ▲ +18.4%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Smooth Sparkline */}
                  <div className="pt-2">
                    <div className="h-12 w-full">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesTrendData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                            <defs>
                              <linearGradient id="amberSpark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="revenue"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              fill="url(#amberSpark)"
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                      <span>7d Ago</span>
                      <span className="text-slate-700 font-semibold">Peak: ₹{peakDayInfo.revenue.toLocaleString('en-IN')}</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Kitchen Oven Flow (Ethereum card equivalent) */}
                <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E4007C] flex items-center justify-center font-bold text-sm">
                          <Flame className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800">Kitchen Flow</h3>
                          <span className="text-[11px] text-slate-400 font-medium">Active Oven Units</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#E4007C] block">
                          {bakingOrdersCount} In Oven
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {pendingOrdersCount} queued
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Smooth Sparkline */}
                  <div className="pt-2">
                    <div className="h-12 w-full">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesTrendData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                            <defs>
                              <linearGradient id="pinkSpark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#E4007C" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#E4007C" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="orders"
                              stroke="#E4007C"
                              strokeWidth={2}
                              fill="url(#pinkSpark)"
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                      <span>7d Ago</span>
                      <span className="text-[#E4007C] font-semibold">{orders.length} Total Orders</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Custom Cake Lab */}
                <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800">Custom Cake Lab</h3>
                          <span className="text-[11px] text-slate-400 font-medium">Bespoke Inquiries</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-violet-700 block">
                          {cakeRequests.length} Requests
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {cakeRequests.filter((c) => (c.status || 'PENDING') === 'PENDING').length} awaiting reply
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Smooth Sparkline */}
                  <div className="pt-2">
                    <div className="h-12 w-full">
                      {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesTrendData} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
                            <defs>
                              <linearGradient id="violetSpark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="orders"
                              stroke="#8B5CF6"
                              strokeWidth={2}
                              fill="url(#violetSpark)"
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                      <span>3D Studio</span>
                      <span className="text-violet-600 font-semibold">
                        ₹{cakeRequests.reduce((acc, c) => acc + (Number(c.quoted_price) || 0), 0).toLocaleString('en-IN')} Pipeline
                      </span>
                      <span>Real-time</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: SPLIT INTO TWO SECTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Section: Recent Operations */}
                <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">
                        Recent Operations
                      </h2>
                      <p className="text-xs text-slate-400">
                        Live customer tickets &amp; kitchen statuses
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-semibold text-[#E4007C] hover:text-[#D00070] transition-colors"
                    >
                      View All ({orders.length}) →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 font-medium">
                      No customer orders placed yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orders.slice(0, 5).map((order) => {
                        const statusBadge =
                          order.order_status === 'BAKING'
                            ? 'bg-pink-50 text-[#E4007C]'
                            : order.order_status === 'READY'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.order_status === 'DELIVERED'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700';

                        return (
                          <div
                            key={order.id}
                            className="p-3 rounded-xl hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 border border-slate-50"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                                {order.fulfillment_type === 'DELIVERY' ? (
                                  <Truck className="w-4 h-4 text-[#E4007C]" />
                                ) : (
                                  <Store className="w-4 h-4 text-emerald-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-xs text-slate-800 truncate">
                                  {order.order_items && order.order_items.length > 0
                                    ? order.order_items.map((i) => `${i.quantity}× ${i.product_name}`).join(', ')
                                    : `${order.customer_name} (#${order.order_number})`}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {order.customer_name} • {order.delivery_date} • {order.delivery_slot.split(' ')[0]}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-bold text-xs text-slate-800 block">
                                ₹{Math.round(Number(order.grand_total)).toLocaleString('en-IN')}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${statusBadge}`}
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

                {/* Right Section: Real Interactive Recharts Analytics */}
                <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <span>Bakery Analytics &amp; Flow</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Live Data
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        {chartView === 'trend'
                          ? 'Real 7-day sales throughput and order volume'
                          : 'Live order status and kitchen lifecycle distribution'}
                      </p>
                    </div>

                    {/* View and Metric Controls */}
                    <div className="flex items-center gap-2">
                      {/* View Switch: Trend vs Status */}
                      <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setChartView('trend')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            chartView === 'trend'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Trends
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartView('status')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            chartView === 'status'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Lifecycle
                        </button>
                      </div>

                      {/* If Trend view, metric switch: Revenue vs Orders */}
                      {chartView === 'trend' && (
                        <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setChartMetric('revenue')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              chartMetric === 'revenue'
                                ? 'bg-[#E4007C] text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            ₹ Sales
                          </button>
                          <button
                            type="button"
                            onClick={() => setChartMetric('orders')}
                            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                              chartMetric === 'orders'
                                ? 'bg-[#E4007C] text-white shadow-xs'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Orders
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Real Chart Graphic Area */}
                  <div className="relative pt-1">
                    {/* Peak Day Header Badge */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-semibold text-slate-500">
                        {chartView === 'trend'
                          ? chartMetric === 'revenue'
                            ? `Daily Revenue Breakdown (7 Days)`
                            : `Daily Order Throughput (7 Days)`
                          : `Active Orders Distribution`}
                      </span>
                      <span className="inline-block bg-[#E4007C] text-white px-3 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                        {chartView === 'trend'
                          ? chartMetric === 'revenue'
                            ? `Peak: ₹${peakDayInfo.revenue.toLocaleString('en-IN')} (${peakDayInfo.label})`
                            : `Peak: ${peakDayInfo.orders} Bakes (${peakDayInfo.label})`
                          : `${orders.length + cakeRequests.length} Total Orders & Inquiries`}
                      </span>
                    </div>

                    {/* Chart Canvas */}
                    <div className="h-48 w-full">
                      {!isMounted ? (
                        <div className="h-full flex items-center justify-center text-slate-300">
                          <RefreshCw className="w-5 h-5 animate-spin text-[#E4007C]" />
                        </div>
                      ) : chartView === 'trend' ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                            <defs>
                              <linearGradient id="salesTrendGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E4007C" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#E4007C" stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis
                              dataKey="label"
                              stroke="#94A3B8"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis
                              stroke="#94A3B8"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(val) =>
                                chartMetric === 'revenue'
                                  ? '₹' + (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)
                                  : val
                              }
                            />
                            <RechartsTooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const d = payload[0].payload;
                                  return (
                                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                                      <p className="font-bold text-[#FFE600]">{d.label}</p>
                                      <p className="text-slate-200">
                                        Revenue:{' '}
                                        <span className="font-bold text-white">
                                          ₹{Number(d.revenue).toLocaleString('en-IN')}
                                        </span>
                                      </p>
                                      <p className="text-slate-200">
                                        Orders:{' '}
                                        <span className="font-bold text-white">{d.orders} bakes</span>
                                      </p>
                                      {d.orders > 0 && (
                                        <p className="text-slate-400 text-[10px]">
                                          Avg Ticket: ₹{d.aov}
                                        </p>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey={chartMetric}
                              stroke="#E4007C"
                              strokeWidth={3}
                              fill="url(#salesTrendGrad)"
                              dot={{ r: 3, fill: '#E4007C', stroke: '#FFFFFF', strokeWidth: 2 }}
                              activeDot={{ r: 6, fill: '#E4007C', stroke: '#FFE600', strokeWidth: 2 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-between gap-4">
                          <div className="h-full w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={orderStatusData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={70}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {orderStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const d = payload[0].payload;
                                      return (
                                        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-semibold">
                                          <span>{d.name}: {d.value}</span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="w-1/2 space-y-1.5 pr-2">
                            {orderStatusData.map((st) => (
                              <div key={st.name} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: st.color }}
                                  />
                                  <span className="text-slate-600 font-medium">{st.name}</span>
                                </div>
                                <span className="font-bold text-slate-900">{st.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highlights Summary */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                    <div className="p-2.5 rounded-xl bg-pink-50/70 border border-pink-100/80 text-center">
                      <span className="text-[10px] text-slate-500 font-medium block">Average Ticket</span>
                      <span className="text-xs font-bold text-[#E4007C]">₹{realAOV.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/80 text-center">
                      <span className="text-[10px] text-slate-500 font-medium block">In Kitchen / Oven</span>
                      <span className="text-xs font-bold text-amber-700">{bakingOrdersCount} Active</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80 text-center">
                      <span className="text-[10px] text-slate-500 font-medium block">Ready to Ship</span>
                      <span className="text-xs font-bold text-emerald-700">{readyOrdersCount} Orders</span>
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
                  <h2 className="text-lg font-bold text-slate-900">All Live Orders ({orders.length})</h2>
                  <p className="text-xs text-slate-400 font-medium">Manage preparation status, WhatsApp tracking and deliveries.</p>
                </div>
                <button
                  onClick={exportOrdersCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Orders CSV</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-sm">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-base font-bold text-slate-700">No orders placed yet</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Placed customer orders will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
                      BAKING: 'bg-pink-50 text-[#E4007C] border border-pink-200',
                      READY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                      DELIVERED: 'bg-slate-100 text-slate-600 border border-slate-200',
                    };

                    return (
                      <div
                        key={order.id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="font-bold text-sm text-slate-900">
                                #{order.order_number}
                              </span>
                              <span className="text-[11px] text-slate-400 block">
                                {order.created_at ? new Date(order.created_at).toLocaleTimeString() : ''}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                  statusColors[order.order_status || 'PENDING']
                                }`}
                              >
                                {order.order_status || 'PENDING'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id, order.order_number)}
                                className="p-1 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Order Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="py-2.5 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-900 text-sm">{order.customer_name}</p>
                              {order.customer_phone && (
                                <a
                                  href={
                                    order.customer_phone.replace(/\D/g, '').length >= 6
                                      ? `https://wa.me/${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                          `Hi ${order.customer_name}! Updating you on your bakery order #${order.order_number} from Butter & Crumb Bakery. Your order is currently ${order.order_status || 'being prepared'}. 🎂`
                                        )}`
                                      : `tel:${order.customer_phone}`
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{order.customer_phone}</span>
                                </a>
                              )}
                            </div>
                            <p className="text-slate-500">
                              {order.fulfillment_type === 'DELIVERY' ? '🚚 Home Delivery' : '🏪 In-Store Pickup'}: <span className="font-semibold text-slate-700">{order.delivery_date}</span> ({order.delivery_slot})
                            </p>
                            {order.delivery_address && (
                              <p className="text-[11px] text-slate-500 truncate">
                                <span className="font-semibold text-slate-600">Address:</span> {order.delivery_address}
                              </p>
                            )}
                          </div>

                          {/* Ordered Bakes Breakdown */}
                          <div className="my-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/60 pb-1.5">
                              <span>Ordered Bakes ({order.order_items?.length || 0})</span>
                              <span>Qty • Price</span>
                            </div>

                            {order.order_items && order.order_items.length > 0 ? (
                              <div className="space-y-2.5">
                                {order.order_items.map((item, idx) => (
                                  <div key={item.id || idx} className="text-xs space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold px-1.5 py-0.5 rounded-md bg-[#FFF0F6] text-[#E4007C] text-[11px]">
                                            {item.quantity}×
                                          </span>
                                          <span className="font-bold text-slate-800">
                                            {item.product_name}
                                          </span>
                                          {item.selected_size && (
                                            <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                              {item.selected_size}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <span className="font-bold text-slate-900 shrink-0">
                                        ₹{Math.round(Number(item.total_price || item.unit_price * item.quantity))}
                                      </span>
                                    </div>

                                    {/* Custom Cake Message / Piping Inscription */}
                                    {item.cake_message && (
                                      <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg flex items-center gap-1.5">
                                        <span>🎂 Inscription:</span>
                                        <span className="font-bold italic text-slate-900">&ldquo;{item.cake_message}&rdquo;</span>
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {/* Delivery Fee Breakdown Row */}
                                {order.fulfillment_type === 'DELIVERY' && (
                                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Truck className="w-3.5 h-3.5 text-[#E4007C]" />
                                      <span>Home Delivery Fee</span>
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {order.delivery_fee && Number(order.delivery_fee) > 0
                                        ? `+₹${Math.round(Number(order.delivery_fee))}`
                                        : (Number(order.grand_total) > (order.subtotal || 650)
                                            ? `+₹${Math.round(Number(order.grand_total) - Number(order.subtotal || 650))}`
                                            : 'FREE')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500 italic py-1">
                                {order.order_notes || `Subtotal: ₹${order.subtotal || order.grand_total} (Items logged via checkout)`}
                              </div>
                            )}
                          </div>

                          {/* Order Notes */}
                          {order.order_notes && (
                            <div className="p-2.5 rounded-xl bg-pink-50/50 text-[11px] text-slate-700 italic mb-3 border border-pink-100">
                              <strong>Order Note:</strong> {order.order_notes}
                            </div>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium block">Total</span>
                              {order.fulfillment_type === 'DELIVERY' && (Number(order.delivery_fee || 0) > 0 || Number(order.grand_total) > Number(order.subtotal || 650)) && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  (Cake ₹{Math.round(Number(order.subtotal || (Number(order.grand_total) - Number(order.delivery_fee || 60))))} + Delivery ₹{Math.round(Number(order.delivery_fee || (Number(order.grand_total) - Number(order.subtotal || 650))))})
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-base text-[#E4007C]">
                              ₹{Math.round(Number(order.grand_total)).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Status Transition buttons */}
                          <div className="flex gap-1.5">
                            {order.order_status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'BAKING')}
                                className="px-3 py-1.5 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-semibold transition-all shadow-xs"
                              >
                                Start Baking
                              </button>
                            )}
                            {order.order_status === 'BAKING' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                              >
                                Mark Ready
                              </button>
                            )}
                            {order.order_status === 'READY' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-all shadow-xs"
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

          {/* TAB: CUSTOM CAKE INQUIRIES & STUDIO OPTIONS VIEW */}
          {activeTab === 'custom-cakes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Custom Cake Studio Management</h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Manage incoming bespoke customer requests, dynamic cake styles, sponge flavors, and frostings.
                  </p>
                </div>

                {/* Sub-tab Switcher */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setCustomCakesSubTab('inquiries')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      customCakesSubTab === 'inquiries'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>Inquiries Queue</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                      {cakeRequests.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomCakesSubTab('options')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      customCakesSubTab === 'options'
                        ? 'bg-[#E4007C] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Studio Styles &amp; Pricing</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        customCakesSubTab === 'options' ? 'bg-pink-700 text-white' : 'bg-pink-100 text-[#E4007C]'
                      }`}
                    >
                      {studioOptions.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* SUBTAB 1: INQUIRIES QUEUE */}
              {customCakesSubTab === 'inquiries' && (
                <div className="space-y-4">
                  {cakeRequests.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-sm">
                      <Cake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h3 className="text-base font-bold text-slate-700">No custom cake requests</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Requests submitted through the Custom Cake Studio will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cakeRequests.map((cake) => {
                        const refImage = cake.reference_image_urls?.[0];
                        const waReplyText = `Hi ${cake.customer_name}! Thank you for your custom cake inquiry #${cake.request_number} for ${cake.event_date}. We can create this ${cake.cake_type} for an estimated quotation of ₹${cake.quoted_price || 1200}. Would you like us to proceed? 🎂`;

                        const cakeStatus = cake.status || 'PENDING';
                        const statusBadgeColors: Record<string, string> = {
                          PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
                          CONFIRMED: 'bg-blue-50 text-blue-700 border border-blue-200',
                          BAKING: 'bg-pink-50 text-[#E4007C] border border-pink-200',
                          READY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
                          COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
                          CANCELLED: 'bg-slate-100 text-slate-600 border border-slate-200',
                        };

                        const cleanPhone = cake.customer_phone ? cake.customer_phone.replace(/\D/g, '') : '';
                        const hasValidPhone = cleanPhone.length >= 6;

                        return (
                          <div
                            key={cake.id}
                            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                  <span className="font-bold text-sm text-slate-900">
                                    #{cake.request_number}
                                  </span>
                                  <span className="text-[11px] text-slate-400 block">
                                    For: {cake.event_date} ({cake.delivery_slot})
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                      statusBadgeColors[cakeStatus] || statusBadgeColors.PENDING
                                    }`}
                                  >
                                    {cakeStatus}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteCakeRequest(cake.id, cake.request_number)}
                                    title="Delete inquiry"
                                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex gap-4 py-3">
                                {refImage && (
                                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-100">
                                    <Image
                                      src={refImage}
                                      alt="Reference Design"
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}

                                <div className="text-xs space-y-1">
                                  <p className="font-bold text-slate-900">{cake.customer_name} ({cake.customer_phone})</p>
                                  <p className="text-[#E4007C] font-semibold">{cake.cake_type}</p>
                                  <p className="text-slate-500">{cake.sponge_flavor} + {cake.filling_flavor}</p>
                                  <p className="text-slate-400 font-medium">
                                    {cake.tier_count} Tier(s) • Approx. {cake.estimated_weight_kg} kg
                                  </p>
                                  {cake.message_on_cake && (
                                    <p className="text-[11px] text-slate-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg inline-block font-medium mt-1">
                                      &ldquo;{cake.message_on_cake}&rdquo;
                                    </p>
                                  )}
                                </div>
                              </div>

                              {cake.special_instructions && (
                                <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 mb-3 border border-slate-100">
                                  <strong>Note:</strong> {cake.special_instructions}
                                </div>
                              )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                              <div>
                                <span className="text-[10px] text-slate-400 font-medium block">Quoted Price</span>
                                <span className="font-bold text-base text-slate-900">
                                  ₹{cake.quoted_price || 1200}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {/* WhatsApp Direct Reply */}
                                {hasValidPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waReplyText)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}

                                {/* Lifecycle / Complete Order Actions */}
                                {(cakeStatus === 'PENDING' || !cakeStatus) && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCakeStatus(cake.id, 'CONFIRMED')}
                                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                                    >
                                      Accept &amp; Confirm
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleConvertCakeToOrder(cake)}
                                      className="px-3 py-1.5 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                                      title="Convert to Live Kitchen Order and start baking"
                                    >
                                      <Flame className="w-3.5 h-3.5" />
                                      <span>Send to Oven</span>
                                    </button>
                                  </>
                                )}

                                {cakeStatus === 'CONFIRMED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCakeStatus(cake.id, 'BAKING')}
                                    className="px-3 py-1.5 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                                  >
                                    <Flame className="w-3.5 h-3.5" />
                                    <span>Start Baking</span>
                                  </button>
                                )}

                                {cakeStatus === 'BAKING' && (
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setActiveTab('orders')}
                                      className="px-3 py-1.5 rounded-xl bg-pink-50 text-[#E4007C] border border-pink-200 hover:bg-pink-100 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <span>View in Live Orders →</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateCakeStatus(cake.id, 'READY')}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      <span>Mark Ready</span>
                                    </button>
                                  </div>
                                )}

                                {cakeStatus === 'READY' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCakeStatus(cake.id, 'COMPLETED')}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Complete &amp; Deliver</span>
                                  </button>
                                )}

                                {cakeStatus === 'COMPLETED' && (
                                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Order Completed</span>
                                  </span>
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

              {/* SUBTAB 2: STUDIO OPTIONS (STYLES, SPONGES, FILLINGS) */}
              {customCakesSubTab === 'options' && (
                <div className="space-y-4">
                  {/* Filter & Action Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStudioFilterType('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          studioFilterType === 'all'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        All ({studioOptions.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudioFilterType('style')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          studioFilterType === 'style'
                            ? 'bg-[#E4007C] text-white'
                            : 'bg-pink-50 text-[#E4007C] hover:bg-pink-100'
                        }`}
                      >
                        Cake Styles ({studioOptions.filter((o) => o.type === 'style').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudioFilterType('sponge')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          studioFilterType === 'sponge'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        Sponge Flavors ({studioOptions.filter((o) => o.type === 'sponge').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudioFilterType('filling')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          studioFilterType === 'filling'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        Fillings &amp; Frostings ({studioOptions.filter((o) => o.type === 'filling').length})
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenCreateOption(studioFilterType === 'all' ? 'style' : studioFilterType)}
                      className="px-4 py-2 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-pink-500/20 transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  {/* Dynamic Sync Notice */}
                  <div className="bg-pink-50/60 border border-pink-200/70 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#E4007C]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-[#E4007C]" />
                      <span className="font-semibold">
                        All Custom Cake studio options are completely dynamic with instant Supabase live synchronization.
                      </span>
                    </div>
                    <span className="text-[11px] font-bold bg-[#FFE600] text-slate-900 px-2.5 py-0.5 rounded-full shrink-0">
                      Live Studio Sync
                    </span>
                  </div>

                  {/* Options Grid */}
                  {studioOptions.filter((o) => studioFilterType === 'all' || o.type === studioFilterType).length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-sm">
                      <Cake className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h3 className="text-base font-bold text-slate-700">No options found</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Click &ldquo;Add Option&rdquo; above to create dynamic cake styles, sponges, or fillings.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studioOptions
                        .filter((o) => studioFilterType === 'all' || o.type === studioFilterType)
                        .map((opt) => {
                          const typeBadge =
                            opt.type === 'style'
                              ? { label: 'Cake Style', cls: 'bg-pink-50 text-[#E4007C] border-pink-200' }
                              : opt.type === 'sponge'
                              ? { label: 'Sponge Flavor', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
                              : { label: 'Filling / Frosting', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

                          return (
                            <div
                              key={opt.id}
                              className={`bg-white p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                                opt.is_active
                                  ? 'border-slate-100 shadow-xs hover:shadow-md'
                                  : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeBadge.cls}`}
                                  >
                                    {typeBadge.label}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleOptionActive(opt)}
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                                        opt.is_active
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                      }`}
                                      title="Toggle Studio Visibility"
                                    >
                                      {opt.is_active ? '● Active' : '○ Inactive'}
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-3 space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                      {opt.name}
                                    </h4>
                                    {opt.is_eggless && (
                                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        🌱 Eggless
                                      </span>
                                    )}
                                  </div>

                                  {opt.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                      {opt.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                  {opt.type === 'style' || opt.base_price > 0 ? (
                                    <div className="flex items-baseline gap-1">
                                      <span className="text-[10px] text-slate-400 font-medium">Base</span>
                                      <span className="text-xs font-bold text-slate-900">
                                        ₹{opt.base_price}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-medium">Included</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditOption(opt)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Option"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStudioOption(opt)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Option"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: MENU INVENTORY CRUD VIEW */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Bakery Item Management (CRUD)
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Add new bakery items, update prices in ₹, edit sizes, manage pure veg indicators, or remove items.
                  </p>
                </div>

                <button
                  id="add-new-item-btn"
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2.5 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
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
                    placeholder="Search items by name..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  <button
                    onClick={() => setInventoryCategoryFilter('all')}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                      inventoryCategoryFilter === 'all'
                        ? 'bg-[#E4007C] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/60'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setInventoryCategoryFilter(c.id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                        inventoryCategoryFilter === c.id
                          ? 'bg-[#E4007C] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products List Cards */}
              <div className="divide-y divide-slate-100">
                {filteredInventoryProducts.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 font-medium">
                    No bakery items found matching your filter. Click &ldquo;Add New Bakery Item&rdquo; above!
                  </div>
                ) : (
                  filteredInventoryProducts.map((prod) => {
                    const cat = categories.find((c) => c.id === prod.category_id);
                    const sizes = Array.isArray(prod.available_sizes) ? (prod.available_sizes as any[]) : [];

                    return (
                      <div
                        key={prod.id}
                        className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-100">
                            {prod.images?.[0] ? (
                              <Image
                                src={prod.images[0]}
                                alt={prod.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#E4007C]">
                                <ChefHat className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              {prod.is_eggless && (
                                <span
                                  className="w-3.5 h-3.5 border border-[#15803D] flex items-center justify-center p-0.5 rounded-xs bg-white shrink-0"
                                  title="100% Pure Veg (Eggless)"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                                </span>
                              )}
                              <h3 className="text-sm font-bold text-slate-900 truncate">
                                {prod.name}
                              </h3>
                              {cat && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {cat.name}
                                </span>
                              )}
                              {prod.is_featured && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-[#E4007C] flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> Bestseller
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 font-normal line-clamp-1 max-w-lg">
                              {prod.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-2 text-xs pt-0.5">
                              <span className="font-bold text-slate-900">
                                ₹{Math.round(Number(prod.base_price))}
                              </span>
                              {sizes.length > 0 && (
                                <span className="text-[11px] text-slate-400">
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
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                              prod.is_available
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {prod.is_available ? '● In Stock' : '○ Sold Out'}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200/80 cursor-pointer"
                            title="Edit Item Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors border border-red-200 cursor-pointer"
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
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Customers &amp; Loyalty CRM
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Customer contact registry, order frequency, and lifetime bakery spend.
                  </p>
                </div>
                <button
                  onClick={exportCustomersCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CRM CSV</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  No customer records available yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
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
                        <p className="font-bold text-sm text-slate-900">{cust.name}</p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                          <span>{cust.phone}</span>
                          {cust.email && <span>• {cust.email}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-[#E4007C] block">
                          ₹{Math.round(cust.totalSpent).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400">
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

        {/* ITEM CREATE / EDIT MODAL (Clean, modern dialog) */}
        {isItemModalOpen && (
          <div
            id="item-crud-modal"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
          >
            <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8 relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-[#E4007C]">
                <Sparkles className="w-4 h-4" />
                {editingProduct ? 'Update Menu Item' : 'Create New Menu Item'}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Bakery Bake'}
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Rasmalai Cake"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs font-medium p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const catName = window.prompt('Enter new category name (e.g. Cupcakes, Cheesecakes):');
                          if (catName) handleCreateCategory(catName);
                        }}
                        className="text-[11px] font-semibold text-[#E4007C] hover:underline cursor-pointer"
                      >
                        + Add Category
                      </button>
                    </div>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full text-xs font-medium p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all"
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Base Price (₹ INR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="499"
                      value={formBasePrice}
                      onChange={(e) => setFormBasePrice(e.target.value ? Number(e.target.value) : '')}
                      className="w-full text-xs font-medium p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Dietary Type
                    </label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#15803D] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsEggless}
                          onChange={(e) => setFormIsEggless(e.target.checked)}
                          className="w-4 h-4 rounded-sm text-[#15803D] focus:ring-[#15803D]"
                        />
                        100% Pure Veg (Eggless)
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsVegan}
                          onChange={(e) => setFormIsVegan(e.target.checked)}
                          className="w-4 h-4 rounded-sm"
                        />
                        Vegan
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Description &amp; Ingredients
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Rich cardamom milk sponge soaked in rabdi cream, topped with Bengali rasmalai..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-xs font-normal p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full text-xs font-mono p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#E4007C] focus:bg-white transition-all mb-2"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
                      Presets:
                    </span>
                    {IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImageUrl(preset.url)}
                        className={`text-[10px] font-medium px-2.5 py-1 rounded-full border shrink-0 transition-colors cursor-pointer ${
                          formImageUrl === preset.url
                            ? 'bg-[#E4007C] text-white border-[#E4007C]'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Available Sizes &amp; Extra Price (₹)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormSizes([...formSizes, { label: '1.5 kg', extra_price: 650 }])
                      }
                      className="text-xs font-semibold text-[#E4007C] hover:text-[#D00070] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add Size
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
                          className="flex-1 text-xs font-medium p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500 font-medium">+₹</span>
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
                            className="w-24 text-xs font-medium p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                          />
                        </div>
                        {formSizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormSizes(formSizes.filter((_, i) => i !== index));
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"
                            title="Remove Size"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsAvailable}
                      onChange={(e) => setFormIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                    />
                    In Stock (Ready to Bake)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#E4007C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-[#E4007C] focus:ring-pink-500"
                    />
                    Feature on Homepage (Bestseller)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-5 py-2 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
                  >
                    {isSavingProduct ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingProduct ? 'Update Item' : 'Add Item'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: STUDIO OPTION CRUD (STYLES, SPONGES, FILLINGS) */}
        {isOptionModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 border border-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingOption ? 'Edit Studio Option' : 'Add Studio Option'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure styles, base prices, sponges, or frostings for Custom Cake Studio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOptionModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveStudioOption} className="space-y-4">
                {/* Option Type Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Option Category *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormOptType('style')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        formOptType === 'style'
                          ? 'bg-pink-50 border-[#E4007C] text-[#E4007C] shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Cake Style
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOptType('sponge')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        formOptType === 'sponge'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Sponge Flavor
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormOptType('filling')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                        formOptType === 'filling'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Filling / Frosting
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Option Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      formOptType === 'style'
                        ? 'e.g., Buttercream Floral & Textured'
                        : formOptType === 'sponge'
                        ? 'e.g., Belgian Dark Chocolate Truffle'
                        : 'e.g., Saffron Rabdi Infusion'
                    }
                    value={formOptName}
                    onChange={(e) => setFormOptName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#E4007C] focus:ring-1 focus:ring-[#E4007C]"
                  />
                </div>

                {/* Base Starting Price (specifically important for styles) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Base Starting Price (₹)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {formOptType === 'style' ? 'Starting base used in cake quotation formula' : 'Extra surcharge if any'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formOptBasePrice}
                      onChange={(e) => setFormOptBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#E4007C] focus:ring-1 focus:ring-[#E4007C]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description &amp; Aesthetic Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe piping details, toppings, visual aesthetic or ingredient highlights..."
                    value={formOptDesc}
                    onChange={(e) => setFormOptDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#E4007C] focus:ring-1 focus:ring-[#E4007C]"
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={formOptOrder}
                    onChange={(e) => setFormOptOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-[#E4007C] focus:ring-1 focus:ring-[#E4007C]"
                  />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 text-xs font-semibold text-emerald-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formOptIsEggless}
                      onChange={(e) => setFormOptIsEggless(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500"
                    />
                    🌱 Pure Vegetarian / Eggless
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-[#E4007C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formOptIsActive}
                      onChange={(e) => setFormOptIsActive(e.target.checked)}
                      className="w-4 h-4 rounded-sm text-[#E4007C] focus:ring-pink-500"
                    />
                    Active (Show in Studio)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOptionModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingOption}
                    className="px-5 py-2 rounded-xl bg-[#E4007C] hover:bg-[#D00070] text-white text-xs font-bold flex items-center gap-2 shadow-sm shadow-pink-500/20 transition-all cursor-pointer"
                  >
                    {isSavingOption ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingOption ? 'Update Option' : 'Add Option'}</>
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
