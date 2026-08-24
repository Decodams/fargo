import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MessageSquare, Users, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatTime, formatRelative, DAY_NAMES } from '@/lib/utils';
import type { Booking, Inquiry, SettingsMap } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface Stats {
  todayCount: number;
  weekCount: number;
  pendingInquiries: number;
  totalCustomers: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const [todayBk, weekBk, inq, cust, paidBk, settingsData] = await Promise.all([
        supabase.from('bookings').select('*').gte('scheduled_at', today.toISOString()).lt('scheduled_at', tomorrow.toISOString()).order('scheduled_at'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('scheduled_at', today.toISOString()).lt('scheduled_at', weekEnd.toISOString()),
        supabase.from('inquiries').select('*').eq('status', 'new').order('created_at', { ascending: false }).limit(5),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('total_price').eq('payment_status', 'paid'),
        supabase.from('settings').select('key, value'),
      ]);

      setTodayBookings((todayBk.data ?? []) as Booking[]);
      setRecentInquiries((inq.data ?? []) as Inquiry[]);
      const revenue = (paidBk.data ?? []).reduce((sum, b) => sum + Number(b.total_price), 0);
      const sMap: SettingsMap = {};
      (settingsData.data ?? []).forEach((s: { key: string; value: string }) => { sMap[s.key] = s.value; });
      setSettings(sMap);

      setStats({
        todayCount: todayBk.data?.length ?? 0,
        weekCount: weekBk.count ?? 0,
        pendingInquiries: inq.count ?? 0,
        totalCustomers: cust.count ?? 0,
        revenue,
      });
      setLoading(false);
    })();
  }, []);

  const currency = settings.currency_symbol ?? '₦';

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 animate-spin" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<CalendarDays size={18} />} label="Today" value={stats?.todayCount.toString() ?? '0'} sub="appointments" />
        <StatCard icon={<Clock size={18} />} label="This Week" value={stats?.weekCount.toString() ?? '0'} sub="bookings" />
        <StatCard icon={<MessageSquare size={18} />} label="New Inquiries" value={stats?.pendingInquiries.toString() ?? '0'} sub="awaiting response" />
        <StatCard icon={<TrendingUp size={18} />} label="Revenue" value={formatPrice(stats?.revenue ?? 0, currency)} sub="pre-paid total" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's bookings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display text-ink-900">Today's Bookings</h2>
            <Link to="/admin/bookings" className="text-xs uppercase tracking-wider-2 text-ink-500 hover:text-ink-900 transition-colors flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {todayBookings.length === 0 ? (
            <div className="bg-cream-100 border border-ink-100 p-10 text-center text-ink-400 text-sm">
              No bookings scheduled for today.
            </div>
          ) : (
            <div className="space-y-2">
              {todayBookings.map((booking) => (
                <div key={booking.id} className="bg-cream-50 border border-ink-100 p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="text-center shrink-0">
                      <p className="text-xs uppercase tracking-wider text-ink-400">{formatTime(booking.scheduled_at).split(' ')[0]}</p>
                      <p className="text-xs text-ink-400">{formatTime(booking.scheduled_at).split(' ')[1]}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 truncate">{booking.customer_name}</p>
                      <p className="text-xs text-ink-500 truncate">
                        {booking.service_mode === 'home' ? 'Home service' : 'In salon'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent inquiries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display text-ink-900">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="text-xs uppercase tracking-wider-2 text-ink-500 hover:text-ink-900 transition-colors flex items-center gap-1">
              All <ArrowRight size={13} />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <div className="bg-cream-100 border border-ink-100 p-10 text-center text-ink-400 text-sm">
              No new inquiries.
            </div>
          ) : (
            <div className="space-y-2">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className="bg-cream-50 border border-ink-100 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-ink-900 truncate">{inq.name}</p>
                    <StatusBadge status={inq.status} variant="inquiry" />
                  </div>
                  <p className="text-xs text-ink-500 truncate">{inq.message}</p>
                  <p className="text-xs text-ink-400 mt-1">{formatRelative(inq.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4 pt-4">
        <QuickAction to="/admin/services" label="Manage Services" icon={<CalendarDays size={18} />} />
        <QuickAction to="/admin/settings" label="Business Settings" icon={<Users size={18} />} />
        <QuickAction to="/admin/customers" label="View Customers" icon={<Users size={18} />} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-cream-50 border border-ink-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-ink-400">{icon}</span>
        <span className="text-xs uppercase tracking-wider-2 text-ink-400">{label}</span>
      </div>
      <p className="text-2xl lg:text-3xl font-display text-ink-900">{value}</p>
      <p className="text-xs text-ink-400 mt-1">{sub}</p>
    </div>
  );
}

function QuickAction({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-3 bg-ink-900 text-cream-50 p-5 hover:bg-ink-800 transition-colors">
      <span className="text-cream-100">{icon}</span>
      <span className="text-sm tracking-wide">{label}</span>
      <ArrowRight size={15} className="ml-auto text-ink-400" />
    </Link>
  );
}
