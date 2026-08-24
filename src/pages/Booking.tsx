import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Clock, Home as HomeIcon, Store, Calendar, CreditCard, Loader2, Info } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useSettings } from '@/lib/hooks';
import { getSetting, formatPrice, formatPriceRange, formatDuration, DAY_NAMES, DAY_SHORT, MONTH_NAMES } from '@/lib/utils';
import type { Service, Staff, BusinessHour, Category } from '@/types';
import { FALLBACK_SERVICES, FALLBACK_STAFF, FALLBACK_BUSINESS_HOURS, FALLBACK_CATEGORIES, withFallback } from '@/lib/fallbackData';
import Reveal from '@/components/ui/Reveal';

type Step = 'service' | 'mode' | 'datetime' | 'details' | 'payment' | 'submitting';
type Mode = 'in_salon' | 'home';

interface BookingState {
  selectedServices: Service[];
  mode: Mode;
  staffId: string | null;
  date: Date | null;
  timeSlot: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  homeAddress: string;
  notes: string;
  prepay: boolean;
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'service', label: 'Services' },
  { key: 'mode', label: 'Mode' },
  { key: 'datetime', label: 'Date & Time' },
  { key: 'details', label: 'Details' },
  { key: 'payment', label: 'Payment' },
];

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [serviceCategory, setServiceCategory] = useState<string>('all');
  const [servicePage, setServicePage] = useState(1);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [existingBookings, setExistingBookings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState('');

  const [state, setState] = useState<BookingState>({
    selectedServices: [],
    mode: 'in_salon',
    staffId: null,
    date: null,
    timeSlot: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    homeAddress: '',
    notes: '',
    prepay: false,
  });

  const currency = getSetting(settings, 'currency_symbol');
  const homeFee = Number(getSetting(settings, 'home_service_fee')) || 2000;
  const bufferMin = Number(getSetting(settings, 'buffer_time_minutes')) || 15;

  useEffect(() => {
    (async () => {
      const [{ data: svcs }, { data: stf }, { data: bh }, { data: cats }] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).order('display_order'),
        supabase.from('staff').select('*').eq('is_active', true).order('display_order'),
        supabase.from('business_hours').select('*').order('day_of_week'),
        supabase.from('categories').select('*').order('display_order'),
      ]);

      // Fall back to curated offline data when the backend is empty / unconfigured
      // so the flow is always usable for previews.
      const resolvedServices = withFallback(svcs as Service[] | null, FALLBACK_SERVICES);
      const resolvedStaff = withFallback(stf as Staff[] | null, FALLBACK_STAFF);
      const resolvedHours = withFallback(bh as BusinessHour[] | null, FALLBACK_BUSINESS_HOURS);
      const resolvedCategories = withFallback(cats as Category[] | null, FALLBACK_CATEGORIES);

      setServices(resolvedServices);
      setCategories(resolvedCategories);
      setStaff(resolvedStaff);
      setBusinessHours(resolvedHours);
      setLoading(false);

      // Pre-select service from URL
      const preService = searchParams.get('service');
      const preMode = searchParams.get('mode');
      if (preService) {
        const svc = resolvedServices.find((s) => s.slug === preService);
        if (svc) {
          setState((prev) => ({
            ...prev,
            selectedServices: [svc],
            mode: preMode === 'home' ? 'home' : 'in_salon',
          }));
        }
      } else if (preMode === 'home') {
        setState((prev) => ({ ...prev, mode: 'home' }));
      }
    })();
  }, [searchParams]);

  // Load existing bookings when date or staff selection changes
  useEffect(() => {
    if (!state.date) return;
    const start = new Date(state.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(state.date);
    end.setHours(23, 59, 59, 999);

    (async () => {
      try {
        const { data } = await supabase
          .from('bookings')
          .select('scheduled_at,duration_minutes,staff_id')
          .in('status', ['confirmed', 'pending'])
          .gte('scheduled_at', start.toISOString())
          .lte('scheduled_at', end.toISOString());
        if (!data) {
          setExistingBookings([]);
          return;
        }
        const slots: string[] = [];
        data.forEach((b) => {
          // A slot is occupied if the chosen specialist is booked, or (no preference)
          // if any booking without a specific specialist exists at that time.
          const occupies =
            !state.staffId || !b.staff_id || b.staff_id === state.staffId;
          if (!occupies) return;
          const startTime = new Date(b.scheduled_at);
          const endTime = new Date(startTime.getTime() + (b.duration_minutes || 30) * 60000);
          let t = new Date(startTime);
          while (t < endTime) {
            slots.push(t.toTimeString().slice(0, 5));
            t = new Date(t.getTime() + 30 * 60000);
          }
        });
        setExistingBookings([...new Set(slots)]);
      } catch {
        setExistingBookings([]);
      }
    })();
  }, [state.date, state.staffId]);

  const totalDuration = state.selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  const serviceTotal = state.selectedServices.reduce((sum, s) => sum + s.price_max, 0);
  const grandTotal = state.mode === 'home' ? serviceTotal + homeFee : serviceTotal;

  // Service selection: filter by category, paginate (max 7 per page)
  const SERVICES_PER_PAGE = 7;
  const filteredServices = serviceCategory === 'all'
    ? services
    : services.filter((s) => s.category_id === serviceCategory);
  const totalServicePages = Math.max(1, Math.ceil(filteredServices.length / SERVICES_PER_PAGE));
  const safeServicePage = Math.min(servicePage, totalServicePages);
  const pageServices = filteredServices.slice(
    (safeServicePage - 1) * SERVICES_PER_PAGE,
    safeServicePage * SERVICES_PER_PAGE,
  );

  const update = useCallback((patch: Partial<BookingState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const toggleService = (service: Service) => {
    setState((prev) => {
      const exists = prev.selectedServices.find((s) => s.id === service.id);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((s) => s.id !== service.id)
          : [...prev.selectedServices, service],
      };
    });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'service': return state.selectedServices.length > 0;
      case 'mode':
        if (state.mode === 'home') {
          return state.selectedServices.every((s) => s.home_service_eligible);
        }
        return true;
      case 'datetime': return state.date !== null && state.timeSlot !== null;
      case 'details':
        return (
          state.customerName.trim().length > 1 &&
          /\S+@\S+\.\S+/.test(state.customerEmail) &&
          state.customerPhone.trim().length >= 7 &&
          (state.mode !== 'home' || state.homeAddress.trim().length > 5)
        );
      case 'payment': return true;
      default: return false;
    }
  };

  const proceedHint = (): string | null => {
    if (canProceed()) return null;
    switch (step) {
      case 'service':
        return 'Select at least one service to continue.';
      case 'mode':
        return 'Some selected services aren’t available for home service. Switch to In Salon or remove them.';
      case 'datetime':
        return 'Choose a date and an available time slot.';
      case 'details': {
        const missing: string[] = [];
        if (state.customerName.trim().length <= 1) missing.push('name');
        if (!/\S+@\S+\.\S+/.test(state.customerEmail)) missing.push('email');
        if (state.customerPhone.trim().length < 7) missing.push('phone');
        if (state.mode === 'home' && state.homeAddress.trim().length <= 5) missing.push('home address');
        return `Please complete: ${missing.join(', ')}.`;
      }
      default:
        return null;
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.key);
  };

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
  };

  const generateTimeSlots = (): { time: string; label: string; available: boolean }[] => {
    if (!state.date) return [];
    const dayOfWeek = state.date.getDay();
    const bh = businessHours.find((b) => b.day_of_week === dayOfWeek);
    if (!bh || bh.is_closed) return [];

    const slots: { time: string; label: string; available: boolean }[] = [];
    const [openH, openM] = bh.open_time.split(':').map(Number);
    const [closeH, closeM] = bh.close_time.split(':').map(Number);

    let h = openH;
    let m = openM;
    while (h < closeH || (h === closeH && m < closeM)) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const isTaken = existingBookings.includes(timeStr);
      // Don't show slots that are past for today
      const now = new Date();
      const slotDate = new Date(state.date);
      slotDate.setHours(h, m, 0, 0);
      const isPast = slotDate < now;
      slots.push({
        time: timeStr,
        label: new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        available: !isTaken && !isPast,
      });
      m += 30;
      if (m >= 60) { m -= 60; h++; }
    }
    return slots;
  };

  const handleSubmit = async () => {
    setStep('submitting');
    setSubmitError('');

    try {
      if (!state.date || !state.timeSlot) throw new Error('Missing date or time');
      const [h, m] = state.timeSlot.split(':').map(Number);
      const scheduledAt = new Date(state.date);
      scheduledAt.setHours(h, m, 0, 0);

      const bookingData: Record<string, unknown> = {
        staff_id: state.staffId,
        customer_name: state.customerName.trim(),
        customer_email: state.customerEmail.trim(),
        customer_phone: state.customerPhone.trim(),
        service_mode: state.mode,
        home_address: state.mode === 'home' ? state.homeAddress.trim() : null,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: totalDuration + bufferMin,
        total_price: grandTotal,
        payment_status: state.prepay ? 'prepaid' : 'postpaid',
        confirmation_status: state.prepay ? 'pending' : 'confirmed',
        status: 'pending',
        notes: state.notes.trim() || null,
      };

      let reference: string;

      if (isSupabaseConfigured) {
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();
        if (bookingError) throw bookingError;
        reference = booking.reference;

        const bsData = state.selectedServices.map((s) => ({
          booking_id: booking.id,
          service_id: s.id,
          service_name: s.name,
          price: s.price_max,
          duration_minutes: s.duration_minutes,
        }));
        await supabase.from('booking_services').insert(bsData);

// Fire notification email (non-blocking — don't fail the booking if email fails)
        try {
          const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;
          await fetch(fnUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
            body: JSON.stringify({
              type: 'booking',
              reference: reference,
              customer_name: state.customerName.trim(),
              customer_email: state.customerEmail.trim(),
              customer_phone: state.customerPhone.trim(),
              service_mode: state.mode,
              scheduled_at: scheduledAt.toISOString(),
              duration_minutes: totalDuration + bufferMin,
              total_price: grandTotal,
              services: state.selectedServices.map((s) => s.name),
              home_address: state.mode === 'home' ? state.homeAddress.trim() : null,
              notes: state.notes.trim() || null,
              confirmation_status: state.prepay ? 'pending' : 'confirmed',
            }),
          });
        } catch {
          // Email failure is non-critical — booking was saved successfully
        }
      } else {
        // Preview mode — simulate a saved booking so the flow is fully usable offline.
        reference = 'FAR-' + Math.random().toString(36).slice(2, 10).toUpperCase();
        await new Promise((r) => setTimeout(r, 700));
      }

      // Navigate to confirmation with reference
      navigate('/booking/confirmation', {
        state: {
          reference: reference,
          name: state.customerName,
          services: state.selectedServices.map((s) => s.name),
          date: scheduledAt.toISOString(),
          mode: state.mode,
          total: grandTotal,
          prepay: state.prepay,
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      setStep('payment');
    }
  };

  const hint = proceedHint();

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-ink-400" />
      </div>
);
}

