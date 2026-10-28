'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MapPin, Clock, Heart, Sparkles, Send } from 'lucide-react';
import { BAKERY_WHATSAPP_NUMBER, getWhatsAppUrl } from '../lib/whatsapp';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#111111] text-[#FAFAFA] pt-16 pb-24 md:pb-12 border-t-2 border-[#111111]">
      <div className="container-custom">
        {/* Milk Bar Style Newsletter Banner */}
        <div className="bg-[#FFF0F6] border-2 border-[#111111] rounded-2xl p-6 md:p-8 mb-16 text-[#111111] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[5px_5px_0px_#E4007C]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E4007C] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              JOIN THE DESSERT CLUB
            </span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#111111]">
              GET 10% OFF YOUR FIRST ORDER
            </h3>
            <p className="text-xs text-[#6B7280] font-medium mt-1">
              Secret cake drop announcements, limited edition bakes &amp; birthday perks.
            </p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-full bg-white border-2 border-[#111111] text-xs font-semibold focus:outline-none focus:border-[#E4007C] w-full md:w-64"
            />
            <button
              type="button"
              className="btn-primary !py-3 !px-6 text-xs whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SUBSCRIBE</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#E4007C] flex items-center justify-center text-white font-black text-lg">
                SD
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-white uppercase">
                Sweet Delight<span className="text-[#E4007C]">.</span>
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6 font-medium">
              A playful dessert lab crafting iconic celebration cakes, Bombay mawa loaves, 100% pure eggless bakes, and sourdough daily.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#242424] hover:bg-[#E4007C] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={getWhatsAppUrl("Namaste Sweet Delight! I'd like to ask a question about your bakery menu.")}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#00E5A3] hover:bg-[#10B981] text-[#111111] flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              BAKERY MENU
            </h3>
            <ul className="space-y-2.5 text-xs font-bold text-[#A1A1AA]">
              <li>
                <Link href="/catalogue?category=cakes" className="hover:text-[#E4007C] transition-colors">
                  Signature Cakes
                </Link>
              </li>
              <li>
                <Link href="/catalogue?category=pastries" className="hover:text-[#E4007C] transition-colors">
                  Pastries &amp; Mawa Bakes
                </Link>
              </li>
              <li>
                <Link href="/catalogue?category=breads" className="hover:text-[#E4007C] transition-colors">
                  Artisan Sourdough &amp; Puffs
                </Link>
              </li>
              <li>
                <Link href="/custom-cake" className="text-[#FFE600] hover:text-[#E4007C] transition-colors">
                  ★ Custom Celebration Cake Lab
                </Link>
              </li>
              <li>
                <Link href="/catalogue?eggless=true" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border border-[#15803D] flex items-center justify-center p-0.5 rounded-xs bg-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  </span>
                  100% Pure Veg (Eggless)
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Hours */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              BAKE HOURS (IST)
            </h3>
            <div className="space-y-3 text-xs text-[#A1A1AA] font-medium">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#FFE600] mt-0.5 shrink-0" />
                <div>
                  <p className="font-black text-white">MON – SUN: 8:00 AM – 11:00 PM</p>
                  <p className="text-[11px] text-[#A1A1AA]">Fresh Morning Bakes: 8:00 AM</p>
                  <p className="text-[11px] text-[#A1A1AA]">Hot Puffs &amp; Pastries: 4:00 PM</p>
                </div>
              </div>
              <p className="text-[11px] text-[#71717A] pt-2">
                FSSAI Lic. No: <strong className="text-white">11523005000421</strong>
              </p>
              <p className="text-[11px] text-[#71717A]">
                💳 UPI, Credit/Debit Cards, Cash on Delivery accepted.
              </p>
            </div>
          </div>

          {/* Address & Contact */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
              VISIT OUR LAB
            </h3>
            <div className="space-y-3 text-xs text-[#A1A1AA] font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E4007C] mt-0.5 shrink-0" />
                <span>
                  Shop 4, Hill Road, Near Mehboob Studio,<br />
                  Bandra West, Mumbai, MH - 400050
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#00E5A3] shrink-0" />
                <span>WhatsApp: +{BAKERY_WHATSAPP_NUMBER}</span>
              </div>
              <div className="pt-2">
                <a
                  href={getWhatsAppUrl('Namaste! I would like to place an order with Sweet Delight Bakery.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-2 !px-4 text-xs w-full text-center"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#71717A] gap-4">
          <p>© {new Date().getFullYear()} Sweet Delight Dessert Lab &amp; Bakery. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1 font-semibold">
              Baked with <Heart className="w-3.5 h-3.5 text-[#E4007C] fill-current" /> in Mumbai
            </p>
            <span>•</span>
            <Link href="/admin" className="text-[#A1A1AA] hover:text-[#E4007C] transition-colors font-bold">
              Kitchen Hub (Staff)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
