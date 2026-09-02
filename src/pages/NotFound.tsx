import { Link } from 'react-router-dom';
import PageMeta from '@/components/ui/PageMeta';

export default function NotFound() {
  return (
    <>
      <PageMeta title="Page Not Found" path="/404" noSuffix noindex />
      <div className="min-h-screen flex items-center justify-center bg-cream-50 px-5">
        <div className="text-center">
          <p className="text-7xl lg:text-9xl font-display text-ink-900 mb-4">404</p>
          <h1 className="text-ink-500 mb-8 text-lg font-normal">This page doesn't exist.</h1>
          <Link to="/" className="inline-flex items-center justify-center px-7 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-all">
            Back Home
          </Link>
        </div>
      </div>
    </>
  );
}
