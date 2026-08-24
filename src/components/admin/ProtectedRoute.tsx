import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(!!sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="w-8 h-8 border-2 border-ink-300 border-t-ink-900 animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
