import { Link } from 'react-router-dom';
import { Instagram, Facebook, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useSettings, useBusinessHours } from '@/lib/hooks';
import { getSetting } from '@/lib/utils';
import TikTokIcon from '@/components/ui/TikTokIcon';
import logo from '@/image/Logo 2.png';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatHourTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function Footer() {
  const { settings } = useSettings();
  const { hours } = useBusinessHours();
  const phone = getSetting(settings, 'contact_phone');
  const email = getSetting(settings, 'contact_email');
  const address = getSetting(settings, 'address');
  const instagram = getSetting(settings, 'instagram_url');
  const facebook = getSetting(settings, 'facebook_url');
  const tiktok = getSetting(settings, 'tiktok_url');

  const openDays = hours.filter((h) => !h.is_closed);
  const closedDays = hours.filter((h) => h.is_closed);

  const hasSocials = instagram || facebook || tiktok;

  return (
    <footer className="bg-ink-900 text-cream-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src={logo} alt="Fargo Unisex Salon and Spa" className="h-20 w-auto object-contain mb-3" />
            <p className="text-sm leading-relaxed text-ink-300 max-w-xs">
              A unisex hair, beauty, and wellness destination. In-salon and at-home,
              built around how you live.
            </p>
            {hasSocials && (
              <div className="flex items-center gap-3 mt-6">
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-ink-700 hover:border-rose-400 hover:text-rose-400 transition-colors" aria-label="Instagram">
                    <Instagram size={16} />
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-ink-700 hover:border-rose-400 hover:text-rose-400 transition-colors" aria-label="Facebook">
                    <Facebook size={16} />
                  </a>
                )}
                {tiktok && (
                  <a href={tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center border border-ink-700 hover:border-rose-400 hover:text-rose-400 transition-colors" aria-label="TikTok">
                    <TikTokIcon size={16} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs uppercase tracking-wider-2 text-ink-400 mb-5">Explore</h4>
            <ul className="space-y-3">
              {[
                { to: '/services', label: 'Services' },
                { to: '/home-services', label: 'Home Service' },
                { to: '/booking', label: 'Book a Session' },
                { to: '/gallery', label: 'Gallery' },
                { to: '/products', label: 'Products' },
                { to: '/about', label: 'About' },
                { to: '/faq', label: 'FAQ & Policies' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-ink-300 hover:text-cream-50 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-wider-2 text-ink-400 mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-ink-300">
                <Phone size={15} className="mt-0.5 shrink-0 text-ink-500" />
                <span>{phone}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink-300">
                <Mail size={15} className="mt-0.5 shrink-0 text-ink-500" />
                <span>{email}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-ink-300">
                <MapPin size={15} className="mt-0.5 shrink-0 text-ink-500" />
                <span>{address}</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-xs uppercase tracking-wider-2 text-ink-400 mb-5 flex items-center gap-2">
              <Clock size={14} /> Hours
            </h4>
            {openDays.length > 0 ? (
              <ul className="space-y-2.5 text-sm text-ink-300">
                {openDays.map((h) => (
                  <li key={h.day_of_week} className="flex justify-between gap-4">
                    <span>{DAY_LABELS[h.day_of_week]}</span>
                    <span className="text-ink-400">{formatHourTime(h.open_time)} – {formatHourTime(h.close_time)}</span>
                  </li>
                ))}
                {closedDays.map((h) => (
                  <li key={h.day_of_week} className="flex justify-between gap-4">
                    <span>{DAY_LABELS[h.day_of_week]}</span>
                    <span className="text-ink-500">Closed</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <Link
              to="/booking"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 border border-ink-700 text-xs uppercase tracking-wider-2 hover:border-rose-400 hover:text-rose-400 transition-colors"
            >
              Book Now
            </Link>
          </div>
        </div>

        <div className="border-t border-ink-800 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            © 2026 Fargo Unisex Salon & Spa. Site by Cedoka Global Limited.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/faq" className="text-xs text-ink-500 hover:text-ink-300 transition-colors">
              Policies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
