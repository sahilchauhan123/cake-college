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
import type { Product } from '../types/supabase';
import { getWhatsAppUrl } from '../lib/whatsapp';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(4);

        if (data && data.length > 0) {
          setFeaturedProducts(data);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);

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
                100% PURE VEG (EGGLESS) AVAILABLE • BAKED FRESH DAILY
              </div>

              <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#111111] leading-[1.08] tracking-tighter uppercase">
                Handcrafted Celebration Cakes &amp; Fresh Dessert Lab
              </h1>

              <p className="text-base sm:text-lg text-[#4B5563] max-w-xl leading-relaxed font-medium">
                Celebrate birthdays, anniversaries, and festivities with our signature Dutch Truffles, Royal Rasmalai cakes, and warm spiced puffs. Baked fresh every morning with pure butter.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/catalogue" className="btn-primary !py-4 !px-8 text-xs font-black tracking-wider">
                  <span>EXPLORE FRESH MENU</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link href="/custom-cake" className="btn-gold !py-4 !px-8 text-xs font-black tracking-wider">
                  <Cake className="w-4 h-4" />
                  <span>DESIGN CUSTOM CAKE</span>
                </Link>

                <a
                  href={getWhatsAppUrl('Namaste Sweet Delight! I would like to place an order.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-4 !px-6 text-xs font-black tracking-wider"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WHATSAPP ORDER</span>
                </a>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 border-t-2 border-[#111111]/10 grid grid-cols-3 gap-4 text-xs">
                <div className="border-r border-[#111111]/10 pr-2">
                  <span className="text-xl font-black text-[#15803D] uppercase block tracking-tight">100% VEG</span>
                  <span className="text-[#6B7280] font-bold text-[11px]">Pure Veg Kitchen</span>
                </div>
                <div className="border-r border-[#111111]/10 pr-2">
                  <span className="text-xl font-black text-[#111111] uppercase block tracking-tight">2 HOURS</span>
                  <span className="text-[#6B7280] font-bold text-[11px]">Express Local Delivery</span>
                </div>
                <div>
                  <span className="text-xl font-black text-[#E4007C] uppercase block tracking-tight flex items-center gap-1">
                    4.9 <Star className="w-4 h-4 fill-[#FFE600] text-[#111111]" />
                  </span>
                  <span className="text-[#6B7280] font-bold text-[11px]">5,000+ Celebrations</span>
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
                      <p className="font-black text-xs uppercase tracking-tight text-[#111111]">Royal Rasmalai Tres Leches</p>
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
                  <p className="text-[9px] text-[#111111]/80 font-bold">Pure Butter &amp; Belgian Cocoa</p>
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
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">100% Pure Veg Options</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">Certified eggless kitchen facility</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-2 border-[#111111] flex items-center justify-center text-[#111111] shrink-0">
                <Cake className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">Custom Celebration Cakes</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">Birthdays, Anniversaries &amp; Weddings</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <div className="w-12 h-12 rounded-xl bg-[#FFE5F0] border-2 border-[#E4007C] flex items-center justify-center text-[#E4007C] shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">Indian Fusion Specials</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">Rasmalai, Gulab Jamun &amp; Mawa Cakes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
              <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] border-2 border-[#0284C7] flex items-center justify-center text-[#0284C7] shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#111111]">Instant UPI &amp; COD</h2>
                <p className="text-[11px] text-[#6B7280] font-semibold">GPay, PhonePe, Paytm &amp; Doorstep Cash</p>
              </div>
            </div>
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
                BAKERY FAVORITES
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#111111]">
                SIGNATURE BESTSELLERS
              </h2>
              <p className="text-xs md:text-sm text-[#6B7280] mt-1 font-medium">
                Handcrafted daily in small batches to preserve peak aroma and taste.
              </p>
            </div>

            <Link href="/catalogue" className="btn-secondary !py-2.5 !px-5 text-xs font-black self-start md:self-auto">
              <span>VIEW ALL 20+ BAKES</span>
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
                Browse Complete Catalogue
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
                INTERACTIVE CAKE LAB
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
                CELEBRATE MOMENTS WITH A BESPOKE CAKE DESIGNED BY YOU
              </h2>
              <p className="text-sm sm:text-base text-[#A1A1AA] max-w-lg leading-relaxed font-medium">
                Select your favorite sponge, gourmet chocolate or fruit ganache filling, number of tiers, customized plaque inscription, and upload your Pinterest or Instagram reference image!
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/custom-cake" className="btn-gold !py-3.5 !px-8 text-xs font-black">
                  <Cake className="w-4 h-4" />
                  <span>START CUSTOMIZING NOW</span>
                </Link>

                <a
                  href={getWhatsAppUrl('Hi! I would like to consult with your cake designer about a custom cake.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-3.5 !px-6 text-xs font-black"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>CONSULT ON WHATSAPP</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border-2 border-white shadow-[8px_8px_0px_#E4007C]">
              <Image
                src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80"
                alt="Bespoke multi-tier custom cake"
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
              LOVED BY FOODIES
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight text-[#111111] mt-3">
              WORDS FROM OUR CAKE LOVERS
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
