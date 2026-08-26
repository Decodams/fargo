import { useEffect, useState } from 'react';
import { Save, Check, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SettingsMap } from '@/types';

interface DistanceZone {
  id: string;
  name: string;
  min_km: number | string | null;
  max_km: number | string | null;
  fee: number | string | null;
  is_active: boolean;
}

const EMPTY_ZONE: Omit<DistanceZone, 'id'> = {
  name: '',
  min_km: 0,
  max_km: null,
  fee: 0,
  is_active: true,
};

export default function AdminPricing() {
  const [zones, setZones] = useState<DistanceZone[]>([]);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [editZone, setEditZone] = useState<Omit<DistanceZone, 'id'> | null>(null);
  const [editZoneId, setEditZoneId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: zData }, { data: sData }] = await Promise.all([
        supabase.from('distance_zones').select('*').order('name', { ascending: true }),
        supabase.from('settings').select('key, value'),
      ]);
      setZones((zData ?? []) as DistanceZone[]);
      const m: SettingsMap = {};
      (sData ?? []).forEach((s: { key: string; value: string }) => { m[s.key] = s.value; });
      setSettings(m);
    })();
  }, []);

  const updateZoneField = (
    idx: number,
    isAdding: boolean,
    field: string,
    value: string | number | boolean | null,
  ) => {
    if (isAdding) {
      setEditZone((prev) => prev ? { ...prev, [field]: value } : null);
    } else {
      setZones((prev) => prev.map((z, i) => (i === idx ? { ...z, [field]: value } : z)));
    }
    setSaved(false);
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this distance zone?')) return;
    await supabase.from('distance_zones').delete().eq('id', id);
    setZones((prev) => prev.filter((z) => z.id !== id));
  };

  const handleStartAdd = () => {
    setEditZone({ ...EMPTY_ZONE });
    setEditZoneId('__new__');
  };

  const handleStartEdit = (zone: DistanceZone) => {
    setEditZone({ name: zone.name, min_km: zone.min_km, max_km: zone.max_km, fee: zone.fee, is_active: zone.is_active });
    setEditZoneId(zone.id);
  };

  const handleCancelEdit = () => {
    setEditZone(null);
    setEditZoneId(null);
  };

  const handleSaveEditZone = async () => {
    if (!editZone) return;
    const payload = {
      name: editZone.name,
      min_km: Number(editZone.min_km),
      max_km: editZone.max_km === null || editZone.max_km === ('' as unknown as number) ? null : Number(editZone.max_km),
      fee: Number(editZone.fee),
      is_active: editZone.is_active,
    };
    if (editZoneId === '__new__') {
      const { data } = await supabase.from('distance_zones').insert(payload).select().single();
      if (data) setZones((prev) => [...prev, data as DistanceZone].sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      await supabase.from('distance_zones').update(payload).eq('id', editZoneId);
      setZones((prev) => prev.map((z) => (z.id === editZoneId ? { ...z, ...payload } : z)));
    }
    setEditZone(null);
    setEditZoneId(null);
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = [
        'multi_service_enabled',
        'multi_service_min_services',
        'multi_service_discount_percent',
        'per_person_enabled',
        'per_person_max',
      ];
      for (const key of entries) {
        const value = settings[key] ?? '';
        await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-2xl">
      {/* Distance Zones */}
      <section>
        <h2 className="text-base lg:text-lg font-display text-ink-900 mb-4">Distance Zones</h2>
        <p className="text-sm text-ink-500 mb-4">Define fees based on distance from the salon.</p>

        <div className="space-y-2">
          {zones.map((zone) => {
            if (editZoneId === zone.id) return null;
            return (
              <div key={zone.id} className="bg-cream-50 border border-ink-100 p-4 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-ink-900 truncate">{zone.name}</p>
                    {!zone.is_active && <span className="text-xs text-ink-400">(inactive)</span>}
                  </div>
                  <p className="text-xs text-ink-500">
                    {zone.min_km}–{zone.max_km !== null ? `${zone.max_km}` : '∞'} km • ₦{Number(zone.fee) || 0}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleStartEdit(zone)} className="p-2 text-ink-500 hover:text-ink-900 transition-colors text-sm">Edit</button>
                  <button onClick={() => handleDeleteZone(zone.id)} className="p-2 text-ink-500 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}

          {editZoneId === '__new__' && editZone && (
            <ZoneEditRow zone={editZone} onSave={handleSaveEditZone} onCancel={handleCancelEdit} onChange={(field, value) => updateZoneField(0, true, field, value)} />
          )}
          {editZoneId && editZoneId !== '__new__' && editZone && (
            <ZoneEditRow zone={editZone} onSave={handleSaveEditZone} onCancel={handleCancelEdit} onChange={(field, value) => {
              setEditZone((prev) => prev ? { ...prev, [field]: value } : null);
              setSaved(false);
            }} />
          )}

          {!editZoneId && (
            <button onClick={handleStartAdd} className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-ink-200 text-sm text-ink-500 hover:text-ink-900 hover:border-ink-400 transition-colors w-full justify-center">
              <Plus size={16} /> Add Zone
            </button>
          )}
        </div>
      </section>

      {/* Multi-Service Discount */}
      <section className="border-t border-ink-100 pt-6">
        <h2 className="text-base lg:text-lg font-display text-ink-900 mb-4">Multi-Service Discount</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={settings.multi_service_enabled === 'true'}
              onChange={(e) => { updateSetting('multi_service_enabled', e.target.checked ? 'true' : 'false'); }}
            />
            Enable multi-service discount
          </label>

          {settings.multi_service_enabled === 'true' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Minimum services</label>
                <input
                  type="number"
                  min={2}
                  value={settings.multi_service_min_services ?? ''}
                  onChange={(e) => updateSetting('multi_service_min_services', e.target.value)}
                  className="input-field"
                  placeholder="e.g. 2"
                />
              </div>
              <div>
                <label className="label-text">Discount percentage</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.multi_service_discount_percent ?? ''}
                  onChange={(e) => updateSetting('multi_service_discount_percent', e.target.value)}
                  className="input-field"
                  placeholder="e.g. 10"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Per-Person Pricing */}
      <section className="border-t border-ink-100 pt-6">
        <h2 className="text-base lg:text-lg font-display text-ink-900 mb-4">Per-Person Pricing</h2>
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={settings.per_person_enabled === 'true'}
              onChange={(e) => { updateSetting('per_person_enabled', e.target.checked ? 'true' : 'false'); }}
            />
            Enable per-person pricing
          </label>

          {settings.per_person_enabled === 'true' && (
            <div>
              <label className="label-text">Maximum persons</label>
              <input
                type="number"
                min={2}
                value={settings.per_person_max ?? ''}
                onChange={(e) => updateSetting('per_person_max', e.target.value)}
                className="input-field"
                placeholder="e.g. 6"
              />
              <p className="mt-1.5 text-xs text-ink-400">Only services with per_person=true will be charged per person.</p>
            </div>
          )}
        </div>
      </section>

      {/* Save */}
      <div className="sticky bottom-0 bg-cream-50/95 backdrop-blur-md border-t border-ink-100 py-3 lg:py-4 -mx-4 lg:-mx-8 px-4 lg:px-8 flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary text-sm">
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

function ZoneEditRow({
  zone,
  onSave,
  onCancel,
  onChange,
}: {
  zone: Omit<DistanceZone, 'id'>;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: string, value: string | number | boolean | null) => void;
}) {
  return (
    <div className="bg-cream-100 border border-ink-100 p-3 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="label-text">Name</label>
          <input type="text" value={zone.name} onChange={(e) => onChange('name', e.target.value)} className="input-field" placeholder="Zone name" />
        </div>
        <div>
          <label className="label-text">Min km</label>
              <input type="number" min={0} value={zone.min_km} onChange={(e) => onChange('min_km', e.target.value === '' ? null : Number(e.target.value))} className="input-field" />
        </div>
        <div>
          <label className="label-text">Max km</label>
          <input type="number" min={0} value={zone.max_km ?? ''} onChange={(e) => onChange('max_km', e.target.value === '' ? null : Number(e.target.value))} className="input-field" placeholder="∞" />
        </div>
        <div>
          <label className="label-text">Fee (₦)</label>
              <input type="number" min={0} value={zone.fee} onChange={(e) => onChange('fee', e.target.value === '' ? null : Number(e.target.value))} className="input-field" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input type="checkbox" checked={zone.is_active} onChange={(e) => onChange('is_active', e.target.checked)} />
          Active
        </label>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
          <button onClick={onSave} disabled={!zone.name.trim()} className="btn-primary text-sm">Save Zone</button>
        </div>
      </div>
    </div>
  );
}
