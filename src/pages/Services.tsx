import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Home as HomeIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPriceRange, formatDuration } from '@/lib/utils';
import type { Service, Category } from '@/types';
import { FALLBACK_SERVICES, FALLBACK_CATEGORIES, withFallback } from '@/lib/fallbackData';
import Reveal from '@/components/ui/Reveal';
import PageMeta from '@/components/ui/PageMeta';

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: cats }, { data: svcs }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('services').select('*').eq('is_active', true).order('display_order'),
      ]);
      setCategories(withFallback(cats as Category[] | null, FALLBACK_CATEGORIES));
      setServices(withFallback(svcs as Service[] | null, FALLBACK_SERVICES));
      setLoading(false);
    })();
  }, []);

  const filtered =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category_id === activeCategory);

  return (
    <>
      <PageMeta title="Services" description="Full range of hair, beauty, and wellness services at Fargo Unisex Salon & Spa. Browse our menu and book online." path="/services" />

      {/* Page header — distinct from home hero: editorial list style */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-cream-100 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-5">Services</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-ink-900 leading-[1.05] text-balance">
                Everything we offer, with clear pricing and honest timing.
              </h1>
            </div>
            <div className="lg:col-span-4 flex items-end">
              <p className="text-ink-600 leading-relaxed">
                Prices are ranges because hair length, density, and product needs vary.
                You'll get an exact quote when you book.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-20 z-30 bg-cream-50/95 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            <FilterButton active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
              All
            </FilterButton>
            {categories.map((cat) => (
              <FilterButton
                key={cat.id}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </FilterButton>
            ))}
          </div>
        </div>
      </section>

      {/* Services list — editorial list layout, not cards */}
      <section className="py-12 lg:py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-cream-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-ink-100">
              {filtered.map((service, i) => {
                const category = categories.find((c) => c.id === service.category_id);
                return (
                  <Reveal key={service.id} delay={i * 40}>
                    <Link
                      to={`/services/${service.slug}`}
                      className="group grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 py-6 lg:py-8 items-center hover:bg-cream-100/60 -mx-4 px-4 transition-colors"
                    >
                      <div className="md:col-span-1">
                        <span className="text-xs uppercase tracking-wider-2 text-ink-400">
                          {category?.name}
                        </span>
                      </div>
                      <div className="md:col-span-5">
                        <h3 className="text-xl lg:text-2xl font-display text-ink-900 group-hover:text-rose-500 transition-colors">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-ink-500 mt-1.5 clamp-2">{service.description}</p>
                        )}
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2 text-sm text-ink-500">
                        <Clock size={15} className="text-ink-400" />
                        {formatDuration(service.duration_minutes)}
                      </div>
                      <div className="md:col-span-2 text-sm text-ink-700">
                        {formatPriceRange(service.price_min, service.price_max)}
                      </div>
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                        {service.home_service_eligible && (
                          <span className="flex items-center gap-1.5 text-xs text-olive-600">
                            <HomeIcon size={13} /> Home
                          </span>
                        )}
                        <ArrowRight size={18} className="text-ink-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-center text-ink-400 py-20">No services in this category.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-ink-900 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl lg:text-4xl font-display text-cream-50 mb-5">
            Found what you need?
          </h2>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-cream-50 text-ink-900 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 hover:text-cream-50 transition-all"
          >
            Book a Session <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 text-sm tracking-wide transition-colors ${
        active
          ? 'bg-ink-900 text-cream-50'
          : 'text-ink-600 hover:text-ink-900'
      }`}
    >
      {children}
    </button>
  );
}
