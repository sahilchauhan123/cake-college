'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Plus, Check, MessageSquare } from 'lucide-react';
import { useCart } from '../lib/cart';
import type { Product } from '../types/supabase';

interface SizeOption {
  label: string;
  extra_price: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const sizes = (product.available_sizes as unknown as SizeOption[]) || [{ label: 'Standard', extra_price: 0 }];

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [cakeMessage, setCakeMessage] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);

  const currentSize = sizes[selectedSizeIndex] || sizes[0];
  const currentPrice = Number(product.base_price) + (currentSize?.extra_price || 0);
  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80';

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice,
      quantity: 1,
      selectedSize: currentSize.label,
      cakeMessage: cakeMessage.trim() || undefined,
      image: primaryImage,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const isCake = product.category_id === '11111111-1111-1111-1111-111111111111' || product.name.toLowerCase().includes('cake');

  return (
    <div className="bg-white rounded-3xl border border-[#E8DDD2] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Product Media & Dietary Badges */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF4EB]">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {product.is_eggless && (
              <span className="badge-eggless shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                100% Eggless
              </span>
            )}
            {product.is_vegan && (
              <span className="badge-vegan shadow-sm">🌱 Vegan</span>
            )}
            {product.is_gluten_free && (
              <span className="badge-glutenfree shadow-sm">🌾 Gluten-Free</span>
            )}
          </div>

          {/* Rating */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-[#231815] shadow-sm">
            <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
            <span>{product.rating || '4.9'}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-serif text-lg font-bold text-[#231815] leading-snug group-hover:text-[#8B4513] transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-[#7E6C65] mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Size / Weight Selector */}
          {sizes.length > 1 && (
            <div className="mt-4">
              <label className="text-[11px] font-bold text-[#7E6C65] uppercase tracking-wider block mb-1.5">
                Select Portion / Size:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s, idx) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      selectedSizeIndex === idx
                        ? 'bg-[#8B4513] text-white shadow-sm'
                        : 'bg-[#FAF4EB] text-[#42312C] hover:bg-[#F4E8D7]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Cake Inscription Toggle */}
          {isCake && (
            <div className="mt-3 pt-3 border-t border-[#F2EBE3]">
              <button
                type="button"
                onClick={() => setShowMessageInput(!showMessageInput)}
                className="text-[11px] font-semibold text-[#8B4513] hover:underline flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3" />
                {showMessageInput ? 'Hide custom message' : '+ Add custom piping text / message'}
              </button>

              {showMessageInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    maxLength={35}
                    placeholder="e.g. Happy Birthday Maya! 🎉"
                    value={cakeMessage}
                    onChange={(e) => setCakeMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] focus:outline-none focus:border-[#8B4513]"
                  />
                  <span className="text-[10px] text-[#A8988D] block text-right mt-0.5">
                    {cakeMessage.length}/35 characters
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Price & Add to Cart */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-[#F2EBE3] mt-2 pt-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8988D] block">Price</span>
          <span className="text-xl font-extrabold text-[#231815] font-serif">
            ${currentPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.is_available}
          className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
            !product.is_available
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isAdded
              ? 'bg-[#15803D] text-white'
              : 'bg-[#8B4513] hover:bg-[#72360E] text-white hover:shadow-md'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>{product.is_available ? 'Add to Box' : 'Sold Out'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
