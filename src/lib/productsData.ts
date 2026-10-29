import { supabase } from './supabase';
import type { Product } from '../types/supabase';

export interface SizeOption {
  label: string;
  extra_price: number;
  serves?: string;
  weight?: string;
}

export interface DetailedProductInfo {
  ingredients: string[];
  allergens: string[];
  storageAdvice: string;
  servingAdvice: string;
  shelfLife: string;
}

export const FALLBACK_PRODUCTS: (Product & { details?: DetailedProductInfo })[] = [
  {
    id: '1',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Rasmalai Tres Leches Cake',
    slug: 'royal-rasmalai-tres-leches-cake',
    description: 'Soft cardamom sponge soaked in saffron rabdi, topped with fresh rasmalai and pistachios.',
    base_price: 649,
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: '0.5 kg (Serves 4-6)', extra_price: 0 },
      { label: '1.0 kg (Serves 8-12)', extra_price: 550 },
      { label: '2.0 kg (Serves 16-20)', extra_price: 1300 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.9,
    created_at: null,
    details: {
      ingredients: [
        'Pure Cow Milk & Rabdi',
        'Bengali Chenna Rasmalai',
        'Kashmiri Saffron (Kesar)',
        'Iranian Green Pistachios',
        'Green Cardamom (Elaichi)',
        'Organic Wheat Flour',
        'Pure Dairy Cream',
      ],
      allergens: ['Contains Dairy (Milk, Cream)', 'Contains Tree Nuts (Pistachios)', 'Contains Gluten (Wheat)'],
      storageAdvice: 'Keep refrigerated between 2°C – 5°C. Do not freeze. Consume within 48 hours for freshest taste.',
      servingAdvice: 'Best served chilled. Pour the extra saffron milk drizzle right before slicing.',
      shelfLife: '3 Days Refrigerated',
    },
  },
  {
    id: '2',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Dutch Chocolate Truffle',
    slug: 'dutch-truffle-chocolate-cake',
    description: 'Moist chocolate sponge layered with rich dark chocolate ganache and chocolate shavings.',
    base_price: 549,
    images: ['https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=1200&q=85'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: '0.5 kg (Serves 4-6)', extra_price: 0 },
      { label: '1.0 kg (Serves 8-12)', extra_price: 450 },
      { label: '2.0 kg (Serves 16-20)', extra_price: 1100 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.8,
    created_at: null,
    details: {
      ingredients: [
        '55% Belgian Dark Chocolate',
        'Dutch Processed Cocoa Powder',
        'Pure Amul Butter',
        'Fresh Dairy Cream',
        'Bourbon Vanilla Extract',
        'Unbleached Wheat Flour',
      ],
      allergens: ['Contains Dairy (Butter, Cream)', 'Contains Gluten (Wheat)', 'May contain traces of soy lecithin'],
      storageAdvice: 'Store in an airtight cake dome in the refrigerator.',
      servingAdvice: 'Remove from fridge 20 minutes before cutting so the truffle ganache softens to a velvety texture.',
      shelfLife: '4 Days Refrigerated',
    },
  },
  {
    id: '3',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Kesar Pista Cake',
    slug: 'kesar-pista-royal-gateau',
    description: 'Light saffron mousse layered with crushed pistachios and soft vanilla sponge.',
    base_price: 599,
    images: ['https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=85'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: '0.5 kg (Serves 4-6)', extra_price: 0 },
      { label: '1.0 kg (Serves 8-12)', extra_price: 500 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.9,
    created_at: null,
    details: {
      ingredients: [
        'Kashmiri Mongra Saffron',
        'Iranian Roasted Pistachios',
        'Cardamom Infused Whipped Ganache',
        'Moist Sponge',
        '24K Edible Gold Leaf',
      ],
      allergens: ['Contains Dairy', 'Contains Tree Nuts (Pistachios)', 'Contains Gluten'],
      storageAdvice: 'Refrigerate immediately upon doorstep arrival.',
      servingAdvice: 'Slice with a warm chef knife wiped dry between cuts for clean edges.',
      shelfLife: '3 Days Refrigerated',
    },
  },
  {
    id: '4',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Bombay Mawa Cake',
    slug: 'bombay-mawa-cake',
    description: 'Traditional tea-time cake made with fresh mawa, cardamom, and almond slivers.',
    base_price: 199,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: 'Single Loaf (300g, Serves 2-3)', extra_price: 0 },
      { label: 'Box of 2 Loaves (600g, Serves 4-6)', extra_price: 180 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.9,
    created_at: null,
    details: {
      ingredients: [
        'Fresh Buffalo Milk Mawa (Khoya)',
        'Pure Desi Ghee',
        'Cardamom Seeds',
        'Mamra Almond Slivers',
        'Nutmeg',
        'Organic Flour',
      ],
      allergens: ['Contains Dairy (Mawa, Ghee)', 'Contains Tree Nuts (Almonds)', 'Contains Gluten'],
      storageAdvice: 'Store at cool room temperature in an airtight box for up to 3 days, or refrigerate for 7 days.',
      servingAdvice: 'Warm in an oven for 2 minutes and serve alongside hot Irani chai or filter coffee.',
      shelfLife: '7 Days',
    },
  },
  {
    id: '5',
    category_id: '55555555-5555-5555-5555-555555555555',
    name: 'Paneer Tikka Puff',
    slug: 'paneer-tikka-puff',
    description: 'Flaky golden puff pastry stuffed with spiced tandoori paneer and capsicum.',
    base_price: 65,
    images: ['https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1200&q=85'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: 'Single Puff (Serves 1)', extra_price: 0 },
      { label: 'Box of 4 Puffs (Serves 4)', extra_price: 180 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.8,
    created_at: null,
    details: {
      ingredients: [
        'Fresh Malai Paneer',
        'Laminated French Butter Pastry',
        'Tandoori Tikka Masala',
        'Roasted Bell Peppers & Onions',
        'Cumin & Coriander Spices',
      ],
      allergens: ['Contains Dairy (Paneer, Butter)', 'Contains Gluten (Wheat)'],
      storageAdvice: 'Best consumed on the day of delivery. Refrigerate if consuming next day.',
      servingAdvice: 'Reheat in an oven or air fryer at 180°C for 4 minutes for maximum crunch. Avoid microwave.',
      shelfLife: '2 Days Refrigerated',
    },
  },
  {
    id: '6',
    category_id: '33333333-3333-3333-3333-333333333333',
    name: 'Chilli Cheese Sourdough',
    slug: 'chilli-cheese-sourdough',
    description: 'Crusty sourdough bread baked with melted cheddar, green chillies, and roasted garlic.',
    base_price: 220,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: 'Whole Boule (600g, Serves 4-6)', extra_price: 0 },
      { label: 'Pre-Sliced Boule', extra_price: 10 },
    ],
    is_available: true,
    is_featured: false,
    rating: 4.9,
    created_at: null,
    details: {
      ingredients: [
        '36-Hour Wild Yeast Sourdough Starter',
        'Slow-Roasted Whole Garlic Cloves',
        'Sharp Aged Cheddar Cheese',
        'Fresh Green Birdseye Chillies',
        'Stoneground Whole Wheat & Rye Flour',
        'Himalayan Pink Rock Salt',
      ],
      allergens: ['Contains Dairy (Cheddar Cheese)', 'Contains Gluten (Wheat, Rye)'],
      storageAdvice: 'Store cut-side down on a wooden breadboard or in a cloth bread bag. Avoid plastic.',
      servingAdvice: 'Toast slices with salty butter or use for gourmet sourdough grilled cheese sandwiches.',
      shelfLife: '4 Days Room Temperature',
    },
  },
];

export async function getProductBySlugOrId(slugOrId: string): Promise<Product | null> {
  try {
    // 1. Try slug match in Supabase
    const { data: bySlug } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slugOrId)
      .maybeSingle();

    if (bySlug) return bySlug;

    // 2. Try ID match in Supabase
    const { data: byId } = await supabase
      .from('products')
      .select('*')
      .eq('id', slugOrId)
      .maybeSingle();

    if (byId) return byId;
  } catch (err) {
    console.warn('Supabase query error in getProductBySlugOrId:', err);
  }

  // 3. Match from FALLBACK_PRODUCTS
  const fallback = FALLBACK_PRODUCTS.find(
    (p) => p.slug === slugOrId || p.id === slugOrId
  );

  return fallback || null;
}
