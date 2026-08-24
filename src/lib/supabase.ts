import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const isSupabaseConfigured = Boolean(rawUrl && rawKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing. The site will render with default ' +
      'content, but bookings and inquiries will not be saved. Copy .env.example to .env ' +
      'and add your Supabase project credentials to enable full functionality.'
  );
}

// Use the real values when present. When absent, fall back to a syntactically
// valid placeholder so `createClient` does not throw and crash the app at import
// time. Network requests will fail gracefully and the UI falls back to defaults.
const supabaseUrl = rawUrl || 'https://placeholder.supabase.co';
const supabaseAnonKey = rawKey || 'public-anon-key-placeholder';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
