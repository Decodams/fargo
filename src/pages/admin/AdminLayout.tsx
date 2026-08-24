import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, MessageSquare, Scissors, Package, Users, Settings, LogOut, Menu, X, Search, Folder, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays, end: false },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare, end: false },
  { to: '/admin/services', label: 'Services', icon: Scissors, end: false },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
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
  const [pageTransition, setPageTransition] = useState<'in' | 'out'>('out');

  const currentLabel = NAV.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to) && n.to !== '/admin'))?.label ?? 'Overview';

  const sidebarClasses = pageTransition === 'in' ? { x: 0, opacity: 1 } : { x: -60, opacity: 0 };
  const pageClasses = pageTransition === 'in' ? { x: 0 } : { x: -60 };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPageTransition('out');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-ink-900 text-cream-100 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-ink-700">
          <Link to="/admin" className="block">
            <span className="text-2xl font-display text-cream-50">Fargo</span>
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
          className="fixed inset-0 z-40 bg-ink-900/80"
          onClick={() => { setPageTransition('out'); setSidebarOpen(false); }}
          style={{ transition: 'opacity 0.3s ease' }}
        />
      )}

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <aside
          className="fixed inset-y-0 right-0 z-50 w-64 bg-ink-900 text-cream-100 flex flex-col"
          style={{ transform: sidebarClasses, transition: 'transform 0.3s ease' }}
        >
          <div className="p-6 border-b border-ink-700 flex items-center justify-between">
            <span className="text-2xl font-display text-cream-50">Fargo</span>
            <button
              onClick={() => { setPageTransition('out'); setSidebarOpen(false); }}
              className="text-ink-400"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => { setPageTransition('out'); setSidebarOpen(false); }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
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
      )}

      {/* Main content */}
      <div
        className="flex-1 lg:ml-60"
        style={{ transform: pageClasses, transition: 'transform 0.3s ease' }}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-cream-50/95 backdrop-blur-md border-b border-ink-100 h-16 flex items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => { setPageTransition('in'); setSidebarOpen(true); }} className="lg:hidden text-ink-700">
              <Menu size={22} />
            </button>
            <h1 className="text-lg font-display text-ink-900">{currentLabel}</h1>
          </div>
          <Link to="/" className="text-xs uppercase tracking-wider-2 text-ink-500 hover:text-ink-900 transition-colors">
            View Site →
          </Link>
        </header>

        <main className="p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}