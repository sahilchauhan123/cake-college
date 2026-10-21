import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../lib/cart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import WhatsAppFloating from '../components/WhatsAppFloating';
import MobileBottomBar from '../components/MobileBottomBar';

export const metadata: Metadata = {
  title: 'Sweet Delight Artisan Bakery | Handcrafted Cakes & Pastries',
  description:
    'Order fresh artisan sourdough, delicate French pastries, and design bespoke multi-tier celebration cakes with online booking, doorstep delivery, and direct WhatsApp ordering.',
  keywords: [
    'bakery',
    'artisan cakes',
    'custom cakes',
    'eggless cake',
    'croissants',
    'sourdough',
    'online cake booking',
    'WhatsApp bakery order',
  ],
  openGraph: {
    title: 'Sweet Delight Artisan Bakery & Patisserie',
    description: 'Freshly baked at 5:00 AM daily. Handcrafted celebration cakes and French pastries.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsAppFloating />
            <MobileBottomBar />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
