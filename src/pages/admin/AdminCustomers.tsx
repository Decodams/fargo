import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { formatRelative } from '@/lib/utils';
import type { Customer, Booking } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    setCustomers((data ?? []) as Customer[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  );

  const openDetail = async (customer: Customer) => {
    setSelected(customer);
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .or(`customer_email.eq.${customer.email},customer_phone.eq.${customer.phone}`)
      .order('scheduled_at', { ascending: false });
    setBookings((data ?? []) as Booking[]);
  };

  return (
    <div className="space-y-5">
      <div className="relative sm:w-72">
        <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field" />
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-cream-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-cream-100 border border-ink-100 p-12 text-center text-ink-400 text-sm">No customers found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => openDetail(c)}
              className="w-full bg-cream-50 border border-ink-100 p-4 flex items-center justify-between gap-4 hover:border-ink-300 transition-colors text-left">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900 truncate">{c.name}</p>
                <p className="text-xs text-ink-500 truncate">{c.email ?? 'No email'} • {c.phone ?? 'No phone'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-ink-900">{c.total_bookings}</p>
                <p className="text-xs text-ink-400">bookings</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-cream-50 h-full overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-cream-50 border-b border-ink-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-display text-ink-900">Customer</h2>
              <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-900">✕</button>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <p className="text-lg font-display text-ink-900">{selected.name}</p>
                <p className="text-sm text-ink-600">{selected.email}</p>
                <p className="text-sm text-ink-600">{selected.phone}</p>
                <p className="text-xs text-ink-400 mt-2">Customer since {formatRelative(selected.created_at)}</p>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-3">Booking History ({bookings.length})</p>
                {bookings.length === 0 ? (
                  <p className="text-sm text-ink-400">No bookings found.</p>
                ) : (
                  <div className="space-y-2">
                    {bookings.map((b) => (
                      <div key={b.id} className="bg-cream-100 border border-ink-100 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-ink-700">{b.reference}</p>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-xs text-ink-500">{new Date(b.scheduled_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selected.notes && (
                <div className="border-t border-ink-100 pt-4">
                  <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-2">Notes</p>
                  <p className="text-sm text-ink-700">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
