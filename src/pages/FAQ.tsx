import { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import PageMeta from '@/components/ui/PageMeta';
import { useSettings } from '@/lib/hooks';
import { getFaqSections } from '@/lib/content';

export default function FAQ() {
  const [open, setOpen] = useState<string | null>('0-0');
  const { settings } = useSettings();
  const sections = getFaqSections(settings);

  return (
    <>
      <PageMeta title="FAQ & Policies" description="Frequently asked questions about booking, home services, payments, and cancellation policies at Fargo Unisex Salon & Spa." path="/faq" />

      {/* Header */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-cream-100 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-5">FAQ & Policies</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-ink-900 leading-[1.05] text-balance max-w-3xl">
            Things people ask, answered plainly.
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-cream-50">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12">
          {sections.map((section, si) => (
            <div key={section.title} className="mb-12 last:mb-0">
              <Reveal>
                <SectionHeading title={section.title} />
              </Reveal>
              <div className="mt-6 divide-y divide-ink-100 border-y border-ink-100">
                {section.items.map((item, ii) => {
                  const id = `${si}-${ii}`;
                  const isOpen = open === id;
                  return (
                    <Reveal key={id} delay={ii * 50}>
                      <button
                        onClick={() => setOpen(isOpen ? null : id)}
                        className="w-full flex items-center justify-between gap-6 py-5 text-left group"
                        aria-expanded={isOpen}
                      >
                        <span className={`text-base lg:text-lg font-display transition-colors ${
                          isOpen ? 'text-rose-500' : 'text-ink-900 group-hover:text-ink-700'
                        }`}>
                          {item.q}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`shrink-0 text-ink-400 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-rose-500' : ''
                          }`}
                        />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-96 pb-5' : 'max-h-0'
                      }`}>
                        <p className="text-ink-600 leading-relaxed text-sm lg:text-base">
                          {item.a}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}

          <Reveal>
            <div className="mt-16 text-center bg-cream-100 border border-ink-100 p-10">
              <h3 className="text-xl font-display text-ink-900 mb-3">Still have questions?</h3>
              <p className="text-ink-600 mb-5 text-sm">We're happy to help. Reach out and we'll get back to you quickly.</p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase hover:bg-rose-500 transition-colors"
              >
                Contact Us <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
