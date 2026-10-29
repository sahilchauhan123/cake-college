'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../lib/whatsapp';

export default function WhatsAppFloating() {
  const pathname = usePathname();

  const whatsappUrl = getWhatsAppUrl(
    'Hi Butter & Crumb! I would like to ask a question or place a bakery order.'
  );

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <aside
      aria-label="Instant WhatsApp Assistant"
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3 group"
    >
      <div className="bg-[#111111] text-white px-3.5 py-1.5 rounded-full shadow-lg border border-white/20 text-xs font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1.5">
        <span>Chat with Baker</span>
        <span className="w-2 h-2 rounded-full bg-[#00E5A3] inline-block animate-ping" />
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="w-14 h-14 rounded-full bg-[#E4007C] hover:bg-[#111111] text-white border-2 border-[#111111] flex items-center justify-center shadow-[4px_4px_0px_#111111] hover:scale-105 transition-all"
        aria-label="Direct WhatsApp Chat"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </aside>
  );
}
