# 🍰 Bakery Shop Platform

A digital ordering platform and custom cake booking system for an artisan bakery, built with **Next.js** and **Supabase**.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security)
- **Auth:** Supabase Auth (Email, Google, Phone OTP)
- **Storage:** Supabase Storage (Cake reference photos, product media)
- **Realtime:** Supabase Realtime (Live order status for kitchen/admin)
- **State & Validation:** Zustand, React Hook Form, Zod
- **Integrations:** WhatsApp Click-to-Chat

---

## 🚀 Key Features

1. **Online Catalogue:** Categorized cakes, pastries, and breads with dietary tags (Eggless, Vegan, Gluten-Free) and search.
2. **Custom Cake Booking:** Multi-step builder for sponge, filling, tiers/size, custom inscription, reference photo upload, and lead-time date picker.
3. **Ordering & Cart:** Slide-out cart, delivery slot / store pickup selection, order notes, and checkout.
4. **WhatsApp Ordering:** Generates instant pre-filled order summaries sent directly to the bakery's WhatsApp.
5. **Admin & Analytics:** Real-time kitchen order board, stock toggles, customer order history, and CSV data export.
6. **Mobile-First:** Fast, touch-friendly UI optimized for smartphones.

---

## ⚙️ Quick Start

### 1. Project Configuration
Your Supabase project is already configured and active:
- **Project Name:** `bakery-shop`
- **Project ID:** `jdfswrmuigcbiyizxrfk`
- **Region:** `ap-south-1`
- **Status:** `ACTIVE_HEALTHY`
- **Credentials:** Pre-populated in `.env.local`
- **TypeScript Types:** Generated in `types/supabase.ts`

### 2. Database & Storage Status
- ✅ Tables created: `profiles`, `categories`, `products`, `orders`, `order_items`, `custom_cake_requests`
- ✅ Storage buckets ready: `product-images`, `cake-references`
- ✅ Row Level Security (RLS) policies applied
- ✅ Initial catalogue items seeded (Cakes, Pastries, Breads, Macarons, Savory)

---

## 📖 Documentation
Detailed technical specifications, database schema (SQL), and RLS security policies are documented in **[BAKERY_PLATFORM_SPECIFICATION.md](file:///home/sahilfaceyou/Desktop/Project%20by%20Ai/bakery-shop/BAKERY_PLATFORM_SPECIFICATION.md)**.

# cake-college
