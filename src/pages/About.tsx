import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { IMAGES } from '@/lib/images';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Staff } from '@/types';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

export default function About() {
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    supabase
      .from('staff')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => setStaff(data ?? []));
  }, []);

  return (
    <>
      {/* Hero — editorial split */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-6">
              <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-6">About Fargo</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-ink-900 leading-[1.05] text-balance">
                A salon built for everyone who walks through the door.
              </h1>
              <p className="mt-8 text-lg text-ink-600 leading-relaxed">
                Fargo Unisex Salon & Spa started with a simple frustration: too many salons
                treat people like numbers on a queue. We wanted something different — a place
                where the conversation matters as much as the cut, where taking your time
                is the point, not the problem.
              </p>
              <p className="mt-5 text-lg text-ink-600 leading-relaxed">
                We serve men and women. We do hair, skin, and body. We work in our salon
                and in your home. And we do all of it with the same standard: if we wouldn't
                be happy receiving it, we won't deliver it.
              </p>
            </div>
            <div className="lg:col-span-6">
              <div className="relative">
                <img
                  src={IMAGES.salonInterior4}
                  alt="Fargo salon interior"
                  className="w-full aspect-[4/5] object-cover"
                />
                <img
                  src={IMAGES.braiding}
                  alt="Braiding in progress"
                  className="absolute -bottom-8 -left-8 w-2/5 aspect-[3/4] object-cover border-8 border-cream-50 hidden lg:block"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values — horizontal strip */}
      <section className="py-16 bg-ink-900">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { title: 'Unisex by design', desc: 'Every service, every chair, every welcome — for anyone. No gendered pricing, no assumptions.' },
              { title: 'Pace over speed', desc: 'We book with buffer time between appointments so nothing feels rushed. Your slot is yours.' },
              { title: 'Honest pricing', desc: 'We quote ranges upfront and confirm the exact price before we start. No surprises at the till.' },
            ].map((value, i) => (
              <Reveal key={value.title} delay={i * 100}>
                <div>
                  <span className="text-4xl font-display text-rose-400/40 block mb-3">0{i + 1}</span>
                  <h3 className="text-xl font-display text-cream-50 mb-3">{value.title}</h3>
                  <p className="text-ink-300 leading-relaxed text-sm">{value.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-28 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionHeading
              eyebrow="The Team"
              title="People who take their craft seriously"
              subtitle="Our specialists each focus on specific areas. You're not getting a generalist — you're getting someone who works on your service every day."
            />
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {staff.map((member, i) => (
              <Reveal key={member.id} delay={i * 80}>
                <div className="group">
                  <div className="w-full aspect-[3/4] bg-ink-900 mb-4 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-ink-800 to-ink-900">
                      <span className="text-6xl font-display text-cream-50/30">{member.name.charAt(0)}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-display text-ink-900">{member.name}</h3>
                  <p className="text-xs uppercase tracking-wider-2 text-rose-500 mt-1">{member.role}</p>
                  {member.specialties && (
                    <p className="text-sm text-ink-500 mt-2">{member.specialties}</p>
                  )}
                  {member.bio && <p className="text-sm text-ink-600 mt-3 clamp-3">{member.bio}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream-100 border-t border-ink-100 text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="text-3xl lg:text-4xl font-display text-ink-900 mb-5">
            Come see for yourself.
          </h2>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-all"
          >
            Book a Session <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  );
}
