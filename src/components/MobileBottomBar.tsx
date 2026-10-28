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

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-[#111111] z-40 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        <Link
          href="/catalogue"
          className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
            pathname === '/catalogue' ? 'text-[#E4007C]' : 'text-[#111111]'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span>Menu</span>
        </Link>

        <Link
          href="/custom-cake"
          className={`flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
            pathname === '/custom-cake' ? 'text-[#E4007C]' : 'text-[#111111]'
          }`}
        >
          <div className="relative">
            <Cake className="w-5 h-5 text-[#E4007C]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E4007C]" />
          </div>
          <span>Cake Lab</span>
        </Link>

        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#111111] relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#E4007C] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
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
          className="flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#00E5A3]"
        >
          <div className="w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center text-[#00E5A3]">
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[#111111]">Chat</span>
        </a>
      </div>
    </div>
  );
}
