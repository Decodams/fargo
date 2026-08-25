import { useEffect, useState, useCallback } from 'react';
import { Search, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatDateTime, formatDate, formatTime, formatDuration, DAY_NAMES } from '@/lib/utils';
import type { Booking, BookingService, SettingsMap } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const;

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [bookingServices, setBookingServices] = useState<BookingService[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    supabase.from('settings').select('key, value').then(({ data }) => {
      const m: SettingsMap = {};
      (data ?? []).forEach((s: { key: string; value: string }) => { m[s.key] = s.value; });
      setSettings(m);
    });
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .gte('scheduled_at', weekStart.toISOString())
      .lt('scheduled_at', weekEnd.toISOString())
      .order('scheduled_at');

    setBookings((data ?? []) as Booking[]);
    setLoading(false);
  }, [weekOffset]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  useEffect(() => {
    let result = bookings;
    if (statusFilter !== 'all') result = result.filter((b) => b.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) =>
        b.customer_name.toLowerCase().includes(q) ||
        b.reference.toLowerCase().includes(q) ||
        b.customer_email.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [bookings, statusFilter, search]);

  const openDetail = async (booking: Booking) => {
    setSelected(booking);
    const { data } = await supabase
      .from('booking_services')
      .select('*')
      .eq('booking_id', booking.id);
    setBookingServices((data ?? []) as BookingService[]);
  };

  const updateStatus = async (bookingId: string, status: string) => {
    const { data } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single();
    if (data) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: status as Booking['status'] } : b)));
      setSelected({ ...selected!, status: status as Booking['status'] });
    }
  };

  const updateConfirmationStatus = async (bookingId: string, confirmationStatus: string) => {
    const update: Record<string, string> = { confirmation_status: confirmationStatus, updated_at: new Date().toISOString() };
    if (confirmationStatus === 'confirmed') {
      update.status = 'confirmed';
    }
    const { data } = await supabase
      .from('bookings')
      .update(update)
      .eq('id', bookingId)
      .select()
      .single();
    if (data) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, confirmation_status: confirmationStatus as Booking['confirmation_status'], ...(confirmationStatus === 'confirmed' ? { status: 'confirmed' as Booking['status'] } : {}) } : b)));
      setSelected((prev) => prev && prev.id === bookingId ? { ...prev, confirmation_status: confirmationStatus as Booking['confirmation_status'], ...(confirmationStatus === 'confirmed' ? { status: 'confirmed' as Booking['status'] } : {}) } : prev);

      // Send confirmation email to customer when admin confirms payment
      if (confirmationStatus === 'confirmed' && data.customer_email) {
        try {
          // Fetch booking services for the email
          const { data: bsData } = await supabase
            .from('booking_services')
            .select('service_name')
            .eq('booking_id', bookingId);

          const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;
          await fetch(fnUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
            body: JSON.stringify({
              type: 'booking_confirmed',
              reference: data.reference,
              customer_name: data.customer_name,
              customer_email: data.customer_email,
              customer_phone: data.customer_phone,
              service_mode: data.service_mode,
              scheduled_at: data.scheduled_at,
              duration_minutes: data.duration_minutes,
              total_price: data.total_price,
              services: bsData?.map((s) => s.service_name) ?? [],
            }),
          });
        } catch {
          // Email failure is non-critical — the booking was already confirmed
        }
      }
    }
  };

  const currency = settings.currency_symbol ?? '₦';

  // Group bookings by day
  const grouped: Record<string, Booking[]> = {};
  filtered.forEach((b) => {
    const dayKey = new Date(b.scheduled_at).toDateString();
    if (!grouped[dayKey]) grouped[dayKey] = [];
    grouped[dayKey].push(b);
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() + weekOffset * 7);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap px-3 py-2 text-sm capitalize transition-colors ${
                statusFilter === s ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search name, ref, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-cream-100 border border-ink-100 focus:border-ink-900 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-cream-100 border border-ink-100 px-4 py-3">
        <button onClick={() => setWeekOffset((w) => w - 1)} className="p-1.5 text-ink-600 hover:text-ink-900 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-ink-700">
          {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} Week${weekOffset > 1 ? 's' : ''}` : `${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? 's' : ''} Ago`}
        </span>
        <button onClick={() => setWeekOffset((w) => w + 1)} className="p-1.5 text-ink-600 hover:text-ink-900 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Bookings grouped by day */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-cream-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-cream-100 border border-ink-100 p-12 text-center text-ink-400 text-sm">
          No bookings in this period.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dayKey, dayBookings]) => {
            const dayDate = new Date(dayKey);
            return (
              <div key={dayKey}>
                <div className="flex items-center gap-3 mb-3">
                  <Calendar size={16} className="text-ink-400" />
                  <h3 className="text-sm font-medium text-ink-700">
                    {DAY_NAMES[dayDate.getDay()]}, {formatDate(dayDate)}
                  </h3>
                  <span className="text-xs text-ink-400">({dayBookings.length})</span>
                </div>
                <div className="space-y-2">
                  {dayBookings.map((booking) => (
                    <button
                      key={booking.id}
                      onClick={() => openDetail(booking)}
                      className="w-full bg-cream-50 border border-ink-100 p-4 flex items-center justify-between gap-4 hover:border-ink-300 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="text-center shrink-0 w-16">
                          <p className="text-sm font-medium text-ink-900">{formatTime(booking.scheduled_at)}</p>
                          <p className="text-xs text-ink-400">{formatDuration(booking.duration_minutes)}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink-900 truncate">{booking.customer_name}</p>
                          <p className="text-xs text-ink-500 truncate">
                            {booking.reference} • {booking.service_mode === 'home' ? 'Home' : 'Salon'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {booking.confirmation_status === 'pending' && (
                          <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium bg-amber-100 text-amber-700 border border-amber-200">
                            Bank Transfer Pending
                          </span>
                        )}
                        <span className="text-sm text-ink-700 hidden sm:block">{formatPrice(booking.total_price, currency)}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-cream-50 h-full overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-cream-50 border-b border-ink-100 px-4 lg:px-5 py-3 lg:py-4 flex items-center justify-between z-10">
              <h2 className="text-base lg:text-lg font-display text-ink-900">Booking Details</h2>
              <button onClick={() => setSelected(null)} className="p-1 text-ink-400 hover:text-ink-900"><X size={20} /></button>
            </div>

            <div className="p-4 lg:p-5 space-y-4 lg:space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-1">Reference</p>
                <p className="text-lg font-display text-ink-900">{selected.reference}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selected.status} />
                <StatusBadge status={selected.payment_status} variant="payment" />
              </div>

              <div className="border-t border-ink-100 pt-4 space-y-3">
                <DetailRow label="Customer" value={selected.customer_name} />
                <DetailRow label="Email" value={selected.customer_email} />
                <DetailRow label="Phone" value={selected.customer_phone} />
                <DetailRow label="Date & Time" value={formatDateTime(selected.scheduled_at)} />
                <DetailRow label="Duration" value={formatDuration(selected.duration_minutes)} />
                <DetailRow label="Mode" value={selected.service_mode === 'home' ? 'Home Service' : 'In Salon'} />
                {selected.home_address && <DetailRow label="Address" value={selected.home_address} />}
                {selected.notes && <DetailRow label="Notes" value={selected.notes} />}
              </div>

              <div className="border-t border-ink-100 pt-4">
                <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-3">Services</p>
                <div className="space-y-2">
                  {bookingServices.map((bs) => (
                    <div key={bs.id} className="flex justify-between text-sm">
                      <span className="text-ink-800">{bs.service_name}</span>
                      <span className="text-ink-500">{formatPrice(bs.price, currency)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-ink-100">
                    <span className="text-sm font-medium text-ink-900">Total</span>
                    <span className="text-sm font-medium text-ink-900">{formatPrice(selected.total_price, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'confirmed', 'completed', 'cancelled', 'no_show'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`px-3 py-2 text-xs capitalize border transition-colors ${
                        selected.status === s
                          ? 'bg-ink-900 text-cream-50 border-ink-900'
                          : 'border-ink-200 text-ink-600 hover:border-ink-900'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-ink-100 pt-4">
                <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-3">Confirmation Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['pending', 'confirmed'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateConfirmationStatus(selected.id, s)}
                      className={`px-3 py-2 text-xs capitalize border transition-colors ${
                        selected.confirmation_status === s
                          ? 'bg-ink-900 text-cream-50 border-ink-900'
                          : 'border-ink-200 text-ink-600 hover:border-ink-900'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider-2 text-ink-400">{label}</p>
      <p className="text-sm text-ink-800 mt-0.5">{value}</p>
    </div>
  );
}
