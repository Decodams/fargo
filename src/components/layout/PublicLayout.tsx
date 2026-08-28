import { Outlet, useLocation, Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Hide the fixed CTA on pages with their own primary action or full-screen forms.
  const hideCta = useMemo(
    () => ['/booking', '/products/checkout', '/booking/confirmation'].includes(pathname),
    [pathname]
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Header />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />

      {!hideCta && (
        <>
          <div className="lg:hidden h-20" aria-hidden="true" />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 bg-gradient-to-t from-cream-50 via-cream-50/95 to-transparent">
            <Link
              to="/booking"
              className="flex items-center justify-center gap-2 w-full min-h-[52px] bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 active:scale-[0.98] transition-all duration-200 rounded-none"
            >
              Book a Session
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
