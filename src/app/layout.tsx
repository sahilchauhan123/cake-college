import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../lib/cart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import WhatsAppFloating from '../components/WhatsAppFloating';
import MobileBottomBar from '../components/MobileBottomBar';

export const metadata: Metadata = {
  title: 'Butter & Crumb Artisan Bakery | Handcrafted Cakes & Treats',
  description:
    'Order fresh celebration cakes, decadent chocolate truffles, eggless treats, and artisan sourdough. Baked fresh daily with pure butter.',
  icons: {
    icon: '/logo.png',
  },
  keywords: [
    'bakery',
    'Butter & Crumb',
    'artisan cakes',
    'custom cakes',
    'eggless cake',
    'croissants',
    'sourdough',
    'online cake delivery',
    'WhatsApp bakery order',
  ],
  openGraph: {
    title: 'Butter & Crumb Artisan Bakery',
    description: 'Fresh cakes, rich truffles, and artisan bakes made daily with pure butter and real ingredients.',
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
