import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/home-services', label: 'Home Service' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';
  const solidHeader = scrolled || !isHome || menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solidHeader
          ? 'bg-cream-50/95 backdrop-blur-md border-b border-ink-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group" aria-label="Fargo home">
            <span
              className={`text-2xl font-display tracking-tight transition-colors duration-300 ${
                solidHeader ? 'text-ink-900' : 'text-cream-50'
              }`}
            >
              Fargo
            </span>
            <span
              className={`hidden sm:block text-[10px] uppercase tracking-wider-3 transition-colors duration-300 ${
                solidHeader ? 'text-ink-400' : 'text-cream-100/70'
              }`}
            >
              Salon & Spa
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-colors duration-300 relative py-1 ${
                    solidHeader
                      ? isActive
                        ? 'text-rose-500'
                        : 'text-ink-700 hover:text-ink-900'
                      : isActive
                        ? 'text-cream-50'
                        : 'text-cream-100/80 hover:text-cream-50'
                  } after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:transition-all after:duration-300 ${
                    isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/booking"
              className={`inline-flex items-center justify-center px-6 py-2.5 text-sm tracking-wider-2 uppercase font-medium transition-all duration-300 ${
                solidHeader
                  ? 'bg-ink-900 text-cream-50 hover:bg-rose-500'
                  : 'bg-cream-50 text-ink-900 hover:bg-rose-500 hover:text-cream-50'
              }`}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={`lg:hidden p-2 transition-colors ${solidHeader ? 'text-ink-900' : 'text-cream-50'}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-cream-50 border-t border-ink-100 animate-fade-in">
          <nav className="flex flex-col px-5 py-6 gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `py-3 px-2 text-base tracking-wide border-b border-ink-100/60 transition-colors ${
                    isActive ? 'text-rose-500' : 'text-ink-800 hover:text-rose-500'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/booking"
              className="mt-4 inline-flex items-center justify-center px-6 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
