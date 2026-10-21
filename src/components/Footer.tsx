import React from 'react';
import Link from 'next/link';
import { ChefHat, Phone, MapPin, Clock, Heart } from 'lucide-react';
import { BAKERY_WHATSAPP_NUMBER, getWhatsAppUrl } from '../lib/whatsapp';

export default function Footer() {
  return (
    <footer className="bg-[#231815] text-[#FAF4EB] pt-16 pb-24 md:pb-12 border-t border-[#42312C]">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#42312C]">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B4513] to-[#D97706] flex items-center justify-center text-white">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight">Sweet Delight</span>
            </div>
            <p className="text-sm text-[#D5C7BC] leading-relaxed mb-6">
              Baking happiness daily using pure cultured Normandy butter, stoneground unbleached flours, and single-origin Belgian chocolate.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#42312C] hover:bg-[#8B4513] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#42312C] hover:bg-[#8B4513] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a
                href={getWhatsAppUrl("Hi Sweet Delight! I'd like to ask a question about your bakery menu.")}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-4">Bakery Menu</h3>
            <ul className="space-y-2.5 text-sm text-[#D5C7BC]">
              <li>
                <Link href="/catalogue?category=cakes" className="hover:text-white transition-colors">
                  Signature Cakes
                </Link>
              </li>
              <li>
                <Link href="/catalogue?category=pastries" className="hover:text-white transition-colors">
                  French Pastries & Tarts
                </Link>
              </li>
              <li>
                <Link href="/catalogue?category=breads" className="hover:text-white transition-colors">
                  Artisan Sourdough & Breads
                </Link>
              </li>
              <li>
                <Link href="/custom-cake" className="hover:text-[#D97706] text-[#F59E0B] font-medium transition-colors">
                  ★ Custom Celebration Cakes
                </Link>
              </li>
              <li>
                <Link href="/catalogue?eggless=true" className="hover:text-white transition-colors">
                  100% Eggless Treats
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Hours */}
          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-4">Bake Hours</h3>
            <div className="space-y-3 text-sm text-[#D5C7BC]">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Mon – Sun: 7:00 AM – 10:00 PM</p>
                  <p className="text-xs text-[#A8988D]">Morning Hot Bakes: 7:30 AM</p>
                  <p className="text-xs text-[#A8988D]">Evening Patisserie: 3:30 PM</p>
                </div>
              </div>
              <p className="text-xs italic text-[#A8988D] pt-2">
                *Custom cake bookings require 24 to 48 hours notice for handcrafted detail.
              </p>
            </div>
          </div>

          {/* Address & Contact */}
          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-4">Visit Our Bakery</h3>
            <div className="space-y-3 text-sm text-[#D5C7BC]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" />
                <span>
                  42 Pastry Boulevard, Near Central Park,<br />
                  Artisan District, PIN 400001
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>WhatsApp: +{BAKERY_WHATSAPP_NUMBER}</span>
              </div>
              <div className="pt-2">
                <a
                  href={getWhatsAppUrl('Hi! I would like to place an order.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp !py-2 !px-4 text-xs w-full"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#8A7970] gap-4">
          <p>© {new Date().getFullYear()} Sweet Delight Artisan Bakery. Handcrafted with passion.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#BE123C] fill-current" /> for pastry lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}
