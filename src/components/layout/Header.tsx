import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@/image/Logo 2.png';

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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isHome = location.pathname === '/';
  const solidHeader = scrolled || !isHome || menuOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          solidHeader
            ? 'bg-cream-50/95 backdrop-blur-md border-b border-ink-100'
            : 'bg-transparent'}
        `}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center group" aria-label="Fargo home">
              <img src={logo} alt="Fargo Unisex Salon and Spa" className="h-12 w-auto object-contain" />
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
              className={`lg:hidden p-2 transition-colors ${solidHeader ? 'text-ink-900 hover:text-rose-500' : 'text-cream-50 hover:text-rose-400'}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — sibling of header so it's NOT trapped by the header's
          backdrop-filter (which would otherwise shrink its fixed height to 0). */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bottom-0 z-[60] bg-cream-50 overflow-y-auto animate-fade-in">
          <nav className="flex flex-col px-5 py-6">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center justify-between py-4 text-lg font-semibold tracking-wide border-b border-ink-100 transition-colors ${
                    isActive ? 'text-gold-600' : 'text-ink-900 hover:text-rose-500'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-6">
              <Link
                to="/booking"
                className="flex items-center justify-center w-full min-h-[52px] bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500"
              >
                Book Now
              </Link>
              <Link
                to="/products"
                className="mt-3 flex items-center justify-center w-full min-h-[52px] border border-ink-200 text-ink-800 text-sm tracking-wider-2 uppercase font-medium hover:border-ink-900"
              >
                Shop Products
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
