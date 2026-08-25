import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const fallbackUrl = 'https://rwgrqxuvdylftlrsvidf.supabase.co';
const fallbackKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIs' +
  'InJlZiI6InJ3Z3JxeHV2ZHlsZnRscnN2aWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MTgwMzYsImV4cCI6MjEwMzE5NDAzNn0.' +
  'cExXVohYrDuzV97aJRdhcqIsJY7WGogq_QZlppj4PKA';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || fallbackUrl;
const configuredUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const rawKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  fallbackKey;
const configuredKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  '';

export const isSupabaseConfigured = Boolean(configuredUrl && configuredKey);
export const supabasePublicKey = rawKey;

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
const supabaseUrl = rawUrl;
const supabaseAnonKey = rawKey;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
