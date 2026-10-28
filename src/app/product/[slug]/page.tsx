'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Store,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Clock,
  Heart,
  ChevronRight,
  Info,
  Flame,
} from 'lucide-react';
import { useCart } from '../../../lib/cart';
import { getProductBySlugOrId, FALLBACK_PRODUCTS, type SizeOption } from '../../../lib/productsData';
import { getWhatsAppUrl } from '../../../lib/whatsapp';
import ProductCard from '../../../components/ProductCard';
import type { Product } from '../../../types/supabase';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const { addItem, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [cakeMessage, setCakeMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'storage'>('details');

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      if (slug) {
        const found = await getProductBySlugOrId(slug);
        if (found) {
          setProduct(found);
        } else {
          // If not found, fallback to first item
          setProduct(FALLBACK_PRODUCTS[0]);
        }
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [slug]);

  if (isLoading || !product) {
    return (
      <div className="py-24 bg-white text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#E4007C] border-t-transparent animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-black uppercase text-[#111111]">Loading Bakery Delights...</h2>
      </div>
    );
  }

  const sizes = (product.available_sizes as unknown as SizeOption[]) || [{ label: 'Standard', extra_price: 0 }];
  const currentSize = sizes[selectedSizeIndex] || sizes[0];
  const unitPrice = Number(product.base_price) + (currentSize?.extra_price || 0);
  const totalPrice = unitPrice * quantity;
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80'];
  const currentImage = images[selectedImageIndex] || images[0];

  const isCake = product.category_id === '11111111-1111-1111-1111-111111111111' || product.name.toLowerCase().includes('cake');

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity,
      selectedSize: currentSize.label,
      cakeMessage: cakeMessage.trim() || undefined,
      image: currentImage,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 600);
  };

  const whatsappInquiryUrl = getWhatsAppUrl(
    `Hi Sweet Delight Bakery! I want to order "${product.name}" (${currentSize.label}) with quantity: ${quantity}.${
      cakeMessage ? ` Custom message: "${cakeMessage}"` : ''
    } Is this available today?`
  );

  // Related products
  const relatedProducts = FALLBACK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="py-8 md:py-12 bg-white">
      <div className="container-custom">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs font-bold text-[#6B7280]">
          <Link href="/" className="hover:text-[#E4007C] transition-colors">
            HOME
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/catalogue" className="hover:text-[#E4007C] transition-colors">
            BAKERY MENU
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#111111] font-black uppercase truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-[#111111] bg-[#FFF0F6] shadow-[6px_6px_0px_#111111]">
              <Image
                src={currentImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                {product.is_eggless ? (
                  <span className="badge-eggless shadow-md">
                    <span className="w-2.5 h-2.5 border border-[#15803D] flex items-center justify-center p-0.5 rounded-xs bg-white shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                    </span>
                    100% PURE VEG
                  </span>
                ) : (
                  <span className="bg-[#FFE600] text-[#111111] border border-[#111111] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    Contains Egg
                  </span>
                )}
                {product.is_featured && (
                  <span className="bg-[#E4007C] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                    ★ Bestseller
                  </span>
                )}
                {product.is_vegan && (
                  <span className="badge-vegan shadow-md">🌱 Vegan</span>
                )}
                {product.is_gluten_free && (
                  <span className="badge-glutenfree shadow-md">🌾 Gluten-Free</span>
                )}
              </div>

              {/* Rating */}
              <div className="absolute bottom-4 right-4 bg-white/95 border-2 border-[#111111] px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 text-[#111111] shadow-md">
                <Star className="w-4 h-4 fill-[#FFE600] text-[#111111]" />
                <span>{product.rating || '4.9'}</span>
                <span className="text-[#6B7280] font-bold">(120+ reviews)</span>
              </div>
            </div>

            {/* Thumbnail switcher if multiple images exist */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx
                        ? 'border-[#E4007C] shadow-[3px_3px_0px_#E4007C]'
                        : 'border-[#111111] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Value Guarantees Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#F4F4F4] border border-[#111111]/20 text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 text-[#E4007C]" />
                <span className="text-[10px] font-black uppercase block text-[#111111]">Daily 5 AM Bake</span>
                <span className="text-[9px] text-[#6B7280] font-bold">Pure dairy butter</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F4F4] border border-[#111111]/20 text-center">
                <Truck className="w-5 h-5 mx-auto mb-1 text-[#111111]" />
                <span className="text-[10px] font-black uppercase block text-[#111111]">2-Hr Express</span>
                <span className="text-[9px] text-[#6B7280] font-bold">Doorstep delivery</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F4F4] border border-[#111111]/20 text-center">
                <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-[#15803D]" />
                <span className="text-[10px] font-black uppercase block text-[#111111]">100% Hygienic</span>
                <span className="text-[9px] text-[#6B7280] font-bold">FSSAI Certified</span>
              </div>
            </div>
          </div>

          {/* Right Column: Buying Options, Serves & Pricing */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111] text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E4007C]" />
                FRESH FROM OUR PASTRY LAB
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#111111] leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-[#4B5563] font-medium leading-relaxed mt-3">
                {product.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-[#FFF0F6] border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#E4007C] block">
                  PRICE (INCL. ALL TAXES)
                </span>
                <span className="text-3xl font-black text-[#111111] tracking-tight">
                  ₹{Math.round(unitPrice)}
                </span>
                {quantity > 1 && (
                  <span className="text-xs text-[#6B7280] font-bold ml-2">
                    (₹{Math.round(totalPrice)} for {quantity} items)
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#15803D] bg-[#DCFCE7] border border-[#15803D] px-2.5 py-1 rounded-full block">
                  {product.is_available ? '● Freshly in Stock' : '○ Sold Out'}
                </span>
              </div>
            </div>

            {/* Serves & Size Portion Selector */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#111111] uppercase tracking-wider">
                  Select Portion &amp; Serves:
                </label>
                <span className="text-[10px] text-[#E4007C] font-black uppercase">
                  {currentSize.label}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sizes.map((s, idx) => {
                  const isSelected = selectedSizeIndex === idx;
                  const itemPrice = Number(product.base_price) + (s.extra_price || 0);

                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setSelectedSizeIndex(idx)}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#E4007C] bg-[#FFF0F6] shadow-[3px_3px_0px_#E4007C]'
                          : 'border-[#111111] bg-white hover:bg-[#F4F4F4]'
                      }`}
                    >
                      <div>
                        <p className="font-black text-xs uppercase text-[#111111]">{s.label}</p>
                        <p className="text-[10px] text-[#6B7280] font-bold">
                          {s.extra_price > 0 ? `+₹${s.extra_price}` : 'Base standard size'}
                        </p>
                      </div>
                      <span className="text-xs font-black text-[#111111]">
                        ₹{Math.round(itemPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Cake Piping Text Inscription Input (For celebration cakes) */}
            {isCake && (
              <div className="p-4 rounded-xl bg-[#F4F4F4] border-2 border-[#111111]">
                <button
                  type="button"
                  onClick={() => setShowMessageInput(!showMessageInput)}
                  className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#111111] hover:text-[#E4007C] transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#E4007C]" />
                    {showMessageInput ? 'Hide Piping Inscription' : '+ Add Custom Message Piping on Cake'}
                  </span>
                  <span className="text-[10px] font-black text-[#E4007C]">Free of Charge</span>
                </button>

                {showMessageInput && (
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      maxLength={35}
                      placeholder="e.g. Happy 25th Birthday Rhea! 🌸"
                      value={cakeMessage}
                      onChange={(e) => setCakeMessage(e.target.value)}
                      className="w-full text-xs font-bold p-3 rounded-xl bg-white border-2 border-[#111111] focus:outline-none focus:border-[#E4007C]"
                    />
                    <div className="flex justify-between text-[10px] text-[#6B7280] font-bold">
                      <span>Piped in chef&apos;s chocolate ganache or tinted cream</span>
                      <span>{cakeMessage.length}/35 characters</span>
                    </div>

                    {cakeMessage && (
                      <div className="p-3 rounded-lg bg-[#111111] text-[#FFE600] text-center font-black uppercase tracking-wider text-xs border border-[#E4007C]">
                        Board Plaque: &ldquo;{cakeMessage}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-3 pt-2 border-t-2 border-[#111111]/10">
              <div className="flex items-center gap-3">
                {/* Quantity Buttons */}
                <div className="flex items-center gap-2 bg-[#F4F4F4] border-2 border-[#111111] rounded-full px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="text-[#111111] hover:text-[#E4007C] p-1 font-black disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-black w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="text-[#111111] hover:text-[#E4007C] p-1 font-black"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Add to Box Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.is_available}
                  className={`flex-1 py-3.5 px-6 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all shadow-md ${
                    !product.is_available
                      ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                      : isAdded
                      ? 'bg-[#00E5A3] text-[#111111] border-[#111111]'
                      : 'bg-[#E4007C] hover:bg-[#111111] text-white border-[#E4007C] hover:border-[#111111]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>ADDED TO BOX! 🎉</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO BOX • ₹{Math.round(totalPrice)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Quick Order Button */}
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp w-full !py-3 text-xs flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ORDER ON WHATSAPP DIRECTLY</span>
              </a>
            </div>

            {/* Delivery Info Snippets */}
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#111111]/20 space-y-2 text-xs font-medium text-[#6B7280]">
              <div className="flex items-center gap-2 text-[#111111] font-bold">
                <Truck className="w-4 h-4 text-[#E4007C]" />
                <span>Standard Delivery (₹60) • FREE over ₹1,000</span>
              </div>
              <div className="flex items-center gap-2 text-[#111111] font-bold">
                <Store className="w-4 h-4 text-[#15803D]" />
                <span>Bakery Pickup at Bandra West (FREE)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details, Ingredients & Storage Tabs */}
        <div className="mt-16 pt-12 border-t-2 border-[#111111]">
          <div className="flex border-b-2 border-[#111111] gap-2 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-5 text-xs font-black uppercase tracking-wider border-b-4 transition-all ${
                activeTab === 'details'
                  ? 'border-[#E4007C] text-[#E4007C]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              Flavor &amp; Details
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-3 px-5 text-xs font-black uppercase tracking-wider border-b-4 transition-all ${
                activeTab === 'ingredients'
                  ? 'border-[#E4007C] text-[#E4007C]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              Ingredients &amp; Allergens
            </button>
            <button
              onClick={() => setActiveTab('storage')}
              className={`pb-3 px-5 text-xs font-black uppercase tracking-wider border-b-4 transition-all ${
                activeTab === 'storage'
                  ? 'border-[#E4007C] text-[#E4007C]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              Storage &amp; Serving Guide
            </button>
          </div>

          {/* TAB 1: FLAVOR & DETAILS */}
          {activeTab === 'details' && (
            <div className="bg-[#FFF0F6] p-6 md:p-8 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#111111]">
                ABOUT THIS ARTISAN CREATION
              </h3>
              <p className="text-sm text-[#4B5563] font-medium leading-relaxed">
                {product.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#111111]/10">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                    Portion Servings Guide:
                  </h4>
                  <ul className="text-xs text-[#6B7280] space-y-1 font-medium">
                    {sizes.map((s) => (
                      <li key={s.label}>
                        • <strong className="text-[#111111]">{s.label}:</strong> Handcrafted to perfection.
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#111111] mb-1">
                    Kitchen Certification:
                  </h4>
                  <p className="text-xs text-[#6B7280] font-medium leading-relaxed">
                    {product.is_eggless
                      ? 'Prepared in our dedicated pure-vegetarian / eggless bakery section with separate utensils and ovens.'
                      : 'Prepared using farm-fresh eggs and pure dairy butter.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <div className="bg-[#FFFDE0] p-6 md:p-8 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#111111]">
                PURE INGREDIENTS BREAKDOWN
              </h3>
              <p className="text-xs text-[#6B7280] font-semibold">
                We believe in complete transparency. Every component is sourced from certified artisan producers.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div>
                  <h4 className="text-xs font-black uppercase text-[#111111] mb-2">Key Ingredients:</h4>
                  <ul className="text-xs text-[#111111] space-y-1.5 font-bold">
                    <li>✓ Pure Amul Butter &amp; Dairy Cream</li>
                    <li>✓ Unbleached Stoneground Flour</li>
                    <li>✓ High-Grade Couverture Chocolate &amp; Spices</li>
                    <li>✓ Zero palm oil, zero chemical additives</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-[#E4007C] mb-2">Allergen Notice:</h4>
                  <p className="text-xs text-[#111111] font-medium leading-relaxed bg-white p-3 rounded-xl border border-[#111111]">
                    Contains dairy and wheat gluten. Made in a bakery facility that also handles almonds, pistachios, and cashews.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STORAGE */}
          {activeTab === 'storage' && (
            <div className="bg-[#E6FCF5] p-6 md:p-8 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-[#111111]">
                OPTIMAL STORAGE &amp; SERVING INSTRUCTIONS
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#111111] font-medium leading-relaxed">
                <div className="bg-white p-4 rounded-xl border border-[#111111]">
                  <strong className="block font-black uppercase text-[#065F46] mb-1">Storage Guide:</strong>
                  Refrigerate between 2°C – 5°C. Keep covered inside the bakery box to prevent moisture loss. Consume within 3-4 days of receipt.
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#111111]">
                  <strong className="block font-black uppercase text-[#065F46] mb-1">Serving Tip:</strong>
                  For chocolate cakes and mawa loaves, bring to room temperature 15 minutes before serving for maximum aroma and texture.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Products Recommendation */}
        <div className="mt-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E4007C] block mb-1">
                PAIR WITH SOMETHING SWEET
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#111111]">
                MORE FRESH BAKES YOU&apos;LL LOVE
              </h2>
            </div>
            <Link href="/catalogue" className="btn-secondary !py-2 !px-4 text-xs font-black">
              View All Bakes
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
