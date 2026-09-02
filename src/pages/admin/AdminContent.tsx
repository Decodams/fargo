import { useState } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/utils';
import { AdminField, AdminSection, SaveBar, saveSettings, useAdminSettings } from '@/lib/adminSettings';

export default function AdminContent() {
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
        Control homepage hero, stats, philosophy, and call-to-action copy. Changes appear on the live site immediately after saving.
      </p>

      <AdminSection title="Hero">
        <AdminField
          label="Headline"
          value={val('hero_title')}
          onChange={(v) => update('hero_title', v)}
          multiline
          rows={4}
          hint="One line per break. No eyebrow tag — headline stands on its own."
        />
        <AdminField
          label="Subheadline"
          value={val('hero_subtitle')}
          onChange={(v) => update('hero_subtitle', v)}
          multiline
          rows={3}
        />
        <AdminField
          label="Hero Image URL"
          value={val('hero_image_url')}
          onChange={(v) => update('hero_image_url', v)}
          hint="Leave empty to use the default salon photo."
        />
      </AdminSection>

      <AdminSection title="Hero Stats">
        <div className="grid sm:grid-cols-3 gap-4">
          <AdminField label="Stat 1 — Number" value={val('stat_1_number')} onChange={(v) => update('stat_1_number', v)} />
          <AdminField label="Stat 1 — Label" value={val('stat_1_label')} onChange={(v) => update('stat_1_label', v)} />
          <AdminField label="Stat 1 — Sub" value={val('stat_1_sub')} onChange={(v) => update('stat_1_sub', v)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <AdminField label="Stat 2 — Number" value={val('stat_2_number')} onChange={(v) => update('stat_2_number', v)} />
          <AdminField label="Stat 2 — Label" value={val('stat_2_label')} onChange={(v) => update('stat_2_label', v)} />
          <AdminField label="Stat 2 — Sub" value={val('stat_2_sub')} onChange={(v) => update('stat_2_sub', v)} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <AdminField label="Stat 3 — Number" value={val('stat_3_number')} onChange={(v) => update('stat_3_number', v)} />
          <AdminField label="Stat 3 — Label" value={val('stat_3_label')} onChange={(v) => update('stat_3_label', v)} />
          <AdminField label="Stat 3 — Sub" value={val('stat_3_sub')} onChange={(v) => update('stat_3_sub', v)} />
        </div>
      </AdminSection>

      <AdminSection title="Philosophy Section">
        <AdminField label="Eyebrow" value={val('philosophy_eyebrow')} onChange={(v) => update('philosophy_eyebrow', v)} />
        <AdminField label="Title" value={val('philosophy_title')} onChange={(v) => update('philosophy_title', v)} multiline rows={2} />
        <AdminField
          label="Body"
          value={val('philosophy_body')}
          onChange={(v) => update('philosophy_body', v)}
          multiline
          rows={6}
          hint="Separate paragraphs with a blank line."
        />
      </AdminSection>

      <AdminSection title="Call to Action">
        <AdminField label="Title" value={val('cta_title')} onChange={(v) => update('cta_title', v)} />
        <AdminField label="Subtitle" value={val('cta_subtitle')} onChange={(v) => update('cta_subtitle', v)} multiline rows={2} />
      </AdminSection>

      <AdminSection title="Site Copy">
        <AdminField label="Location Strip" value={val('location_strip')} onChange={(v) => update('location_strip', v)} />
        <AdminField label="Footer Tagline" value={val('footer_tagline')} onChange={(v) => update('footer_tagline', v)} multiline rows={2} />
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
