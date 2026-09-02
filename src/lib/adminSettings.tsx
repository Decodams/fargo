import { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SettingsMap } from '@/types';

export function useAdminSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('settings').select('key, value');
      const map: SettingsMap = {};
      (data ?? []).forEach((row: { key: string; value: string }) => {
        map[row.key] = row.value;
      });
      setSettings(map);
      setLoading(false);
    })();
  }, []);

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return { settings, setSettings, update, loading };
}

export async function saveSettings(settings: SettingsMap): Promise<void> {
  // Try to refresh the session first so a stale token doesn't 401 mid-save
  // (which would otherwise surface as a confusing sign-out).
  try {
    await supabase.auth.refreshSession();
  } catch {
    // ignore refresh failure — the upsert below will surface the real state
  }
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Your session has expired. Please sign in again.');
  }

  const entries = Object.entries(settings);
  for (const [key, value] of entries) {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) {
      if (error.code === 'PGRST301' || error.code === 'PGRST304' || error.message?.toLowerCase().includes('jwt')) {
        throw new Error('Your session has expired. Please sign in again.');
      }
      throw error;
    }
  }
}

interface SaveBarProps {
  saving: boolean;
  saved: boolean;
  onSave: () => void;
  label?: string;
}

export function SaveBar({ saving, saved, onSave, label = 'Save Changes' }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 bg-cream-50 border-t border-ink-100 py-4 -mx-5 lg:-mx-8 px-5 lg:px-8 flex items-center gap-3">
      <button onClick={onSave} disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : label} <Save size={15} />
      </button>
      {saved && (
        <span className="flex items-center gap-1.5 text-sm text-olive-600">
          <Check size={16} /> Saved
        </span>
      )}
    </div>
  );
}

export function AdminField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <label className="label-text">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="input-field resize-y min-h-[80px]"
        />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
      )}
      {hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function AdminSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink-100 pt-6 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-display text-ink-900 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}