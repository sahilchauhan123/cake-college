'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, Filter, Check, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ProductCard from '../../components/ProductCard';
import type { Product, Category } from '../../types/supabase';

import { FALLBACK_PRODUCTS } from '../../lib/productsData';

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
    <div className="py-10 bg-white">
      <div className="container-custom">
        {/* Milk Bar Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFE600] text-[#111111] border border-[#111111] text-[10px] font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_#111111]">
            <Sparkles className="w-3.5 h-3.5 text-[#E4007C]" />
            FRESHLY BAKED EVERY MORNING AT 5:00 AM
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#111111]">
            THE BAKERY CATALOGUE
          </h1>
          <p className="text-xs md:text-sm text-[#6B7280] font-medium mt-2 max-w-xl mx-auto">
            Explore our handcrafted celebration cakes, crisp viennoiserie, rustic slow-fermented breads, and savoury bakes.
          </p>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-[#FFF0F6] p-4 md:p-6 rounded-2xl border-2 border-[#111111] shadow-[5px_5px_0px_#111111] mb-10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search cakes, croissants, sourdough..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:border-[#E4007C]"
              />
              <Search className="w-4 h-4 text-[#111111] absolute left-3.5 top-3.5" />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <SlidersHorizontal className="w-4 h-4 text-[#111111]" />
              <label className="text-[11px] font-black uppercase tracking-wider text-[#111111]">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl bg-white border-2 border-[#111111] text-[#111111] focus:outline-none"
              >
                <option value="featured">Featured &amp; Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-[#111111]/10">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-all border-2 ${
                selectedCategory === 'all'
                  ? 'bg-[#E4007C] text-white border-[#E4007C] shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap transition-all border-2 ${
                  selectedCategory === cat.slug
                    ? 'bg-[#E4007C] text-white border-[#E4007C] shadow-[2px_2px_0px_#111111]'
                    : 'bg-white text-[#111111] border-[#111111] hover:bg-[#FFE600]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dietary Toggles */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-black text-[#111111] uppercase tracking-wider mr-1">
              Dietary Preference:
            </span>
            <button
              onClick={() => setFilterEggless(!filterEggless)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border-2 ${
                filterEggless
                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D] shadow-sm'
                  : 'bg-white text-[#111111] border-[#111111]/30 hover:border-[#111111]'
              }`}
            >
              {filterEggless && <Check className="w-3.5 h-3.5" />}
              100% Eggless (Veg)
            </button>

            <button
              onClick={() => setFilterVegan(!filterVegan)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border-2 ${
                filterVegan
                  ? 'bg-[#D1FAE5] text-[#065F46] border-[#065F46] shadow-sm'
                  : 'bg-white text-[#111111] border-[#111111]/30 hover:border-[#111111]'
              }`}
            >
              {filterVegan && <Check className="w-3.5 h-3.5" />}
              🌱 Vegan
            </button>

            <button
              onClick={() => setFilterGlutenFree(!filterGlutenFree)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border-2 ${
                filterGlutenFree
                  ? 'bg-[#FFE600] text-[#111111] border-[#111111] shadow-sm'
                  : 'bg-white text-[#111111] border-[#111111]/30 hover:border-[#111111]'
              }`}
            >
              {filterGlutenFree && <Check className="w-3.5 h-3.5" />}
              🌾 Gluten-Free
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-[#FFF0F6] rounded-2xl p-12 text-center border-2 border-[#111111] max-w-md mx-auto shadow-[4px_4px_0px_#111111]">
            <Filter className="w-10 h-10 text-[#E4007C] mx-auto mb-3" />
            <h3 className="text-lg font-black uppercase tracking-tight text-[#111111]">No items found</h3>
            <p className="text-xs text-[#6B7280] font-medium mt-1">
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
        <div className="py-24 text-center text-lg font-black uppercase tracking-tight text-[#E4007C]">
          Loading fresh bakery catalogue...
        </div>
      }
    >
      <CatalogueContent />
    </Suspense>
  );
}
