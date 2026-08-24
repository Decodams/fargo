import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Scissors, Home as HomeIcon, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { IMAGES } from '@/lib/images';
import { formatPriceRange, formatDuration, getSetting } from '@/lib/utils';
import { useSettings } from '@/lib/hooks';
import { getHeroTitleLines, getPhilosophyParagraphs } from '@/lib/content';
import type { Service, Category } from '@/types';
import { FALLBACK_SERVICES, FALLBACK_CATEGORIES, withFallback } from '@/lib/fallbackData';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import PageMeta from '@/components/ui/PageMeta';

export default function Home() {
  const { settings } = useSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const featured = services.slice(0, 6);
  const heroImage = getSetting(settings, 'hero_image_url') || IMAGES.salonInterior3;
  const titleLines = getHeroTitleLines(settings);
  const philosophyParagraphs = getPhilosophyParagraphs(settings);

  const stats = [
    { number: getSetting(settings, 'stat_1_number'), label: getSetting(settings, 'stat_1_label'), sub: getSetting(settings, 'stat_1_sub') },
    { number: getSetting(settings, 'stat_2_number'), label: getSetting(settings, 'stat_2_label'), sub: getSetting(settings, 'stat_2_sub') },
    { number: getSetting(settings, 'stat_3_number'), label: getSetting(settings, 'stat_3_label'), sub: getSetting(settings, 'stat_3_sub') },
  ].filter((s) => s.number && s.label);

  return (
    <>
      <PageMeta
        title={getSetting(settings, 'seo_title')}
        description={getSetting(settings, 'seo_description')}
        path="/"
        noSuffix
      />

      <section className="relative min-h-screen flex items-end bg-ink-900 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Fargo salon interior"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-ink-900/30" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16 lg:pb-24 pt-32">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7 min-w-0">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display text-cream-50 leading-[1.05] text-balance hero-enter">
                {titleLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < titleLines.length - 1 && <br />}
                  </span>
                ))}
              </h1>
              <p className="mt-8 text-lg text-cream-100/80 max-w-md leading-relaxed hero-enter hero-enter-delay-1">
                {getSetting(settings, 'hero_subtitle')}
              </p>
              <div className="mt-10 flex flex-wrap gap-4 hero-enter hero-enter-delay-2">
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-cream-50 text-ink-900 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 hover:text-cream-50 transition-all duration-300"
                >
                  Book a Session <ArrowRight size={16} />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream-100/30 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:border-cream-50 transition-all duration-300"
                >
                  Explore Services
                </Link>
              </div>
            </div>

            {stats.length > 0 && (
              <div className="lg:col-span-5 lg:pl-8 hero-enter hero-enter-delay-3 min-w-0">
                <div className={`grid gap-4 lg:gap-2 ${stats.length === 3 ? 'grid-cols-3' : stats.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {stats.map((stat) => (
                    <Stat key={stat.label} number={stat.number} label={stat.label} sub={stat.sub || undefined} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <Reveal className="lg:col-span-5">
              <div className="relative">
                <img
                  src={IMAGES.hairStyling}
                  alt="Stylist working on a client's hair"
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-rose-500 hidden lg:flex items-center justify-center">
                  <Scissors size={40} className="text-cream-50" />
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-7 min-w-0">
              <Reveal>
                <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-4">{getSetting(settings, 'philosophy_eyebrow')}</p>
<div className="marquee mb-8 text-center"><span>Fargo Unisex Salon — Hair, Beauty & Spa</span></div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-ink-900 leading-[1.15] text-balance">
                  {getSetting(settings, 'philosophy_title')}
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <div className="mt-8 space-y-5 text-ink-600 leading-relaxed text-base sm:text-lg">
                  {philosophyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={200}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 mt-8 text-sm uppercase tracking-wider-2 text-ink-900 border-b border-ink-900 pb-1 hover:text-rose-500 hover:border-rose-500 transition-colors"
                >
                  Our Story <ArrowRight size={15} />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-ink-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionHeading
              eyebrow="What We Do"
              title="Signature services"
              subtitle="From our full menu — each performed by a specialist who works on it every day."
              light
            />
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? [...Array(6)].map((_, i) => <div key={i} className="h-72 bg-ink-800 animate-pulse border border-ink-700" />)
              : featured.map((service, i) => (
                  <Reveal key={service.id} delay={i * 80} as="article">
                    <Link to={`/services/${service.slug}`} className="group block h-full">
                      <Card variant="dark" padding="lg" hover className="h-full flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-6 min-w-0">
                          <span className="text-xs uppercase tracking-wider-2 text-ink-400 truncate">
                            {categories.find((c) => c.id === service.category_id)?.name ?? 'Service'}
                          </span>
                          <ArrowUpRight size={18} className="shrink-0 text-ink-500 group-hover:text-rose-400 group-hover:rotate-45 transition-all duration-300" />
                        </div>
                        <h3 className="text-2xl font-display text-cream-50 mb-3 group-hover:text-rose-400 transition-colors clamp-2">
                          {service.name}
                        </h3>
                        <p className="text-sm text-ink-300 leading-relaxed clamp-3 mb-6 flex-1">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between gap-2 text-xs text-ink-400 pt-4 border-t border-ink-700 min-w-0">
                          <span className="flex items-center gap-1.5 shrink-0">
                            <Clock size={13} /> {formatDuration(service.duration_minutes)}
                          </span>
                          <span className="text-cream-100 truncate">{formatPriceRange(service.price_min, service.price_max)}</span>
                        </div>
                      </Card>
                    </Link>
                  </Reveal>
                ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-12 text-center">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-cream-100/30 text-cream-50 text-sm tracking-wider-2 uppercase hover:border-cream-50 transition-colors"
              >
                View Full Menu <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.spaMassage2} alt="Massage therapy" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-ink-900/75" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-xl min-w-0">
            <Reveal>
              <div className="flex items-center gap-3 mb-6">
                <HomeIcon size={22} className="text-rose-400 shrink-0" />
                <p className="text-xs uppercase tracking-wider-3 text-rose-400">Fargo at Home</p>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-cream-50 leading-[1.15] text-balance">
                Can't come in? We'll bring the salon to you.
              </h2>
              <p className="mt-6 text-lg text-cream-100/80 leading-relaxed">
                Styling, braiding, massage, manicures, and more — delivered to your home
                by the same specialists you'd see in our chair.
              </p>
              <Link
                to="/home-services"
                className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-cream-50 text-ink-900 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 hover:text-cream-50 transition-all"
              >
                How It Works <ArrowRight size={15} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionHeading eyebrow="The Space" title="A room designed for slowing down" align="center" />
          </Reveal>
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Reveal className="col-span-2 lg:col-span-2 lg:row-span-2">
              <img src={IMAGES.salonInterior} alt="Salon interior" className="w-full h-full object-cover min-h-[300px] lg:min-h-[500px]" />
            </Reveal>
            <Reveal delay={100}>
              <img src={IMAGES.salonChair} alt="Salon chair and mirror" className="w-full h-48 lg:h-64 object-cover" />
            </Reveal>
            <Reveal delay={150}>
              <img src={IMAGES.spaRoom} alt="Spa treatment room" className="w-full h-48 lg:h-64 object-cover" />
            </Reveal>
            <Reveal delay={200}>
              <img src={IMAGES.manicure2} alt="Manicure session" className="w-full h-48 lg:h-64 object-cover" />
            </Reveal>
            <Reveal delay={250}>
              <img src={IMAGES.facialMask} alt="Facial treatment" className="w-full h-48 lg:h-64 object-cover" />
            </Reveal>
          </div>
          <Reveal delay={150}>
            <div className="mt-10 text-center">
              <Link to="/gallery" className="inline-flex items-center gap-2 text-sm uppercase tracking-wider-2 text-ink-900 border-b border-ink-900 pb-1 hover:text-rose-500 hover:border-rose-500 transition-colors">
                View Gallery <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-rose-500">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center min-w-0">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-cream-50 leading-[1.15] text-balance">
              {getSetting(settings, 'cta_title')}
            </h2>
            <p className="mt-5 text-cream-50/90 text-lg max-w-md mx-auto">
              {getSetting(settings, 'cta_subtitle')}
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-ink-800 transition-colors"
            >
              Book a Session <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="py-12 bg-cream-100 border-t border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 min-w-0">
          <div className="flex items-center gap-3 text-ink-700 min-w-0">
            <MapPin size={18} className="text-rose-500 shrink-0" />
            <span className="text-sm break-anywhere">{getSetting(settings, 'location_strip')}</span>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ number, label, sub }: { number: string; label: string; sub?: string }) {
  return (
    <div className="text-center lg:text-left min-w-0">
      <p className="text-3xl lg:text-4xl font-display text-cream-50 truncate">{number}</p>
      <p className="text-xs uppercase tracking-wider-2 text-cream-100/60 mt-1 truncate">{label}</p>
      {sub && <p className="text-[10px] text-cream-100/40 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}