/* Filter chip component for service category pagination */
type FilterChipProps = { active: boolean; onClick: () => void; children: React.ReactNode };

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs capitalize rounded text-ink-600 transition-colors ${
        active ? 'bg-ink-900 text-cream-50' : 'border-ink-200 text-ink-400 hover:border-ink-900'
      }`}
    >
      {children}
    </button>
  );
}

  return (
    <>
      {/* Header */}
      <section className="pt-28 pb-8 bg-cream-100 border-b border-ink-100">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-4">Booking</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-ink-900 leading-[1.1]">
            Book a session
          </h1>

          {!isSupabaseConfigured && (
            <div className="mt-4 inline-flex items-start gap-2 text-xs text-ink-600 bg-cream-200/70 border border-ink-200 px-3 py-2 max-w-xl">
              <Info size={14} className="text-rose-500 mt-0.5 shrink-0" />
              <span>
                Preview mode — sample data is shown and bookings won’t be saved. Add your Supabase
                credentials in <code className="font-mono">.env</code> to go live.
              </span>
            </div>
          )}

          {/* Live summary */}
          {state.selectedServices.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-600">
              <span>
                <span className="text-ink-900 font-display">{state.selectedServices.length}</span> service
                {state.selectedServices.length > 1 ? 's' : ''} selected
              </span>
              <span className="capitalize">{state.mode === 'home' ? 'Home service' : 'In salon'}</span>
              <span>
                <span className="text-ink-900 font-display">{formatPrice(grandTotal, currency)}</span> total
              </span>
            </div>
          )}

          {/* Progress indicator */}
          {step !== 'submitting' && (
            <div className="mt-8 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2 shrink-0">
                  <div className={`flex items-center gap-2 ${i === stepIndex ? 'text-ink-900' : i < stepIndex ? 'text-olive-600' : 'text-ink-300'}`}>
                    <span className={`w-7 h-7 flex items-center justify-center text-xs border transition-colors ${
                      i === stepIndex ? 'border-ink-900 bg-ink-900 text-cream-50'
                      : i < stepIndex ? 'border-olive-500 bg-olive-500 text-cream-50'
                      : 'border-ink-200'
                    }`}>
                      {i < stepIndex ? <Check size={14} /> : i + 1}
                    </span>
                    <span className="text-xs uppercase tracking-wider-2 hidden sm:block">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`w-6 h-px ${i < stepIndex ? 'bg-olive-500' : 'bg-ink-200'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-10 lg:py-16 bg-cream-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          {/* Step: Service selection */}
          {step === 'service' && (
            <Reveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <h2 className="text-xl font-display text-ink-900">Choose your services</h2>
                <p className="text-sm text-ink-500">
                  {filteredServices.length} service{filteredServices.length === 1 ? '' : 's'}
                </p>
              </div>

              {/* Category filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <FilterChip active={serviceCategory === 'all'} onClick={() => { setServiceCategory('all'); setServicePage(1); }}>
                  All
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={serviceCategory === c.id}
                    onClick={() => { setServiceCategory(c.id); setServicePage(1); }}
                  >
                    {c.name}
                  </FilterChip>
                ))}
              </div>

              <div className="space-y-3">
                {pageServices.map((service) => {
                  const selected = state.selectedServices.find((s) => s.id === service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`w-full flex items-start justify-between gap-4 p-5 border text-left transition-all ${
                        selected ? 'border-ink-900 bg-cream-100' : 'border-ink-100 bg-cream-50 hover:border-ink-300'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-6 h-6 flex items-center justify-center border shrink-0 mt-0.5 transition-colors ${
                          selected ? 'bg-ink-900 border-ink-900 text-cream-50' : 'border-ink-300'
                        }`}>
                          {selected && <Check size={14} />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-display text-ink-900 truncate">{service.name}</h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-ink-500">
                            <span className="flex items-center gap-1"><Clock size={12} /> {formatDuration(service.duration_minutes)}</span>
                            <span>{formatPriceRange(service.price_min, service.price_max, currency)}</span>
                            {service.home_service_eligible && <span className="flex items-center gap-1 text-olive-600"><HomeIcon size={12} /> Home</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalServicePages > 1 && (
                <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-ink-400">
                    Page {safeServicePage} of {totalServicePages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setServicePage((p) => Math.max(1, p - 1))}
                      disabled={safeServicePage === 1}
                      className="px-3 py-2 text-sm border border-ink-200 text-ink-600 disabled:opacity-40 hover:border-ink-900 disabled:hover:border-ink-200 transition-colors"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalServicePages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setServicePage(p)}
                        className={`w-9 h-9 text-sm border transition-colors ${
                          safeServicePage === p ? 'bg-ink-900 text-cream-50 border-ink-900' : 'border-ink-200 text-ink-600 hover:border-ink-900'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setServicePage((p) => Math.min(totalServicePages, p + 1))}
                      disabled={safeServicePage === totalServicePages}
                      className="px-3 py-2 text-sm border border-ink-200 text-ink-600 disabled:opacity-40 hover:border-ink-900 disabled:hover:border-ink-200 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </Reveal>
          )}

          {/* Step: Mode */}
          {step === 'mode' && (
            <Reveal>
              <h2 className="text-xl font-display text-ink-900 mb-2">Where would you like it?</h2>
              <p className="text-sm text-ink-500 mb-6">Some services may not be available at home.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <ModeCard
                  active={state.mode === 'in_salon'}
                  onClick={() => update({ mode: 'in_salon' })}
                  icon={<Store size={24} />}
                  title="In Salon"
                  desc="Visit us at our location. Full range of services available."
                />
                <ModeCard
                  active={state.mode === 'home'}
                  onClick={() => update({ mode: 'home' })}
                  icon={<HomeIcon size={24} />}
                  title="Home Service"
                  desc={`We come to you. ${formatPrice(homeFee, currency)} callout fee applies.`}
                  disabled={state.selectedServices.some((s) => !s.home_service_eligible)}
                  disabledNote="Some selected services aren't available at home"
                />
              </div>

              {/* Staff selection */}
              <h3 className="text-sm uppercase tracking-wider-2 text-ink-500 mt-8 mb-4">Preferred specialist (optional)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StaffChip
                  active={state.staffId === null}
                  onClick={() => update({ staffId: null })}
                  name="No preference"
                />
                {staff.map((member) => (
                  <StaffChip
                    key={member.id}
                    active={state.staffId === member.id}
                    onClick={() => update({ staffId: member.id })}
                    name={member.name}
                    role={member.role}
                  />
                ))}
              </div>
            </Reveal>
          )}

          {/* Step: DateTime */}
          {step === 'datetime' && (
            <Reveal>
              <h2 className="text-xl font-display text-ink-900 mb-6">Pick a date and time</h2>
              <CalendarPicker
                selectedDate={state.date}
                onSelect={(d) => update({ date: d, timeSlot: null })}
                businessHours={businessHours}
              />

              {state.date && (
                <div className="mt-8">
                  <h3 className="text-sm uppercase tracking-wider-2 text-ink-500 mb-4">
                    Available times — {DAY_NAMES[state.date.getDay()]}, {state.date.getDate()} {MONTH_NAMES[state.date.getMonth()]}
                  </h3>
                  {generateTimeSlots().length === 0 ? (
                    <p className="text-ink-400 text-sm py-8 text-center bg-cream-100 border border-ink-100">
                      We're closed on this day. Please choose another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                      {generateTimeSlots().map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => update({ timeSlot: slot.time })}
                          className={`px-3 py-2.5 text-sm border transition-all ${
                            !slot.available
                              ? 'border-ink-100 text-ink-300 cursor-not-allowed line-through bg-cream-100/50'
                              : state.timeSlot === slot.time
                                ? 'border-ink-900 bg-ink-900 text-cream-50'
                                : 'border-ink-200 text-ink-700 hover:border-ink-900'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Reveal>
          )}

          {/* Step: Details */}
          {step === 'details' && (
            <Reveal>
              <h2 className="text-xl font-display text-ink-900 mb-6">Your details</h2>
              <div className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label-text" htmlFor="bk-name">Name *</label>
                    <input id="bk-name" type="text" required value={state.customerName}
                      onChange={(e) => update({ customerName: e.target.value })}
                      className="input-field" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="label-text" htmlFor="bk-phone">Phone *</label>
                    <input id="bk-phone" type="tel" required value={state.customerPhone}
                      onChange={(e) => update({ customerPhone: e.target.value })}
                      className="input-field" placeholder="Phone number" />
                  </div>
                </div>
                <div>
                  <label className="label-text" htmlFor="bk-email">Email *</label>
                  <input id="bk-email" type="email" required value={state.customerEmail}
                    onChange={(e) => update({ customerEmail: e.target.value })}
                    className="input-field" placeholder="you@email.com" />
                </div>
                {state.mode === 'home' && (
                  <div>
                    <label className="label-text" htmlFor="bk-addr">Home Address *</label>
                    <textarea id="bk-addr" required rows={2} value={state.homeAddress}
                      onChange={(e) => update({ homeAddress: e.target.value })}
                      className="input-field resize-none" placeholder="Full address for home service" />
                  </div>
                )}
                <div>
                  <label className="label-text" htmlFor="bk-notes">Notes (optional)</label>
                  <textarea id="bk-notes" rows={3} value={state.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Anything we should know? Hair type, allergies, accessibility needs..." />
                </div>
              </div>
            </Reveal>
          )}

          {/* Step: Payment */}
          {step === 'payment' && (
            <Reveal>
              <h2 className="text-xl font-display text-ink-900 mb-2">Payment</h2>
              <p className="text-sm text-ink-500 mb-6">Payment is optional. You can pay now to secure your slot, or pay after your appointment.</p>

              <div className="space-y-3">
                <PaymentOption
                  active={!state.prepay}
                  onClick={() => update({ prepay: false })}
                  icon={<Clock size={20} />}
                  title="Pay after appointment"
                  desc="Pay in person at the salon or on-site for home service."
                />
                <PaymentOption
                  active={state.prepay}
                  onClick={() => update({ prepay: true })}
                  icon={<CreditCard size={20} />}
                  title="Pay now (secure slot)"
                  desc="Pre-pay online to confirm your reservation immediately."
                />
              </div>

              {state.prepay && (
                <div className="mt-6 p-5 bg-cream-100 border border-ink-100 text-sm text-ink-600">
                  <p>Online payment is processed securely through our payment partner. You won't be charged until you confirm on the next screen.</p>
                </div>
              )}

              {submitError && (
                <p className="mt-6 text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3">{submitError}</p>
              )}

              {/* Summary */}
              <div className="mt-8 bg-ink-900 text-cream-100 p-6">
                <h3 className="text-xs uppercase tracking-wider-2 text-ink-400 mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  {state.selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between">
                      <span className="text-cream-100">{s.name}</span>
                      <span className="text-ink-300">{formatPriceRange(s.price_min, s.price_max, currency)}</span>
                    </div>
                  ))}
                  {state.mode === 'home' && (
                    <div className="flex justify-between text-ink-300">
                      <span>Home service callout</span>
                      <span>{formatPrice(homeFee, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-ink-700">
                    <span className="text-cream-50 font-display text-base">Total</span>
                    <span className="text-cream-50 font-display text-base">{formatPrice(grandTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-ink-400 pt-2">
                    <span>Duration</span>
                    <span>{formatDuration(totalDuration + bufferMin)} (incl. buffer)</span>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* Submitting */}
          {step === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={36} className="animate-spin text-ink-400 mb-4" />
              <p className="text-ink-600">Creating your booking...</p>
            </div>
          )}

          {/* Navigation */}
          {step !== 'submitting' && hint && (
            <p className="mt-8 text-sm text-rose-600 text-center">{hint}</p>
          )}
          {step !== 'submitting' && (
            <div className="mt-10 flex items-center justify-between">
              {stepIndex > 0 ? (
                <button onClick={goBack} className="btn-ghost">
                  <ArrowLeft size={15} /> Back
                </button>
              ) : (
                <span />
              )}
              {step === 'payment' ? (
                <button onClick={handleSubmit} disabled={!canProceed()} className="btn-primary">
                  Confirm Booking <Check size={15} />
                </button>
              ) : (
                <button onClick={goNext} disabled={!canProceed()} className="btn-primary">
                  Continue <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ModeCard({ active, onClick, icon, title, desc, disabled, disabledNote }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string;
  disabled?: boolean; disabledNote?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left p-6 border transition-all ${
        disabled ? 'border-ink-100 opacity-50 cursor-not-allowed bg-cream-100/50'
        : active ? 'border-ink-900 bg-cream-100'
        : 'border-ink-200 hover:border-ink-400 bg-cream-50'
      }`}
    >
      <div className={`${active ? 'text-rose-500' : 'text-ink-700'} mb-3`}>{icon}</div>
      <h3 className="text-lg font-display text-ink-900 mb-1">{title}</h3>
      <p className="text-sm text-ink-500">{desc}</p>
      {disabled && disabledNote && <p className="text-xs text-rose-500 mt-3">{disabledNote}</p>}
    </button>
  );
}

function StaffChip({ active, onClick, name, role }: {
  active: boolean; onClick: () => void; name: string; role?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 border text-center transition-all ${
        active ? 'border-ink-900 bg-ink-900 text-cream-50' : 'border-ink-200 hover:border-ink-400'
      }`}
    >
      <p className="text-sm font-medium">{name}</p>
      {role && <p className={`text-xs mt-0.5 ${active ? 'text-cream-100/70' : 'text-ink-400'}`}>{role}</p>}
    </button>
  );
}

function PaymentOption({ active, onClick, icon, title, desc }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-5 border text-left transition-all ${
        active ? 'border-ink-900 bg-cream-100' : 'border-ink-200 hover:border-ink-400'
      }`}
    >
      <div className={`w-6 h-6 flex items-center justify-center border shrink-0 mt-0.5 ${
        active ? 'bg-ink-900 border-ink-900 text-cream-50' : 'border-ink-300'
      }`}>
        {active && <Check size={14} />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={active ? 'text-rose-500' : 'text-ink-700'}>{icon}</span>
          <h3 className="text-base font-display text-ink-900">{title}</h3>
        </div>
        <p className="text-sm text-ink-500 mt-1">{desc}</p>
      </div>
    </button>
  );
}

function CalendarPicker({ selectedDate, onSelect, businessHours }: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
  businessHours: BusinessHour[];
}) {
  const [viewMonth, setViewMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  const isClosed = (d: Date) => {
    const bh = businessHours.find((b) => b.day_of_week === d.getDay());
    return !bh || bh.is_closed;
  };

  const isPast = (d: Date) => {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    return day < today;
  };

  const isDisabled = (d: Date) => isPast(d) || isClosed(d);

  const closedDays = businessHours
    .filter((b) => b.is_closed)
    .map((b) => DAY_NAMES[b.day_of_week]);
  const closedNote = closedDays.length
    ? `Strikethrough days are closed or in the past. We're closed on ${closedDays.join(', ')}.`
    : 'Strikethrough days are closed or in the past.';

  return (
    <div className="bg-cream-100 border border-ink-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setViewMonth(new Date(year, month - 1, 1))}
          disabled={new Date(year, month - 1, 1) < new Date(today.getFullYear(), today.getMonth(), 1)}
          className="p-2 text-ink-600 hover:text-ink-900 disabled:opacity-30 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h3 className="text-lg font-display text-ink-900">
          {MONTH_NAMES[month]} {year}
        </h3>
        <button
          onClick={() => setViewMonth(new Date(year, month + 1, 1))}
          className="p-2 text-ink-600 hover:text-ink-900 transition-colors"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_SHORT.map((d) => (
          <div key={d} className="text-center text-xs uppercase tracking-wider text-ink-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const selected = selectedDate?.toDateString() === d.toDateString();
          const disabled = isDisabled(d);
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(d)}
              className={`aspect-square flex items-center justify-center text-sm border transition-all ${
                selected
                  ? 'bg-ink-900 text-cream-50 border-ink-900'
                  : disabled
                    ? 'text-ink-300 border-transparent cursor-not-allowed line-through'
                    : 'border-ink-100 text-ink-700 hover:border-ink-900'
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
       <p className="text-xs text-ink-400 mt-3 flex items-center gap-1.5">
        <Calendar size={12} /> {closedNote}
      </p>
    </div>
  );
}
