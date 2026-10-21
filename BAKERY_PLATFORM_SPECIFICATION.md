# Bakery Shop Platform - Technical Specification

A streamlined architectural and implementation specification for the bakery e-commerce and custom cake booking platform built with **Next.js (App Router)** and **Supabase**.

---

## 1. Technology Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | SSR for SEO, Static Site Generation for fast catalogue loading, Server Actions for checkout and order processing. |
| **Language** | **TypeScript** | Type safety across API payloads, database models, and forms. |
| **Styling** | **Tailwind CSS** | Mobile-first, responsive bakery theme (warm creams, rich chocolate, soft gold). |
| **UI & Icons** | **Lucide React** | Lightweight icons for navigation, dietary indicators, cart, and admin controls. |
| **Database** | **Supabase (PostgreSQL)** | Relational data integrity, ACID transactions for orders, fast indexed queries. |
| **Authentication** | **Supabase Auth** | Google OAuth, Email/Password, Magic Link, and Guest checkout support. Role-based access (`admin` vs `customer`). |
| **File Storage** | **Supabase Storage** | Buckets for custom cake reference image uploads and menu product photography. |
| **Realtime** | **Supabase Realtime** | WebSocket subscriptions for live kitchen order status updates. |
| **State & Validation** | **Zustand + Zod + React Hook Form** | Persistent cart state and validated multi-step cake booking form. |
| **Messaging** | **WhatsApp Click-to-Chat** | Pre-filled order summaries sent directly to the bakery's WhatsApp. |

---

## 2. Core Functional Requirements

### 2.1. Online Product Catalogue
- **Categories:** Cakes, Pastries, Breads, Cookies, Savory, Seasonal Specials.
- **Dietary Badges & Filters:** Eggless (Veg), Vegan, Gluten-Free, Sugar-Free.
- **Search & Sort:** Live search by name/ingredient; sort by price and popularity.
- **Variant Selector:** Weight options (0.5 kg, 1 kg, 2 kg) or pack sizes with dynamic pricing.

### 2.2. Custom Cake Booking Form
A dedicated booking module with:
- **Cake Base & Flavor:** Sponge type (Chocolate, Red Velvet, Vanilla, etc.) and filling/frosting selection.
- **Size / Tiers:** Single tier, 2-tier, 3-tier; estimated servings guide.
- **Design Upload:** Reference image upload to Supabase Storage bucket (`cake-references`).
- **Personalized Message:** Inscription text to be piped onto the cake board or edible plaque.
- **Delivery Date & Time Slot:** Minimum 24–48 hours advance lead-time validation.
- **Submission:** Saves to `custom_cake_requests` table with status `pending_quote` and generates a direct WhatsApp quote message.

### 2.3. Online Ordering & Checkout
- **Cart:** Persistent slide-out cart drawer with item count, quantity modifiers, and subtotal.
- **Fulfillment:** Choice between **Bakery Pickup** and **Home Delivery**.
- **Checkout Fields:** Name, phone number, delivery address, delivery date/slot, and optional order note.
- **Payment Options:** Cash on Delivery (COD), UPI / Card, or Pay at Store.
- **Order Confirmation:** Unique order ID, status tracking page, and downloadable/printable receipt.

### 2.4. WhatsApp & Social Integrations
- **WhatsApp Direct Order:** One-click button generating an organized order summary:
  ```text
  🎂 *New Bakery Order #ORD-1024*
  - 1x Belgian Chocolate Cake (1 kg) [Eggless]
  - 2x Butter Croissant
  *Message on Cake:* "Happy Birthday Mia!"
  *Total:* $42.00
  *Delivery Date:* Oct 25, 2026 | 5:00 PM
  *Address:* 12 Baker St, Apt 4
  ```
- **Social Media Hub:** Links to Instagram, Facebook, and Google Reviews in the header and footer.
- **Floating Contact Bar:** Persistent WhatsApp icon on mobile for quick inquiries.

### 2.5. Mobile-First UX
- Sticky bottom action bar on mobile devices (Menu, Custom Cake, Cart, Contact).
- Minimum 44×44px touch targets.
- Lightweight assets and fast image rendering using Next.js Image Optimization.

---

## 3. Database Schema (PostgreSQL / Supabase)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz default now()
);

