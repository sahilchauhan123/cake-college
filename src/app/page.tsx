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
  ShieldCheck,
  Truck,
  ChefHat,
  MessageCircle,
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
    <div className="bg-[#FDFBF7] overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-24 border-b border-[#E8DDD2]">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                Fresh Morning Bake Every Day at 5:00 AM
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#231815] leading-[1.12] tracking-tight">
                Artisan Pastries &amp; Bespoke Celebration Cakes
              </h1>

              <p className="text-base sm:text-lg text-[#7E6C65] max-w-xl leading-relaxed">
                Experience the magic of traditional French baking techniques paired with Belgian chocolate, cultured Normandy butter, and seasonal organic fruits.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href="/catalogue" className="btn-primary !py-3.5 !px-8 text-sm">
                  <span>Explore Fresh Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link href="/custom-cake" className="btn-gold !py-3.5 !px-8 text-sm">
                  <Cake className="w-4 h-4" />
                  <span>Design Custom Cake</span>
                </Link>

                <a
                  href={getWhatsAppUrl('Hi Sweet Delight! I would like to place an order.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-3.5 !px-6 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Order</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#F2EBE3] grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-serif text-xl font-bold text-[#231815] block">100%</span>
                  <span className="text-[#7E6C65]">Pure Butter &amp; Natural</span>
                </div>
                <div>
                  <span className="font-serif text-xl font-bold text-[#231815] block">48 Hours</span>
                  <span className="text-[#7E6C65]">Custom Cake Turnaround</span>
                </div>
                <div>
                  <span className="font-serif text-xl font-bold text-[#231815] block flex items-center gap-1">
                    4.9 <Star className="w-4 h-4 fill-[#D97706] text-[#D97706]" />
                  </span>
                  <span className="text-[#7E6C65]">2,500+ Happy Customers</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85"
                  alt="Artisan Belgian Chocolate Cake"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-white shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF4EB] flex items-center justify-center text-[#8B4513]">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#231815]">Belgian Dark Chocolate Truffle</p>
                      <p className="text-[11px] text-[#15803D] font-semibold">100% Eggless Option Available</p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-base text-[#8B4513]">$28.00</span>
                </div>
              </div>

              {/* Floating Pill Top Right */}
              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-[#E8DDD2] flex items-center gap-2.5 floating-anim">
                <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[#231815]">Fresh at Dawn</p>
                  <p className="text-[9px] text-[#7E6C65]">Slow cold fermentation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PILLARS */}
      <section className="py-12 bg-[#FAF4EB] border-b border-[#E8DDD2]">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E8DDD2] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F7EFE8] flex items-center justify-center text-[#8B4513] shrink-0">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#231815]">Master Patissiers</h2>
                <p className="text-xs text-[#7E6C65]">French heritage artisan recipes</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E8DDD2] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309] shrink-0">
                <Cake className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#231815]">Custom Tier Cakes</h2>
                <p className="text-xs text-[#7E6C65]">Personalized for your celebrations</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E8DDD2] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#231815]">Dietary Inclusive</h2>
                <p className="text-xs text-[#7E6C65]">Eggless, vegan &amp; gluten-free choices</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E8DDD2] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-[#0284C7] shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#231815]">Chilled Delivery</h2>
                <p className="text-xs text-[#7E6C65]">Careful packaging to your doorstep</p>
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Artisan Favorites
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-[#231815]">
                Signature Bestsellers
              </h2>
              <p className="text-xs md:text-sm text-[#7E6C65] mt-1">
                Handcrafted daily in small batches to preserve peak aroma and taste.
              </p>
            </div>

            <Link href="/catalogue" className="btn-secondary !py-2.5 !px-5 text-xs font-bold self-start md:self-auto">
              <span>View All 20+ Bakes</span>
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

      {/* 4. CUSTOM CAKE STUDIO CALLOUT */}
      <section className="py-16 bg-gradient-to-br from-[#231815] to-[#42312C] text-white relative">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="px-3 py-1 rounded-full bg-[#D97706] text-white text-xs font-bold uppercase tracking-widest">
                Interactive Cake Studio
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                Celebrate Moments With a Bespoke Cake Designed by You
              </h2>
              <p className="text-sm sm:text-base text-[#D5C7BC] max-w-lg leading-relaxed">
                Select your favorite sponge, gourmet chocolate or fruit ganache filling, number of tiers, customized plaque inscription, and upload your Pinterest or Instagram reference image!
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/custom-cake" className="btn-gold !py-3.5 !px-8 text-sm">
                  <Cake className="w-4 h-4" />
                  <span>Start Customizing Now</span>
                </Link>

                <a
                  href={getWhatsAppUrl('Hi! I would like to consult with your cake designer about a custom cake.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-3.5 !px-6 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consult on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80"
                alt="Bespoke multi-tier custom cake"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="container-custom">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#B45309]">
              Loved by Foodies
            </span>
            <h2 className="font-serif text-3xl font-extrabold text-[#231815] mt-1">
              Words From Our Cake Lovers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-[#D97706] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#42312C] leading-relaxed italic">
                  &ldquo;The Belgian Dark Chocolate Truffle was the absolute star of my daughter&apos;s birthday. The eggless texture was remarkably rich and fluffy. Ordering via WhatsApp was seamless!&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2EBE3]">
                <p className="font-serif font-bold text-sm text-[#231815]">Ananya Sharma</p>
                <p className="text-[11px] text-[#7E6C65]">Birthday Celebration Order</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-[#D97706] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#42312C] leading-relaxed italic">
                  &ldquo;I designed a 2-tier rustic floral cake for our wedding anniversary using their custom cake studio. It arrived exactly on time and looked even better than the reference photo I uploaded!&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2EBE3]">
                <p className="font-serif font-bold text-sm text-[#231815]">David &amp; Rachel</p>
                <p className="text-[11px] text-[#7E6C65]">Custom 2-Tier Anniversary Cake</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8DDD2] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex text-[#D97706] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#42312C] leading-relaxed italic">
                  &ldquo;Their country sourdough and almond croissants are part of our weekend ritual. Fresh Normandy butter aroma when you open the box. Highly recommended!&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F2EBE3]">
                <p className="font-serif font-bold text-sm text-[#231815]">Marcus Chen</p>
                <p className="text-[11px] text-[#7E6C65]">Weekly Morning Bake Club</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
