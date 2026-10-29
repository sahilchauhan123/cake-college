'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Cake,
  ArrowRight,
  Star,
  Clock,
  Heart,
  Truck,
  MessageCircle,
  Flame,
  Zap,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import type { Product, Category } from '../types/supabase';
import { getWhatsAppUrl } from '../lib/whatsapp';

const DEFAULT_HOME_CATEGORIES = [
  {
    id: '1',
    name: 'Celebration Cakes',
    slug: 'cakes',
    description: 'Belgian chocolate truffle, red velvet & fruit cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    itemCount: 'Cakes',
  },
  {
    id: '2',
    name: 'Indian Fusion',
    slug: 'fusion',
    description: 'Rasmalai, Gulab Jamun & Kesar Pista specials',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
    itemCount: 'Fusion',
  },
  {
    id: '3',
    name: 'Pastries & Mawa',
    slug: 'pastries',
    description: 'Irani mawa loaves, tarts & delicate pastries',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    itemCount: 'Treats',
  },
  {
    id: '4',
    name: 'Artisan Breads',
    slug: 'breads',
    description: 'Slow-fermented sourdough & soft dinner pav',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    itemCount: 'Breads',
  },
  {
    id: '5',
    name: 'Savory Puffs',
    slug: 'savory',
    description: 'Crispy spiced paneer tikka puffs & snacks',
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=600&q=80',
    itemCount: 'Snacks',
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_featured', true).limit(4),
          supabase.from('categories').select('*').order('display_order', { ascending: true }),
        ]);

        if (prodRes.data && prodRes.data.length > 0) {
          setFeaturedProducts(prodRes.data);
        }
        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const displayCategories = categories.length > 0
    ? categories.map((c) => {
        const match = DEFAULT_HOME_CATEGORIES.find((d) => d.slug === c.slug);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || match?.description || 'Handcrafted fresh daily',
          image: match?.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
          itemCount: match?.itemCount || 'Menu',
        };
      })
    : DEFAULT_HOME_CATEGORIES;

  return (
    <div className="bg-white overflow-hidden">
      {/* 1. MILK BAR STYLE HERO SECTION */}
      <section className="relative pt-10 pb-16 md:py-20 border-b-2 border-[#111111]">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE600] text-[#111111] text-[11px] font-black tracking-wider uppercase border border-[#111111] shadow-[2px_2px_0px_#111111]">
                <span className="w-2 h-2 rounded-full bg-[#E4007C] inline-block animate-ping" />
                100% EGGLESS AVAILABLE • BAKED FRESH DAILY
              </div>

              <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#111111] leading-[1.08] tracking-tighter uppercase">
                Fresh Cakes &amp; Treats Baked Daily
              </h1>

              <p className="text-base sm:text-lg text-[#4B5563] max-w-xl leading-relaxed font-medium">
                Delicious birthday cakes, rich chocolate bakes, and savory treats made every morning with pure butter and real ingredients.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/catalogue" className="btn-primary !py-4 !px-8 text-xs font-black tracking-wider">
                  <span>EXPLORE MENU</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link href="/custom-cake" className="btn-gold !py-4 !px-8 text-xs font-black tracking-wider">
                  <Cake className="w-4 h-4" />
                  <span>CUSTOM CAKE</span>
                </Link>

                <a
                  href={getWhatsAppUrl('Hi Sweet Delight! I would like to order a fresh cake.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-4 !px-6 text-xs font-black tracking-wider"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ORDER ON WHATSAPP</span>
                </a>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 border-t-2 border-[#111111]/10 grid grid-cols-3 gap-4 text-xs">
                <div className="border-r border-[#111111]/10 pr-2">
                  <span className="text-xl font-black text-[#15803D] uppercase block tracking-tight">100% VEG</span>
                  <span className="text-[#6B7280] font-bold text-[11px]">Eggless Kitchen</span>
                </div>
                <div className="border-r border-[#111111]/10 pr-2">
                  <span className="text-xl font-black text-[#111111] uppercase block tracking-tight">2 HOURS</span>
                  <span className="text-[#6B7280] font-bold text-[11px]">Fast Delivery</span>
                </div>
                <div>
                  <span className="text-xl font-black text-[#E4007C] uppercase block tracking-tight flex items-center gap-1">
                    4.9 <Star className="w-4 h-4 fill-[#FFE600] text-[#111111]" />
                  </span>
                  <span className="text-[#6B7280] font-bold text-[11px]">5,000+ Happy Customers</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Showcase with Milk Bar stickers */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-2 border-[#111111] shadow-[8px_8px_0px_#111111]">
                <Image
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"
                  alt="Dutch Chocolate Truffle Cake"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Floating Bottom Card */}
                <div className="absolute bottom-5 left-5 right-5 bg-white p-3.5 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#DCFCE7] border border-[#15803D] flex items-center justify-center text-[#15803D] shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-tight text-[#111111]">Rasmalai Tres Leches</p>
                      <p className="text-[10px] text-[#15803D] font-extrabold uppercase">100% Eggless • Saffron &amp; Pistachio</p>
                    </div>
                  </div>
                  <span className="font-black text-base text-[#E4007C]">₹649</span>
                </div>
              </div>

              {/* Milk Bar Floating Sticker Tag */}
              <div className="absolute -top-3 -right-3 bg-[#FFE600] p-3 rounded-2xl shadow-[4px_4px_0px_#111111] border-2 border-[#111111] flex items-center gap-2 floating-anim">
                <div className="w-8 h-8 rounded-full bg-[#E4007C] text-white flex items-center justify-center font-black">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase text-[#111111]">FRESH DAILY</p>
                  <p className="text-[9px] text-[#111111]/80 font-bold">Pure Butter &amp; Rich Cocoa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PILLARS (Milk Bar Bodega Perks) */}
      <section className="py-12 bg-[#FFF0F6] border-b-2 border-[#111111]">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] border-2 border-[#15803D] flex items-center justify-center text-[#15803D] shrink-0">
                <span className="w-4 h-4 border-2 border-[#15803D] flex items-center justify-center p-0.5 rounded-sm bg-white">
                  <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                </span>
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">100% Pure Veg</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">Certified eggless options</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-2 border-[#111111] flex items-center justify-center text-[#111111] shrink-0">
                <Cake className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">Custom Cakes</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">Any flavor, theme or photo</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <div className="w-12 h-12 rounded-xl bg-[#FFE5F0] border-2 border-[#E4007C] flex items-center justify-center text-[#E4007C] shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">Signature Flavors</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">Rasmalai, Truffle &amp; Mawa</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] border-2 border-[#0284C7] flex items-center justify-center text-[#0284C7] shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">Easy Payments</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">UPI, Cards &amp; Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 SHOP BY CATEGORY */}
      <section className="py-14 md:py-20 bg-white border-b-2 border-[#111111]">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111] text-[10px] font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#111111]">
                <Sparkles className="w-3.5 h-3.5 text-[#E4007C]" />
                OUR SPECIALTIES
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111111]">
                SHOP BY CATEGORY
              </h2>
              <p className="text-xs md:text-sm text-[#6B7280] mt-1 font-medium">
                From celebration cakes to warm savory puffs, find your favorite daily bake.
              </p>
            </div>

            <Link href="/catalogue" className="btn-secondary !py-2.5 !px-5 text-xs font-black self-start md:self-auto">
              <span>EXPLORE ALL</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {displayCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogue?category=${cat.slug}`}
                className="group flex flex-col rounded-2xl border-2 border-[#111111] bg-white overflow-hidden hover:shadow-[6px_6px_0px_#111111] hover:-translate-y-1 transition-all duration-200"
              >
                <div className="relative aspect-square overflow-hidden bg-[#FFF0F6] border-b-2 border-[#111111]">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-[#FFE600] border border-[#111111] text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs text-[#111111]">
                    {cat.itemCount || 'View'}
                  </div>
                </div>
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-[#111111] uppercase tracking-tight group-hover:text-[#E4007C] transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-[#6B7280] font-medium mt-1 line-clamp-2 leading-tight">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#111111]/10 flex items-center justify-between text-[11px] font-black text-[#E4007C]">
                    <span>EXPLORE</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BESTSELLERS SHOWCASE */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111] text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#E4007C]" />
                POPULAR
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111111]">
                OUR BESTSELLERS
              </h2>
              <p className="text-xs md:text-sm text-[#6B7280] mt-1 font-medium">
                Our most loved cakes and treats, fresh from the oven.
              </p>
            </div>

            <Link href="/catalogue" className="btn-secondary !py-2.5 !px-5 text-xs font-black self-start md:self-auto">
              <span>VIEW ALL BAKES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Link href="/catalogue" className="btn-primary">
                Browse Complete Menu
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. CUSTOM CAKE STUDIO CALLOUT (Milk Bar Style Pink/Black Lab) */}
      <section className="py-16 md:py-20 bg-[#111111] text-white border-y-2 border-[#111111] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-[#E4007C]/20 blur-3xl pointer-events-none" />
        <div className="container-custom relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="px-3 py-1 rounded-full bg-[#E4007C] text-white text-[11px] font-black uppercase tracking-widest border border-white/20">
                CUSTOM CAKES
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                CREATE YOUR DREAM CAKE
              </h2>
              <p className="text-sm sm:text-base text-[#A1A1AA] max-w-lg leading-relaxed font-medium">
                Pick your flavor, fillings, size, and custom message. Share any photo reference from Pinterest or Instagram and we will bake it fresh for your celebration.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/custom-cake" className="btn-gold !py-3.5 !px-8 text-xs font-black">
                  <Cake className="w-4 h-4" />
                  <span>CUSTOMIZE CAKE</span>
                </Link>

                <a
                  href={getWhatsAppUrl('Hi! I would like to order a custom cake.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-3.5 !px-6 text-xs font-black"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CHAT ON WHATSAPP</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-white shadow-[8px_8px_0px_#E4007C]">
              <Image
                src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80"
                alt="Custom celebratory cake"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E4007C] bg-[#FFF0F6] border border-[#E4007C]/30 px-3 py-1 rounded-full">
              REVIEWS
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-3">
              WHAT OUR CUSTOMERS SAY
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col justify-between">
              <div>
                <div className="flex text-[#FFE600] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current stroke-[#111111]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#242424] leading-relaxed italic font-medium">
                  &ldquo;The Royal Rasmalai Cake was the absolute highlight of my mother&apos;s 50th birthday party in Bandra! So moist, infused with real saffron rabdi, and 100% pure veg. Everyone loved it!&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#111111]/10">
                <p className="font-black text-xs uppercase text-[#111111]">Priya Sharma</p>
                <p className="text-[10px] text-[#6B7280] font-bold">Bandra West, Mumbai</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col justify-between">
              <div>
                <div className="flex text-[#FFE600] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current stroke-[#111111]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#242424] leading-relaxed italic font-medium">
                  &ldquo;We customized a 2-tier peacock motif cake for our Roka ceremony in Indiranagar. Uploaded the reference photo on their website and confirmed details on WhatsApp. Truly world-class quality!&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#111111]/10">
                <p className="font-black text-xs uppercase text-[#111111]">Rohan &amp; Ananya</p>
                <p className="text-[10px] text-[#6B7280] font-bold">Indiranagar, Bengaluru</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col justify-between">
              <div>
                <div className="flex text-[#FFE600] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current stroke-[#111111]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#242424] leading-relaxed italic font-medium">
                  &ldquo;Their Dutch Chocolate Truffle is our office birthday ritual in Cyber City. Best part is the instant UPI payment via Google Pay and guaranteed on-time delivery.&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#111111]/10">
                <p className="font-black text-xs uppercase text-[#111111]">Vikram Malhotra</p>
                <p className="text-[10px] text-[#6B7280] font-bold">Gurugram, Delhi NCR</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
