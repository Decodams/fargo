import { useState } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/utils';
import { AdminField, AdminSection, SaveBar, saveSettings, useAdminSettings } from '@/lib/adminSettings';

export default function AdminSEO() {
  const { settings, update, loading } = useAdminSettings();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const val = (key: string) => settings[key] ?? DEFAULT_SETTINGS[key] ?? '';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <p className="text-sm text-ink-500">
        Manage search engine metadata and social sharing previews. Individual pages use their own titles; these settings apply as defaults and to the homepage.
      </p>

      <AdminSection title="Global SEO">
        <AdminField label="Site URL" value={val('site_url')} onChange={(v) => update('site_url', v)} hint="Used for canonical URLs and sitemap." />
        <AdminField label="Default Page Title" value={val('seo_title')} onChange={(v) => update('seo_title', v)} />
        <AdminField label="Meta Description" value={val('seo_description')} onChange={(v) => update('seo_description', v)} multiline rows={3} />
        <AdminField label="Keywords" value={val('seo_keywords')} onChange={(v) => update('seo_keywords', v)} multiline rows={2} />
        <AdminField label="Social Share Image URL" value={val('seo_og_image')} onChange={(v) => update('seo_og_image', v)} hint="Recommended 1200×630px." />
      </AdminSection>

      <SaveBar saving={saving} saved={saved} onSave={handleSave} />

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3 -mt-4">
          {error}
        </p>
      )}
    </div>
  );
}
