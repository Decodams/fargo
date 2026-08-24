import { useEffect, useState } from 'react';
import { Save, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DAY_NAMES } from '@/lib/utils';
import type { BusinessHour, SettingsMap } from '@/types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: sData }, { data: hData }] = await Promise.all([
        supabase.from('settings').select('key, value'),
        supabase.from('business_hours').select('*').order('day_of_week'),
      ]);
      const m: SettingsMap = {};
      (sData ?? []).forEach((s: { key: string; value: string }) => { m[s.key] = s.value; });
      setSettings(m);
      setHours((hData ?? []) as BusinessHour[]);
    })();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateHour = (id: string, field: keyof BusinessHour, value: string | boolean) => {
    setHours((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert settings
      const updates = Object.entries(settings).map(([key, value]) => ({ key, value }));
      for (const u of updates) {
        await supabase.from('settings').upsert(u, { onConflict: 'key' });
      }
      // Update business hours
      for (const h of hours) {
        await supabase.from('business_hours').update({
          open_time: h.open_time,
          close_time: h.close_time,
          is_closed: h.is_closed,
        }).eq('id', h.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Business Info */}
      <section>
        <h2 className="text-lg font-display text-ink-900 mb-4">Business Information</h2>
        <div className="space-y-4">
          <SettingField label="Business Name" value={settings.business_name ?? ''} onChange={(v) => updateSetting('business_name', v)} />
          <SettingField label="Contact Phone" value={settings.contact_phone ?? ''} onChange={(v) => updateSetting('contact_phone', v)} />
          <SettingField label="Contact Email" value={settings.contact_email ?? ''} onChange={(v) => updateSetting('contact_email', v)} />
          <SettingField label="Notification Email" value={settings.notification_email ?? ''} onChange={(v) => updateSetting('notification_email', v)} />
          <SettingField label="Address" value={settings.address ?? ''} onChange={(v) => updateSetting('address', v)} />
          <SettingField label="Currency Symbol" value={settings.currency_symbol ?? ''} onChange={(v) => updateSetting('currency_symbol', v)} />
        </div>
      </section>

      {/* Home Service */}
      <section className="border-t border-ink-100 pt-6">
        <h2 className="text-lg font-display text-ink-900 mb-4">Home Service</h2>
        <div className="space-y-4">
          <SettingField label="Coverage Area" value={settings.home_service_area ?? ''} onChange={(v) => updateSetting('home_service_area', v)} />
          <SettingField label="Callout Fee" value={settings.home_service_fee ?? ''} onChange={(v) => updateSetting('home_service_fee', v)} />
        </div>
      </section>

      {/* Social */}
      <section className="border-t border-ink-100 pt-6">
        <h2 className="text-lg font-display text-ink-900 mb-4">Social Links</h2>
        <div className="space-y-4">
          <SettingField label="Instagram URL" value={settings.instagram_url ?? ''} onChange={(v) => updateSetting('instagram_url', v)} />
          <SettingField label="Facebook URL" value={settings.facebook_url ?? ''} onChange={(v) => updateSetting('facebook_url', v)} />
        </div>
      </section>

      {/* Business Hours */}
      <section className="border-t border-ink-100 pt-6">
        <h2 className="text-lg font-display text-ink-900 mb-4">Business Hours</h2>
        <div className="space-y-2">
          {hours.map((h) => (
            <div key={h.id} className="flex items-center gap-3 bg-cream-100 border border-ink-100 p-3">
              <span className="text-sm font-medium text-ink-700 w-24 shrink-0">{DAY_NAMES[h.day_of_week]}</span>
              <label className="flex items-center gap-2 text-xs text-ink-600 shrink-0">
                <input type="checkbox" checked={h.is_closed} onChange={(e) => updateHour(h.id, 'is_closed', e.target.checked)} />
                Closed
              </label>
              {!h.is_closed && (
                <div className="flex items-center gap-2 ml-auto">
                  <input type="time" value={h.open_time} onChange={(e) => updateHour(h.id, 'open_time', e.target.value)}
                    className="px-2 py-1.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none" />
                  <span className="text-ink-400 text-xs">to</span>
                  <input type="time" value={h.close_time} onChange={(e) => updateHour(h.id, 'close_time', e.target.value)}
                    className="px-2 py-1.5 text-sm border border-ink-200 focus:border-ink-900 focus:outline-none" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="sticky bottom-0 bg-cream-50 border-t border-ink-100 py-4 -mx-5 lg:-mx-8 px-5 lg:px-8 flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary">
          {saving ? 'Saving...' : 'Save Changes'} <Save size={15} />
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-olive-600">
            <Check size={16} /> Saved
          </span>
        )}
      </div>
    </div>
  );
}

function SettingField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
    </div>
  );
}
