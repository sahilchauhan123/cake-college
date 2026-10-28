'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Cake, Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../lib/cart';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/catalogue', label: 'BAKERY MENU' },
    { href: '/custom-cake', label: 'CUSTOM CAKE LAB', highlight: true },
    { href: '/admin', label: 'BAKERY ADMIN' },
  ];

  // Do not render storefront navbar on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      {/* 1. Milk Bar Signature Announcement Ticker */}
      <div className="milk-ticker border-b border-[#111111] select-none h-8 flex items-center overflow-hidden">
        <div className="milk-ticker-track">
          <span>★ SHIPS FRESH DAILY FROM OUR OVEN</span>
          <span>•</span>
          <span>FREE DELIVERY ON ORDERS OVER ₹999</span>
          <span>•</span>
          <span>BESPOKE NAKED CAKES &amp; DESSERT LAB</span>
          <span>•</span>
          <span>100% PURE VEG (EGGLESS) AVAILABLE</span>
          <span>★</span>
          <span>★ SHIPS FRESH DAILY FROM OUR OVEN</span>
          <span>•</span>
          <span>FREE DELIVERY ON ORDERS OVER ₹999</span>
          <span>•</span>
          <span>BESPOKE NAKED CAKES &amp; DESSERT LAB</span>
          <span>•</span>
          <span>100% PURE VEG (EGGLESS) AVAILABLE</span>
          <span>★</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-white border-b-2 border-[#111111]">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 sm:h-18 md:h-20 gap-2 sm:gap-4">
            {/* Milk Bar Style Brand Logo - never wraps, never overflows */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group py-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E4007C] flex items-center justify-center text-white font-black text-xs sm:text-base shrink-0 shadow-sm group-hover:scale-105 group-hover:bg-[#111111] transition-all">
                SD
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight text-[#111111] uppercase whitespace-nowrap flex items-center gap-1 group-hover:text-[#E4007C] transition-colors leading-tight">
                  Sweet Delight<span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E4007C] inline-block shrink-0" />
                </span>
                <span className="block text-[8px] sm:text-[9px] md:text-[10px] font-extrabold tracking-widest uppercase text-[#111111]/70 leading-none mt-0.5 whitespace-nowrap">
                  Dessert Lab &amp; Bakery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-8 shrink-0">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs font-black tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      link.highlight
                        ? 'text-[#111111] bg-[#FFE600] border border-[#111111] px-3.5 py-1.5 rounded-full hover:bg-[#E4007C] hover:text-white hover:border-[#E4007C] shadow-sm'
                        : isActive
                        ? 'text-[#E4007C] border-b-2 border-[#E4007C] pb-0.5'
                        : 'text-[#111111] hover:text-[#E4007C]'
                    }`}
                  >
                    {link.highlight && <Sparkles className="w-3.5 h-3.5" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons: Cart, Custom Cake CTA, and Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-full bg-[#F4F4F4] hover:bg-[#FFE5F0] text-[#111111] hover:text-[#E4007C] border border-[#111111]/15 hover:border-[#E4007C] transition-all shrink-0"
                aria-label="View Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E4007C] text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {totalItemCount}
                  </span>
                )}
              </button>

              <Link
                href="/custom-cake"
                className="hidden xl:inline-flex btn-primary !py-2 !px-4 text-[11px] font-black tracking-wider whitespace-nowrap shrink-0"
              >
                <Cake className="w-3.5 h-3.5" />
                <span>Custom Cake</span>
              </Link>

              {/* Hamburger Button for Mobile / Tablet */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#111111] hover:text-[#E4007C] hover:bg-[#F4F4F4] transition-colors shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-[#111111]/10 flex flex-col gap-1.5 pb-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl flex items-center justify-between ${
                    pathname === link.href
                      ? 'bg-[#FFF0F6] text-[#E4007C]'
                      : 'text-[#111111] hover:bg-[#F4F4F4]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.highlight && <Sparkles className="w-4 h-4 text-[#E4007C]" />}
                    {link.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              ))}
              <div className="px-4 pt-2">
                <Link
                  href="/custom-cake"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center text-xs !py-3"
                >
                  <Cake className="w-4 h-4" />
                  Custom Cake Lab
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
