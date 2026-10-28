'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '../types/supabase';

export default function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';
  const productUrl = `/product/${product.slug || product.id}`;

  return (
    <div className="bg-white rounded-2xl border-2 border-[#111111] overflow-hidden hover:shadow-[6px_6px_0px_#111111] transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Product Media with Clickable Link */}
        <Link href={productUrl} className="block relative aspect-[4/3] overflow-hidden bg-[#FFF0F6] border-b-2 border-[#111111]">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
            {product.is_eggless ? (
              <span className="badge-eggless shadow-sm">
                <span className="w-2.5 h-2.5 border border-[#15803D] flex items-center justify-center p-0.5 rounded-xs bg-white shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                </span>
                100% Veg
              </span>
            ) : (
              <span className="bg-[#FFE600] text-[#111111] border border-[#111111] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                Contains Egg
              </span>
            )}
            {product.is_featured && (
              <span className="bg-[#E4007C] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                ★ Bestseller
              </span>
            )}
            {product.is_vegan && (
              <span className="badge-vegan shadow-sm">🌱 Vegan</span>
            )}
            {product.is_gluten_free && (
              <span className="badge-glutenfree shadow-sm">🌾 Gluten-Free</span>
            )}
          </div>

          {/* Rating Pill */}
          <div className="absolute bottom-3 right-3 bg-white/95 border border-[#111111] px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 text-[#111111] shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#FFE600] text-[#111111]" />
            <span>{product.rating || '4.9'}</span>
          </div>
        </Link>

        {/* Content */}
        <div className="p-5">
          <Link href={productUrl} className="block group-hover:text-[#E4007C] transition-colors">
            <h3 className="font-extrabold text-base sm:text-lg text-[#111111] uppercase tracking-tight leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Starting Price & View Details Link */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-[#111111]/10 mt-2 pt-4">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-[#6B7280] block">Starting from</span>
          <span className="text-lg sm:text-xl font-black text-[#111111] tracking-tight">
            ₹{Math.round(Number(product.base_price))}
          </span>
        </div>

        <Link
          href={productUrl}
          className="btn-primary !py-2.5 !px-4 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm group-hover:bg-[#111111] transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