-- 2. CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  display_order int default 0
);

-- 3. PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  base_price numeric(10,2) not null,
  images text[] default '{}',
  is_eggless boolean default false,
  is_gluten_free boolean default false,
  is_vegan boolean default false,
  available_sizes jsonb default '[{"label": "Standard", "extra_price": 0}]'::jsonb,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- 4. ORDERS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null, -- e.g. ORD-2026-0001
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  fulfillment_type text not null check (fulfillment_type in ('DELIVERY', 'PICKUP')),
  delivery_address text,
  delivery_date date not null,
  delivery_slot text not null,
  order_notes text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 0,
  grand_total numeric(10,2) not null,
  payment_method text default 'COD' check (payment_method in ('COD', 'ONLINE', 'UPI', 'STORE_PICKUP')),
  payment_status text default 'PENDING' check (payment_status in ('PENDING', 'PAID', 'REFUNDED')),
  order_status text default 'PENDING' check (order_status in ('PENDING', 'BAKING', 'READY', 'DELIVERED', 'CANCELLED')),
  created_at timestamptz default now()
);

-- 5. ORDER ITEMS
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  selected_size text,
  cake_message text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  total_price numeric(10,2) not null
);

-- 6. CUSTOM CAKE REQUESTS
create table public.custom_cake_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  cake_type text not null,
  flavor text not null,
  tier_count int default 1,
  estimated_weight_kg numeric(4,2),
  reference_image_urls text[] default '{}',
  message_on_cake text,
  event_date date not null,
  delivery_slot text not null,
  special_instructions text,
  quoted_price numeric(10,2),
  status text default 'PENDING' check (status in ('PENDING', 'QUOTED', 'CONFIRMED', 'COMPLETED', 'REJECTED')),
  created_at timestamptz default now()
);
```

---

## 4. Row Level Security (RLS) Policies

```sql
-- Enable RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_cake_requests enable row level security;

-- Products: Everyone can read, only admin can insert/update/delete
create policy "Products are viewable by everyone" on public.products for select using (true);

-- Orders: Anyone can insert (guests allowed), users can view their own, admins can view all
create policy "Anyone can place an order" on public.orders for insert with check (true);
create policy "Users view own orders" on public.orders for select using (
  auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin'
);

-- Custom Cakes: Anyone can submit, user and admin can view
create policy "Anyone can submit custom cake" on public.custom_cake_requests for insert with check (true);
create policy "Users view own cake requests" on public.custom_cake_requests for select using (
  auth.uid() = user_id or auth.jwt() ->> 'role' = 'admin'
);
```

---

## 5. Storage Buckets (Supabase Storage)

1. **`product-images`** (Public): Catalogue product photos.
2. **`cake-references`** (Public read / authenticated upload): Customer-uploaded reference pictures for custom cakes.

---

## 6. Admin, Analytics & Data Export

- **Realtime Kitchen Board:** Kitchen staff views live orders changing status from *Pending* ➔ *Baking* ➔ *Ready* ➔ *Delivered* using `supabase.channel('orders')`.
- **Customer & Order Analysis:**
  - Track popular items, peak delivery hours, and customer repeat rates.
  - One-click **CSV Export** for accounting and marketing campaigns directly from the admin panel.
- **Stock Management:** Instant one-click toggle to mark products in-stock or sold-out.

---

## 7. Testing & Quality Assurance Plan

1. **Catalogue & Filters:** Verify search query and category/dietary toggles show correct products.
2. **Custom Cake Form Validation:** Verify required fields, minimum 48h date restriction, and successful image upload to Supabase Storage.
3. **Cart & Calculations:** Verify accurate subtotal, delivery fee calculation, and size multiplier updates.
4. **Order Placement:** Test checkout flow (Guest & Registered), verify entry into `orders` and `order_items` tables, and test WhatsApp deep link generation.
5. **Mobile Responsiveness:** Audit touch navigation, slide drawers, and readability across small screens.

---

## 8. Maintenance & Updates

- **Database Backups:** Daily automated backups managed via Supabase.
- **Menu Updates:** Bakery owners update pricing, descriptions, and seasonal items through the admin UI without code changes.
- **Deployment:** Continuous integration and deployment via Vercel or similar hosting platforms.
