import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock, Home as HomeIcon, Check, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPriceRange, formatDuration } from '@/lib/utils';
import { IMAGES } from '@/lib/images';
import type { Service, Category, Staff } from '@/types';
import Reveal from '@/components/ui/Reveal';

const SERVICE_IMAGES: Record<string, string> = {
  'hair-styling-blow-dry': IMAGES.hairStyling,
  'braiding': IMAGES.braiding,
  'dreadlocks': IMAGES.braidedPortrait,
  'hair-colouring': IMAGES.hairspray,
  'trimming-haircuts': IMAGES.barber,
  'relaxing-texturising': IMAGES.womanHairStyling,
  'deep-conditioning-treatment': IMAGES.facialSkincare,
  'scalp-treatment': IMAGES.facialSkincare,
  'facials': IMAGES.facial,
  'pedicure': IMAGES.spaFootMassage,
  'manicure': IMAGES.manicure,
  'lash-application-lash-lift': IMAGES.hairStyling2,
  'eyebrow-shaping-threading': IMAGES.facialTreatment,
  'body-waxing-hair-removal': IMAGES.spaMassage2,
  'massage-therapy': IMAGES.spaMassage,
  'body-scrub-exfoliation': IMAGES.spaRoom,
  'nail-art': IMAGES.nailPolish,
  'head-massage': IMAGES.spaFootMassage,
  'steam-sauna-session': IMAGES.spaRoom,
};

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [related, setRelated] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data: svc } = await supabase
        .from('services')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (svc) {
        setService(svc as Service);
        if (svc.category_id) {
          const { data: cat } = await supabase
            .from('categories')
            .select('*')
            .eq('id', svc.category_id)
            .maybeSingle();
          setCategory(cat as Category);

          const { data: rel } = await supabase
            .from('services')
            .select('*')
            .eq('category_id', svc.category_id)
            .neq('id', svc.id)
            .eq('is_active', true)
            .limit(3);
          setRelated((rel ?? []) as Service[]);
        }

        const { data: ssData } = await supabase
          .from('staff_services')
          .select('staff_id')
          .eq('service_id', svc.id);
        if (ssData && ssData.length > 0) {
          const staffIds = ssData.map((s) => s.staff_id);
          const { data: staffData } = await supabase
            .from('staff')
            .select('*')
            .in('id', staffIds)
            .eq('is_active', true);
          setStaff((staffData ?? []) as Staff[]);
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="h-96 bg-cream-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-display text-ink-900 mb-4">Service not found</h1>
          <Link to="/services" className="text-rose-500 hover:underline">
            Back to services
          </Link>
        </div>
      </div>
    );
  }

  const image = SERVICE_IMAGES[service.slug] ?? IMAGES.salonInterior;

  return (
    <>
      {/* Breadcrumb */}
      <div className="pt-28 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors">
            <ArrowLeft size={15} /> All Services
          </Link>
        </div>
      </div>

      {/* Hero — asymmetric split with image */}
      <section className="py-8 lg:py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-4">
                {category?.name ?? 'Service'}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-ink-900 leading-[1.05] text-balance">
                {service.name}
              </h1>
              {service.description && (
                <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-xl">
                  {service.description}
                </p>
              )}

              <div className="mt-8 grid grid-cols-2 gap-px bg-ink-100 border border-ink-100">
                <div className="bg-cream-50 p-5">
                  <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-2">Duration</p>
                  <p className="text-lg font-display text-ink-900 flex items-center gap-2">
                    <Clock size={18} /> {formatDuration(service.duration_minutes)}
                  </p>
                </div>
                <div className="bg-cream-50 p-5">
                  <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-2">Price Range</p>
                  <p className="text-lg font-display text-ink-900">
                    {formatPriceRange(service.price_min, service.price_max)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {service.home_service_eligible && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-olive-500/10 text-olive-600 text-sm">
                    <HomeIcon size={15} /> Available as home service
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-ink-100 text-ink-700 text-sm">
                  <Check size={15} /> Walk-in friendly
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to={`/booking?service=${service.slug}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-all"
                >
                  Book This Service <ArrowRight size={15} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-ink-900 text-ink-900 text-sm tracking-wider-2 uppercase font-medium hover:bg-ink-900 hover:text-cream-50 transition-all"
                >
                  Ask a Question
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <img
                src={image}
                alt={service.name}
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Specialists */}
      {staff.length > 0 && (
        <section className="py-16 lg:py-20 bg-cream-100 border-y border-ink-100">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <h2 className="text-2xl lg:text-3xl font-display text-ink-900 mb-8">
              Who does this
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {staff.map((member, i) => (
                <Reveal key={member.id} delay={i * 80}>
                  <div className="bg-cream-50 p-6 border border-ink-100">
                    <div className="w-12 h-12 rounded-full bg-ink-900 text-cream-50 flex items-center justify-center text-lg font-display mb-4">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="text-lg font-display text-ink-900">{member.name}</h3>
                    <p className="text-xs uppercase tracking-wider-2 text-ink-400 mt-1">{member.role}</p>
                    {member.bio && <p className="text-sm text-ink-500 mt-3 clamp-3">{member.bio}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related services */}
      {related.length > 0 && (
        <section className="py-16 lg:py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <h2 className="text-2xl lg:text-3xl font-display text-ink-900 mb-8">
              In the same category
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/services/${rel.slug}`}
                  className="group block border border-ink-100 p-6 hover:border-ink-900 transition-colors"
                >
                  <h3 className="text-xl font-display text-ink-900 group-hover:text-rose-500 transition-colors">
                    {rel.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-sm text-ink-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {formatDuration(rel.duration_minutes)}</span>
                    <span className="text-ink-700">{formatPriceRange(rel.price_min, rel.price_max)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
