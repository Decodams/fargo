import { Link } from 'react-router-dom';
import { ArrowRight, Home as HomeIcon, MapPin, Clock, Car } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useSettings } from '@/lib/hooks';
import { getSetting, formatPrice, formatPriceRange, formatDuration } from '@/lib/utils';
import type { Service } from '@/types';
import { IMAGES } from '@/lib/images';
import { FALLBACK_SERVICES, withFallback } from '@/lib/fallbackData';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

export default function HomeServices() {
  const { settings } = useSettings();
  const [homeServices, setHomeServices] = useState<Service[]>([]);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .eq('home_service_eligible', true)
      .order('display_order')
      .then(({ data }) => {
        const rows = withFallback(data as Service[] | null, FALLBACK_SERVICES);
        setHomeServices(rows.filter((s) => s.home_service_eligible));
      });
  }, []);

  const area = getSetting(settings, 'home_service_area');
  const fee = getSetting(settings, 'home_service_fee');

  return (
    <>
      {/* Hero — full bleed image with text overlay */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMAGES.spaMassage} alt="Massage therapy at home" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-ink-900/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <HomeIcon size={22} className="text-rose-400" />
              <p className="text-xs uppercase tracking-wider-3 text-rose-400">Fargo at Home</p>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-cream-50 leading-[1.05] text-balance">
              The salon, delivered.
            </h1>
            <p className="mt-6 text-lg text-cream-100/80 leading-relaxed max-w-md">
              We bring our services to your home — the same specialists, the same standards.
              For busy days, new mothers, groups, or anyone who'd rather stay in.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — numbered steps, not card grid */}
      <section className="py-20 lg:py-28 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionHeading
              eyebrow="How It Works"
              title="Three steps, no complications"
            />
          </Reveal>
          <div className="mt-14 max-w-3xl">
            {[
              { num: '01', title: 'Choose your services', desc: 'Select any service marked as home-service eligible. You can combine multiple services in one visit.' },
              { num: '02', title: 'Pick a time and share your address', desc: 'Tell us when and where. We cover ' + area + '. A small callout fee applies to cover travel.' },
              { num: '03', title: 'We arrive and set up', desc: 'Your specialist brings everything needed. You provide a comfortable space with good lighting and access to water.' },
            ].map((step, i) => (
              <Reveal key={step.num} delay={i * 100}>
                <div className="flex gap-8 py-8 border-b border-ink-100 last:border-0">
                  <span className="text-4xl font-display text-rose-400/40 shrink-0">{step.num}</span>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-display text-ink-900 mb-2">{step.title}</h3>
                    <p className="text-ink-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section className="py-12 bg-ink-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid sm:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <MapPin size={22} className="text-rose-400 shrink-0 mt-1" />
            <div>
              <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-1">Coverage Area</p>
              <p className="text-cream-100 text-sm">{area}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Car size={22} className="text-rose-400 shrink-0 mt-1" />
            <div>
              <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-1">Callout Fee</p>
              <p className="text-cream-100 text-sm">{formatPrice(Number(fee) || 2000)} — added to your service total</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock size={22} className="text-rose-400 shrink-0 mt-1" />
            <div>
              <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-1">Available Hours</p>
              <p className="text-cream-100 text-sm">Tue–Sat 9am–7pm, Sun 12pm–6pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Eligible services */}
      <section className="py-20 lg:py-28 bg-cream-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionHeading
              eyebrow="Available at Home"
              title="What we can bring to you"
              subtitle="These services are available as home visits. If a service isn't listed here, it requires our salon facilities."
            />
          </Reveal>
          <div className="mt-12 grid md:grid-cols-2 gap-px bg-ink-100 border border-ink-100">
            {homeServices.map((service, i) => (
              <Reveal key={service.id} delay={i * 40}>
                <Link
                  to={`/booking?service=${service.slug}&mode=home`}
                  className="group flex items-center justify-between gap-4 bg-cream-50 p-6 hover:bg-cream-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-display text-ink-900 group-hover:text-rose-500 transition-colors">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-ink-500">
                      <span className="flex items-center gap-1"><Clock size={13} /> {formatDuration(service.duration_minutes)}</span>
                      <span>{formatPriceRange(service.price_min, service.price_max)}</span>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-ink-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-cream-50 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl lg:text-4xl font-display text-ink-900 mb-6">Book a home visit</h2>
          <Link
            to="/booking?mode=home"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-all"
          >
            Start Booking <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
