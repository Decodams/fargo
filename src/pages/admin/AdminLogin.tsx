import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the dashboard if a session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/admin');
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4 sm:px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center mb-8 sm:mb-10">
          <span className="text-3xl font-display text-cream-50">Fargo</span>
          <p className="text-xs uppercase tracking-wider-3 text-ink-400 mt-1">Staff Portal</p>
        </Link>

        <form onSubmit={handleSubmit} className="bg-ink-800 p-6 sm:p-8 border border-ink-700">
          <h1 className="text-xl font-display text-cream-50 mb-6">Sign in</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider-2 text-ink-400 mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-ink-900 border border-ink-600 text-cream-50 placeholder-ink-500 focus:border-cream-50 focus:outline-none text-sm transition-colors"
                placeholder="admin@fargosalon.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider-2 text-ink-400 mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-ink-900 border border-ink-600 text-cream-50 placeholder-ink-500 focus:border-cream-50 focus:outline-none text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-cream-50 text-ink-900 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 hover:text-cream-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
        </form>

        <Link to="/" className="block text-center mt-3 text-xs text-ink-500 hover:text-ink-300 transition-colors">
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
