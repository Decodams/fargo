import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Home as HomeIcon, Store, ArrowRight } from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useSettings } from '@/lib/hooks';
import { getSetting } from '@/lib/utils';

interface ConfirmationState {
  reference: string;
  name: string;
  services: string[];
  date: string;
  mode: string;
  total: number;
  prepay: boolean;
}

export default function BookingConfirmation() {
  const location = useLocation();
  const { settings } = useSettings();
  const currency = getSetting(settings, 'currency_symbol');
  const state = location.state as ConfirmationState | null;

  if (!state) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-ink-900 mb-4">No booking to confirm</h1>
          <Link to="/booking" className="text-rose-500 hover:underline">Start a new booking</Link>
        </div>
      </div>
    );
  }

  return (
    <section className="pt-32 pb-20 min-h-screen bg-cream-50">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <CheckCircle size={56} className="text-olive-500 mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-display text-ink-900 mb-3">Your booking is confirmed</h1>
          <p className="text-ink-600">Thank you, {state.name}. We've sent a confirmation to your email.</p>
        </div>

        <div className="bg-cream-100 border border-ink-100 p-6 lg:p-8">
          <div className="flex items-center justify-between pb-5 border-b border-ink-100">
            <span className="text-xs uppercase tracking-wider-2 text-ink-400">Reference</span>
            <span className="text-lg font-display text-ink-900">{state.reference}</span>
          </div>

          <div className="py-5 space-y-4 border-b border-ink-100">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-ink-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider-2 text-ink-400">When</p>
                <p className="text-ink-800">{formatDateTime(state.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {state.mode === 'home' ? <HomeIcon size={18} className="text-ink-400 mt-0.5 shrink-0" /> : <Store size={18} className="text-ink-400 mt-0.5 shrink-0" />}
              <div>
                <p className="text-xs uppercase tracking-wider-2 text-ink-400">Where</p>
                <p className="text-ink-800">{state.mode === 'home' ? 'Home service — we come to you' : 'In salon'}</p>
              </div>
            </div>
          </div>

          <div className="py-5 border-b border-ink-100">
            <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-3">Services</p>
            <ul className="space-y-2">
              {state.services.map((s, i) => (
                <li key={i} className="text-ink-800 flex items-center gap-2">
                  <Clock size={14} className="text-ink-400" /> {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider-2 text-ink-400">{state.prepay ? 'Paid' : 'To pay'}</span>
            <span className="text-xl font-display text-ink-900">{formatPrice(state.total, currency)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-outline">
            Back to Home
          </Link>
          <Link to="/services" className="btn-primary">
            Explore More Services <ArrowRight size={15} />
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-ink-400">
          Need to change or cancel? Call us or send a message through the <Link to="/contact" className="text-rose-500 hover:underline">contact page</Link>.
        </p>
      </div>
    </section>
  );
}
