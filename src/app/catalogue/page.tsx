'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, Filter, Check, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ProductCard from '../../components/ProductCard';
import type { Product, Category } from '../../types/supabase';

// Fallback products in case Supabase network is initializing
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: '1',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Belgian Dark Chocolate Truffle Cake',
    slug: 'belgian-chocolate-truffle-cake',
    description: 'Rich 70% Belgian chocolate ganache layered with moist cocoa sponge and chocolate shavings.',
    base_price: 28.0,
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: '0.5 kg (Serves 4-6)', extra_price: 0 },
      { label: '1.0 kg (Serves 8-12)', extra_price: 22 },
      { label: '2.0 kg (Serves 16-20)', extra_price: 55 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.9,
    created_at: null,
  },
  {
    id: '2',
    category_id: '11111111-1111-1111-1111-111111111111',
    name: 'Classic Red Velvet & Cream Cheese Cake',
    slug: 'classic-red-velvet-cake',
    description: 'Velvety crimson sponge infused with Madagascar vanilla and layered with tangy Philadelphia cream cheese frosting.',
    base_price: 32.0,
    images: ['https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80'],
    is_eggless: false,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: '0.5 kg (Serves 4-6)', extra_price: 0 },
      { label: '1.0 kg (Serves 8-12)', extra_price: 24 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.8,
    created_at: null,
  },
  {
    id: '3',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Pure Butter French Croissant',
    slug: 'pure-butter-french-croissant',
    description: 'Flaky, golden, 27-layer laminated dough baked using high-fat cultured Normandy butter.',
    base_price: 4.5,
    images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'],
    is_eggless: false,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: 'Single Piece', extra_price: 0 },
      { label: 'Box of 4', extra_price: 12.5 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.9,
    created_at: null,
  },
  {
    id: '4',
    category_id: '22222222-2222-2222-2222-222222222222',
    name: 'Almond Frangipane Fruit Tart',
    slug: 'almond-frangipane-fruit-tart',
    description: 'Crisp sweet shortcrust pastry filled with golden almond cream and topped with fresh raspberries and blueberries.',
    base_price: 6.5,
    images: ['https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=80'],
    is_eggless: false,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: 'Single Tart', extra_price: 0 },
      { label: 'Box of 2', extra_price: 6.0 },
    ],
    is_available: true,
    is_featured: false,
    rating: 4.8,
    created_at: null,
  },
  {
    id: '5',
    category_id: '33333333-3333-3333-3333-333333333333',
    name: 'San Francisco Style Country Sourdough',
    slug: 'country-sourdough-loaf',
    description: '36-hour slow cold fermentation loaf with a blistered crunchy crust and open, airy crumb.',
    base_price: 7.0,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: true,
    available_sizes: [
      { label: 'Whole Loaf (800g)', extra_price: 0 },
      { label: 'Sliced Loaf', extra_price: 0.5 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.9,
    created_at: null,
  },
  {
    id: '6',
    category_id: '44444444-4444-4444-4444-444444444444',
    name: 'Parisian Macarons Gift Box',
    slug: 'parisian-macarons-gift-box',
    description: 'Naturally gluten-free almond meringue shells filled with chocolate ganache, pistachio, and raspberry coulis.',
    base_price: 16.0,
    images: ['https://images.unsplash.com/photo-1569864321288-292f70356191?auto=format&fit=crop&w=800&q=80'],
    is_eggless: false,
    is_gluten_free: true,
    is_vegan: false,
    available_sizes: [
      { label: 'Box of 6', extra_price: 0 },
      { label: 'Box of 12', extra_price: 14.0 },
    ],
    is_available: true,
    is_featured: true,
    rating: 4.9,
    created_at: null,
  },
  {
    id: '7',
    category_id: '55555555-5555-5555-5555-555555555555',
    name: 'Spinach, Feta & Sun-Dried Tomato Danish',
    slug: 'spinach-feta-danish',
    description: 'Buttery laminated puff pastry nest cradling seasoned creamed spinach, Greek feta cheese, and toasted pine nuts.',
    base_price: 5.5,
    images: ['https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=800&q=80'],
    is_eggless: true,
    is_gluten_free: false,
    is_vegan: false,
    available_sizes: [
      { label: 'Single Piece', extra_price: 0 },
      { label: 'Box of 3', extra_price: 10.0 },
    ],
    is_available: true,
    is_featured: false,
    rating: 4.7,
    created_at: null,
  },
];

function CatalogueContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEggless, setFilterEggless] = useState(false);
  const [filterVegan, setFilterVegan] = useState(false);
  const [filterGlutenFree, setFilterGlutenFree] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories & products from live Supabase database
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          supabase.from('categories').select('*').order('display_order'),
          supabase.from('products').select('*').order('created_at', { ascending: false }),
        ]);

        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
        }
        if (prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data);
        }
      } catch (err) {
        console.error('Error fetching catalogue from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (cat && prod.category_id !== cat.id) return false;
      }

      // Dietary filters
      if (filterEggless && !prod.is_eggless) return false;
      if (filterVegan && !prod.is_vegan) return false;
      if (filterGlutenFree && !prod.is_gluten_free) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(q);
        const matchesDesc = prod.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.base_price) - Number(b.base_price);
      if (sortBy === 'price-desc') return Number(b.base_price) - Number(a.base_price);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, categories, selectedCategory, filterEggless, filterVegan, filterGlutenFree, searchQuery, sortBy]);

  return (
    <div className="py-10 bg-[#FDFBF7]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Freshly Baked Every Morning
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#231815] tracking-tight">
            Artisan Product Catalogue
          </h1>
          <p className="text-sm md:text-base text-[#7E6C65] mt-2">
            Explore our handcrafted celebration cakes, crisp viennoiserie, rustic slow-fermented breads, and savoury bakes.
          </p>
        </div>

        {/* Search & Sorting Controls */}
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-[#E8DDD2] shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search cakes, croissants, sourdough..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF4EB] border border-[#E8DDD2] text-sm focus:outline-none focus:border-[#8B4513]"
              />
              <Search className="w-4 h-4 text-[#7E6C65] absolute left-3.5 top-3.5" />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <SlidersHorizontal className="w-4 h-4 text-[#7E6C65]" />
              <label className="text-xs font-bold text-[#7E6C65]">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#FAF4EB] border border-[#E8DDD2] text-[#231815] focus:outline-none"
              >
                <option value="featured">Featured & Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-[#F2EBE3]">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#8B4513] text-white shadow-sm'
                  : 'bg-[#FAF4EB] text-[#42312C] hover:bg-[#F4E8D7]'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-[#8B4513] text-white shadow-sm'
                    : 'bg-[#FAF4EB] text-[#42312C] hover:bg-[#F4E8D7]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dietary Toggles */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-bold text-[#7E6C65] uppercase tracking-wider mr-1">
              Dietary Preference:
            </span>
            <button
              onClick={() => setFilterEggless(!filterEggless)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
                filterEggless
                  ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
                  : 'bg-[#FAF4EB] text-[#7E6C65] hover:bg-[#F4E8D7]'
              }`}
            >
              {filterEggless && <Check className="w-3.5 h-3.5" />}
              100% Eggless (Veg)
            </button>

            <button
              onClick={() => setFilterVegan(!filterVegan)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
                filterVegan
                  ? 'bg-[#D1FAE5] text-[#047857] border border-[#6EE7B7]'
                  : 'bg-[#FAF4EB] text-[#7E6C65] hover:bg-[#F4E8D7]'
              }`}
            >
              {filterVegan && <Check className="w-3.5 h-3.5" />}
              🌱 Vegan
            </button>

            <button
              onClick={() => setFilterGlutenFree(!filterGlutenFree)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-all ${
                filterGlutenFree
                  ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                  : 'bg-[#FAF4EB] text-[#7E6C65] hover:bg-[#F4E8D7]'
              }`}
            >
              {filterGlutenFree && <Check className="w-3.5 h-3.5" />}
              🌾 Gluten-Free
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DDD2] max-w-md mx-auto">
            <Filter className="w-10 h-10 text-[#A8988D] mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#231815]">No items found</h3>
            <p className="text-xs text-[#7E6C65] mt-1">
              Try adjusting your dietary filters or search query to see other bakes.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setFilterEggless(false);
                setFilterVegan(false);
                setFilterGlutenFree(false);
              }}
              className="btn-secondary !py-2 !px-4 text-xs mt-4"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center font-serif text-lg font-bold text-[#8B4513]">
          Loading fresh bakery catalogue...
        </div>
      }
    >
      <CatalogueContent />
    </Suspense>
  );
}

