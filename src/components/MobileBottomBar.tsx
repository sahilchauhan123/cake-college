'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UtensilsCrossed, Cake, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../lib/cart';
import { getWhatsAppUrl } from '../lib/whatsapp';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const { totalItemCount, setIsCartOpen } = useCart();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8DDD2] z-40 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        <Link
          href="/catalogue"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            pathname === '/catalogue' ? 'text-[#8B4513]' : 'text-[#7E6C65]'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Menu</span>
        </Link>

        <Link
          href="/custom-cake"
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            pathname === '/custom-cake' ? 'text-[#D97706]' : 'text-[#7E6C65]'
          }`}
        >
          <div className="relative">
            <Cake className="w-5 h-5 text-[#D97706]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D97706]" />
          </div>
          <span>Custom Cake</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-[#7E6C65] relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#BE123C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        <a
          href={getWhatsAppUrl('Hi! I would like to enquire about cake availability today.')}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-[#16A34A]"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
