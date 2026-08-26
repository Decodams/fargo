import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    const timeoutMs = 3 * 60 * 1000;
    const activityKey = 'fargo_admin_last_active';
    const markActive = () => localStorage.setItem(activityKey, String(Date.now()));
    const expireIfInactive = async () => {
      const lastActive = Number(localStorage.getItem(activityKey) || 0);
      if (lastActive && Date.now() - lastActive >= timeoutMs) {
        await supabase.auth.signOut();
        localStorage.removeItem(activityKey);
        setSession(false);
        return;
      }
      markActive();
      const { data } = await supabase.auth.getSession();
      setSession(!!data.session);
    };

    void expireIfInactive();
    const activityEvents = ['click', 'keydown', 'pointermove', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, markActive));
    const timer = window.setInterval(() => {
      const lastActive = Number(localStorage.getItem(activityKey) || 0);
      if (lastActive && Date.now() - lastActive >= timeoutMs) {
        void supabase.auth.signOut();
        localStorage.removeItem(activityKey);
        setSession(false);
      }
    }, 15000);
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(!!sess);
      if (sess) markActive();
    });
    return () => {
      window.clearInterval(timer);
      activityEvents.forEach((event) => window.removeEventListener(event, markActive));
      sub.subscription.unsubscribe();
    };
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
