import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, MessageSquare, Scissors, Package, Users, Settings, LogOut, Menu, X, Search, Folder, MessageCircle, DollarSign, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TikTokIcon from '@/components/ui/TikTokIcon';
import logo from '@/image/Logo 2.png';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays, end: false },
  { to: '/admin/orders', label: 'Product Orders', icon: Package, end: false },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare, end: false },
  { to: '/admin/services', label: 'Services', icon: Scissors, end: false },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/gallery', label: 'Gallery', icon: ImageIcon, end: false },
  { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
  { to: '/admin/pricing', label: 'Pricing', icon: DollarSign, end: false },
  { to: '/admin/content', label: 'Content', icon: Folder, end: false },
  { to: '/admin/seo', label: 'SEO', icon: Search, end: false },
  { to: '/admin/categories', label: 'Categories', icon: Folder, end: false },
  { to: '/admin/faq', label: 'FAQ', icon: MessageCircle, end: false },
  { to: '/admin/staff', label: 'Staff', icon: Users, end: false },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingAlert, setBookingAlert] = useState<string | null>(null);

  useEffect(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }

    const channel = supabase
      .channel('admin-booking-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const booking = payload.new as { customer_name?: string; reference?: string };
        const message = `New booking from ${booking.customer_name ?? 'a customer'}${booking.reference ? ` (${booking.reference})` : ''}`;
        setBookingAlert(message);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('Fargo: New Booking', { body: message });
        }
      })
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  const currentLabel = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to) && n.to !== '/admin'))?.label ?? 'Overview';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-ink-900 text-cream-100 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-ink-700">
          <Link to="/admin" className="block">
            <img src={logo} alt="Fargo Unisex Salon and Spa" className="h-16 w-auto object-contain" />
            <p className="text-[10px] uppercase tracking-wider-3 text-ink-400 mt-1">Admin Panel</p>
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-ink-800 text-cream-50' : 'text-ink-400 hover:text-cream-50 hover:bg-ink-800/50'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-400 hover:text-rose-400 transition-colors w-full"
          >
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/80 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-ink-900 text-cream-100 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-ink-700 flex items-center justify-between">
          <img src={logo} alt="Fargo Unisex Salon and Spa" className="h-16 w-auto object-contain" />
          <button onClick={closeSidebar} className="text-ink-400 hover:text-cream-50 transition-colors">
            <X size={22} />
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive ? 'bg-ink-800 text-cream-50' : 'text-ink-400 hover:text-cream-50'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-ink-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-400 hover:text-rose-400 w-full">
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-cream-50/95 backdrop-blur-md border-b border-ink-100 h-14 lg:h-16 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-ink-700 hover:text-ink-900 transition-colors">
              <Menu size={22} />
            </button>
            <h1 className="text-base lg:text-lg font-display text-ink-900 truncate">{currentLabel}</h1>
          </div>
          <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-wider-2 text-ink-500 hover:text-ink-900 transition-colors">
            View Site <TikTokIcon size={10} className="opacity-0" />
          </Link>
        </header>

        <main className="p-4 lg:p-8">
          {bookingAlert && (
            <div role="status" className="mb-5 flex items-center justify-between gap-4 border border-olive-200 bg-olive-50 px-4 py-3 text-sm text-olive-800">
              <span>{bookingAlert}</span>
              <button onClick={() => setBookingAlert(null)} className="shrink-0 text-xs uppercase tracking-wider-2 hover:text-ink-900">Dismiss</button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}