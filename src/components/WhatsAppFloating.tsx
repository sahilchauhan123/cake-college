'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../lib/whatsapp';

export default function WhatsAppFloating() {
  const whatsappUrl = getWhatsAppUrl(
    'Hi Sweet Delight! I would like to ask a question or place a bakery order.'
  );

  return (
    <aside
      aria-label="Instant WhatsApp Assistant"
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-3 group"
    >
      <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-[#E8DDD2] text-xs font-semibold text-[#231815] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        Need help? Chat with our Baker ✨
      </div>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 pulse-whatsapp transition-all"
        aria-label="Direct WhatsApp Chat"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </aside>
  );
}
