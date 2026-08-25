import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found — Fargo Salon & Spa';
    const meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (meta) {
      meta.content = 'noindex';
    } else {
      const el = document.createElement('meta');
      el.name = 'robots';
      el.content = 'noindex';
      document.head.appendChild(el);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-5">
      <div className="text-center">
        <p className="text-7xl lg:text-9xl font-display text-ink-900 mb-4">404</p>
        <p className="text-ink-500 mb-8 text-lg">This page doesn't exist.</p>
        <Link to="/" className="inline-flex items-center justify-center px-7 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-all">
          Back Home
        </Link>
      </div>
    </div>
  );
}
