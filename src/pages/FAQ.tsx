import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

const FAQ_SECTIONS = [
  {
    title: 'Booking',
    items: [
      {
        q: 'Do I need to create an account to book?',
        a: 'No. You can book without signing up anywhere. We only ask for your name, phone, and email so we can confirm your appointment and send you a reminder.',
      },
      {
        q: 'Can I book multiple services in one appointment?',
        a: 'Yes. When booking, you can add as many services as you need. We calculate the total duration and price together, so you get one appointment block rather than separate visits.',
      },
      {
        q: 'How far in advance should I book?',
        a: 'We recommend booking at least 2–3 days ahead, especially for braiding, colouring, and spa services which take longer. For shorter services like trims and manicures, same-week bookings are usually fine.',
      },
      {
        q: 'Can I choose a specific stylist?',
        a: 'Yes. When booking, you can select from available specialists for each service. If you have no preference, we will assign the best fit based on availability.',
      },
    ],
  },
  {
    title: 'Home Service',
    items: [
      {
        q: 'Which services are available at home?',
        a: 'Most hair, nail, and massage services are available at home. Services that require specialised equipment (like hair colouring with salon-grade processing, or steam/sauna) are salon-only. Look for the "Home" badge on each service.',
      },
      {
        q: 'What area do you cover?',
        a: 'We cover locations within 15km of our salon. If you are outside this area, contact us and we will see what we can arrange.',
      },
      {
        q: 'Is there a callout fee?',
        a: 'Yes, a flat callout fee is added to your service total to cover travel. The exact amount is shown before you confirm your booking.',
      },
      {
        q: 'What do I need to provide?',
        a: 'A comfortable space with good lighting and access to water. Your specialist brings all tools and products. For massage, a firm surface (bed or mat) is needed.',
      },
    ],
  },
  {
    title: 'Payments & Cancellation',
    items: [
      {
        q: 'Do I need to pay when booking?',
        a: 'No. Payment is optional at booking time. You can pay in person after your appointment, or choose to pre-pay online to secure your slot.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept card payments online and cash or card in person. For home services, payment is collected on-site unless pre-paid.',
      },
      {
        q: 'What is your cancellation policy?',
        a: 'You can cancel or reschedule up to 24 hours before your appointment at no charge. Within 24 hours, a 50% fee may apply. No-shows are charged the full service amount if pre-paid.',
      },
      {
        q: 'What happens if I am running late?',
        a: 'Call us. We hold your slot for 15 minutes. After that, we may need to shorten your service or reschedule, depending on our schedule for the day.',
      },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<string | null>('0-0');

  return (
    <>
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
          {FAQ_SECTIONS.map((section, si) => (
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
