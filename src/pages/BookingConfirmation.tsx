import { useState, useEffect } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, Download, MapPin, Phone, Mail, RefreshCw } from 'lucide-react';
import { useBookingTicket } from '@/components/ui/BookingTicketPDF';
import { useSettings } from '@/lib/hooks';
import { getSetting } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const { settings } = useSettings();
  const navigateState = state || {};
  const reference = navigateState.reference;
  const { generatePDF } = useBookingTicket();

  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const name = navigateState.name;
  const services = navigateState.services;
  const date = navigateState.date;
  const mode = navigateState.mode;
  const total = navigateState.total;
  const prepay = navigateState.prepay;
  const customerEmail = navigateState.customer_email;
  const bankName = navigateState.bank_name || 'Moniepoint';
  const accountNumber = navigateState.account_number || '5308789513';
  const accountName = navigateState.account_name || 'Fargo Unisex Salon and Spa';

  const currency = getSetting(settings, 'currency_symbol') || '₦';
  const phone = getSetting(settings, 'contact_phone') || '09012101020';
  const email = getSetting(settings, 'contact_email') || 'Fargounisexsalon@gmail.com';
  const address = getSetting(settings, 'address') || 'No 8 Dr Billy Okoye Boulevard By Revenue House/Immigration Awka Anambra State';

  // Noindex this transactional page
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (meta) { meta.content = 'noindex'; } else {
      const el = document.createElement('meta'); el.name = 'robots'; el.content = 'noindex'; document.head.appendChild(el);
    }
  }, []);

  // Determine the effective confirmation status: live DB value > navigate state
  const effectiveStatus = liveStatus ?? navigateState.confirmation_status;
  const isPending = effectiveStatus === 'pending';

  // Poll the database every 10 seconds to check for confirmation
  useEffect(() => {
    if (!isSupabaseConfigured || !reference) return;

    const checkStatus = async () => {
      const { data } = await supabase.rpc('get_public_booking_status', { booking_reference: reference });
      if (data && data !== liveStatus) {
        setLiveStatus(data);
      }
    };

    // Check immediately
    checkStatus();

    // Then poll every 10 seconds while pending
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [reference, liveStatus]);

  // If no state, redirect to home after all hooks have been declared.
  if (!reference) {
    return <Navigate to="/" replace />;
  }

  const handleRefresh = async () => {
    if (!reference) return;
    setChecking(true);
    const { data } = await supabase.rpc('get_public_booking_status', { booking_reference: reference });
    if (data) {
      setLiveStatus(data);
    }
    setChecking(false);
  };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'N/A';
  const formattedTime = date
    ? new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : 'N/A';

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-xl">
        {isPending ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-amber-400 bg-amber-50">
              <Clock size={28} className="text-amber-500" />
            </div>
            <h1 className="text-3xl font-display text-ink-900 mb-3">Pending Confirmation</h1>
            <p className="text-ink-600 mb-2 max-w-md mx-auto leading-relaxed">
              Your booking has been received and your payment is being verified.
              You'll see your confirmation ticket once the admin approves your payment.
            </p>
            <p className="text-sm text-ink-400 mb-6">
              Reference: <span className="font-mono font-medium text-ink-700">{reference}</span>
            </p>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={checking}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider-2 text-ink-500 hover:text-ink-900 transition-colors mb-8 disabled:opacity-50"
            >
              <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
              {checking ? 'Checking...' : 'Check status'}
            </button>

            {/* Booking Summary */}
            <div className="bg-cream-100 border border-ink-100 p-6 text-left mb-8">
              <h2 className="text-xs uppercase tracking-wider-2 text-ink-400 mb-4">Booking Summary</h2>
              <div className="space-y-3 text-sm">
                {name && (
                  <div className="flex justify-between">
                    <span className="text-ink-500">Customer</span>
                    <span className="text-ink-900 font-medium">{name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-ink-500">Date</span>
                  <span className="text-ink-900">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Time</span>
                  <span className="text-ink-900">{formattedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Mode</span>
                  <span className="text-ink-900">{mode === 'in_salon' ? 'In Salon' : 'Home Service'}</span>
                </div>
                {services && (
                  <div className="flex justify-between">
                    <span className="text-ink-500">Services</span>
                    <span className="text-ink-900 text-right max-w-[60%]">{services?.join(', ')}</span>
                  </div>
                )}
                {total != null && (
                  <div className="flex justify-between pt-3 border-t border-ink-200">
                    <span className="text-ink-900 font-medium">Total</span>
                    <span className="text-ink-900 font-medium">{currency}{total?.toLocaleString()} (Bank Transfer)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank details reminder */}
            <div className="bg-cream-100 border border-ink-100 p-5 mb-8 text-left text-sm">
              <p className="font-medium text-ink-900 mb-2">Transfer Details</p>
              <div className="space-y-1 text-ink-600">
                <p>Bank: {bankName}</p>
                <p>Account Name: {accountName}</p>
                <p>Account Number: <span className="font-mono font-medium text-ink-900">{accountNumber}</span></p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 mb-8 text-sm text-amber-800">
              <p className="font-medium mb-1">What happens next?</p>
              <p className="text-amber-700">Our team will verify your bank transfer and confirm your booking.
              You'll receive an email at <strong>{customerEmail || 'your email'}</strong> once confirmed.</p>
            </div>

            <p className="text-xs text-ink-400 mb-6">
              Questions? Contact us at{' '}
              <a href={`mailto:${email}`} className="text-rose-500 hover:underline">{email}</a>
              {' '}or call <a href={`tel:${phone}`} className="text-rose-500 hover:underline">{phone}</a>
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-wider-2 text-ink-900 border-b border-ink-900 pb-1 hover:text-rose-500 hover:border-rose-500 transition-colors"
            >
              Back to Home <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-olive-500">
              <CheckCircle size={28} className="text-cream-50" />
            </div>
            <h1 className="text-3xl font-display text-ink-900 mb-3">Booking Confirmed</h1>
            <p className="text-ink-600 mb-8">Your booking is confirmed. A confirmation email has been sent.</p>

            <div className="bg-ink-900 text-cream-100 p-6 sm:p-8 text-left mb-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-700">
                <div>
                  <h2 className="text-xl font-display text-cream-50">Fargo Salon & Spa</h2>
                  <p className="text-xs text-ink-400 mt-0.5">Booking Confirmation Ticket</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-400 uppercase tracking-wider">Ref</p>
                  <p className="font-mono text-cream-50 font-bold text-lg">{reference}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">Customer</p>
                  <p className="text-cream-50 font-medium">{name}</p>
                </div>
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">Payment</p>
                  <p className="text-cream-50 font-medium">{currency}{total?.toLocaleString()} {prepay ? '(Prepaid)' : '(Postpaid)'}</p>
                </div>
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">Date</p>
                  <p className="text-cream-50">{formattedDate}</p>
                </div>
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">Time</p>
                  <p className="text-cream-50">{formattedTime}</p>
                </div>
                <div>
                  <p className="text-ink-400 text-xs uppercase tracking-wider mb-1">Mode</p>
                  <p className="text-cream-50">{mode === 'in_salon' ? 'In Salon' : 'Home Service'}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-ink-400 text-xs uppercase tracking-wider mb-2">Services</p>
                <div className="space-y-1">
                  {services?.map((s: string, i: number) => (
                    <p key={i} className="text-cream-100 text-sm">• {s}</p>
                  ))}
                </div>
              </div>

              <div className="border-t border-ink-700 pt-4 text-xs text-ink-400 space-y-1">
                <div className="flex items-center gap-2"><MapPin size={12} /> {address}</div>
                <div className="flex items-center gap-2"><Phone size={12} /> {phone}</div>
                <div className="flex items-center gap-2"><Mail size={12} /> {email}</div>
              </div>
            </div>

            <button
              onClick={generatePDF}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-colors mb-8"
            >
              <Download size={16} /> Download PDF Ticket
            </button>

            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-wider-2 text-ink-900 border-b border-ink-900 pb-1 hover:text-rose-500 hover:border-rose-500 transition-colors"
              >
                Back to Home <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
