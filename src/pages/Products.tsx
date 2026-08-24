import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { FALLBACK_PRODUCTS, withFallback } from '@/lib/fallbackData';
import Reveal from '@/components/ui/Reveal';

const PRODUCT_IMAGES: Record<string, string> = {
  'hair-dye-black': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'professional-hair-clippers': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'firm-hold-hair-spray': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'styling-comb-set': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'edge-control-gel': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'moisturising-shampoo': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'deep-conditioner': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'hair-growth-oil-serum': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'wig-extension-care-kit': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'premium-nail-polish-set': 'https://images.pexels.com/photos/5238075/pexels-photo-5238075.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'glow-facial-kit': 'https://images.pexels.com/photos/1470165/pexels-photo-1470165.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        const rows = withFallback(data as Product[] | null, FALLBACK_PRODUCTS);
        setProducts(rows);
        setFiltered(rows);
        const cats = [...new Set(rows.map((p) => p.category).filter(Boolean))] as string[];
        setCategories(cats);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCat !== 'All') result = result.filter((p) => p.category === activeCat);
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [activeCat, search, products]);

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-cream-100 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-5">Products</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-ink-900 leading-[1.05] text-balance">
                Hair, skin, and styling products we trust.
              </h1>
            </div>
            <div className="lg:col-span-5 flex items-end">
              <p className="text-ink-600 leading-relaxed">
                We use these products in our salon every day. If you'd like to take one home,
                send us an inquiry and we'll confirm availability and arrange pickup or delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="sticky top-20 z-30 bg-cream-50/95 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCat('All')}
              className={`whitespace-nowrap px-4 py-2 text-sm tracking-wide transition-colors ${
                activeCat === 'All' ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`whitespace-nowrap px-4 py-2 text-sm tracking-wide transition-colors ${
                  activeCat === cat ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-cream-100 border border-ink-100 focus:border-ink-900 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Product grid */}
      <section className="py-12 lg:py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-72 bg-cream-100 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-ink-400 py-20">No products found.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {filtered.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 60}>
                  <Link
                    to={`/contact?product=${product.slug}`}
                    className="group block"
                  >
                    <div className="aspect-square bg-cream-100 overflow-hidden mb-4">
                      <img
                        src={PRODUCT_IMAGES[product.slug] ?? product.image_url ?? IMAGES_PLACEHOLDER}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-1">{product.category}</p>
                    <h3 className="text-base font-display text-ink-900 group-hover:text-rose-500 transition-colors leading-tight">
                      {product.name}
                    </h3>
                    {product.price && (
                      <p className="text-sm text-ink-700 mt-2">{formatPrice(product.price)}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 mt-3 text-xs uppercase tracking-wider-2 text-ink-500 group-hover:text-rose-500 transition-colors">
                      Inquire <ArrowRight size={13} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const IMAGES_PLACEHOLDER = 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400';
