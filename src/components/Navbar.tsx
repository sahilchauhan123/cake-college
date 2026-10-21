'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Cake, Menu, X, Sparkles, ChefHat } from 'lucide-react';
import { useCart } from '../lib/cart';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/custom-cake', label: 'Custom Cake Studio', highlight: true },
    { href: '/admin', label: 'Kitchen Hub' },
  ];

  return (
    <header className="glass-nav sticky top-0 z-50 transition-all duration-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#8B4513] to-[#D97706] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#231815] group-hover:text-[#8B4513] transition-colors">
                Sweet Delight
              </span>
              <span className="block text-[11px] font-medium tracking-widest uppercase text-[#8B4513]">
                Artisan Bakery & Patisserie
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors flex items-center gap-1.5 ${
                    link.highlight
                      ? 'text-[#B45309] bg-[#FEF3C7] px-3.5 py-1.5 rounded-full hover:bg-[#FDE68A]'
                      : isActive
                      ? 'text-[#8B4513] border-b-2 border-[#8B4513] pb-1'
                      : 'text-[#42312C] hover:text-[#8B4513]'
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons: Cart & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-[#FAF4EB] hover:bg-[#F4E8D7] text-[#8B4513] transition-all"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#BE123C] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemCount}
                </span>
              )}
            </button>

            <Link
              href="/custom-cake"
              className="hidden lg:inline-flex btn-primary !py-2.5 !px-5 text-xs uppercase tracking-wider"
            >
              <Cake className="w-4 h-4" />
              Design Cake
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#42312C] hover:text-[#8B4513]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E8DDD2] flex flex-col gap-3 pb-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2 text-base font-semibold rounded-lg flex items-center gap-2 ${
                  pathname === link.href
                    ? 'bg-[#F7EFE8] text-[#8B4513]'
                    : 'text-[#42312C] hover:bg-[#FAF4EB]'
                }`}
              >
                {link.highlight && <Sparkles className="w-4 h-4 text-[#D97706]" />}
                {link.label}
              </Link>
            ))}
            <div className="px-4 pt-2">
              <Link
                href="/custom-cake"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary w-full text-center"
              >
                <Cake className="w-4 h-4" />
                Custom Cake Studio
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
