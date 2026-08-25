import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Home as HomeIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPriceRange, formatDuration } from '@/lib/utils';
import type { Service, Category } from '@/types';

interface EditState {
  id?: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  duration_minutes: number;
  price_min: number;
  price_max: number;
  home_service_eligible: boolean;
  is_active: boolean;
  display_order: number;
}

const EMPTY: EditState = {
  name: '', slug: '', description: '', category_id: '', duration_minutes: 60,
  price_min: 0, price_max: 0, home_service_eligible: false, is_active: true, display_order: 0,
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [{ data: svcs }, { data: cats }] = await Promise.all([
      supabase.from('services').select('*').order('display_order'),
      supabase.from('categories').select('*').order('display_order'),
    ]);
    setServices((svcs ?? []) as Service[]);
    setCategories((cats ?? []) as Category[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');

    try {
      const data: Record<string, unknown> = {
        name: editing.name.trim(),
        slug: editing.slug || slugify(editing.name),
        description: editing.description.trim() || null,
        category_id: editing.category_id || null,
        duration_minutes: Number(editing.duration_minutes),
        price_min: Number(editing.price_min),
        price_max: Number(editing.price_max),
        home_service_eligible: editing.home_service_eligible,
        is_active: editing.is_active,
        display_order: Number(editing.display_order),
      };

      if (editing.id) {
        const { error: e } = await supabase.from('services').update(data).eq('id', editing.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('services').insert(data);
        if (e) throw e;
      }
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service? Existing bookings will keep the service name.')) return;
    await supabase.from('services').delete().eq('id', id);
    await load();
  };

  const startEdit = (svc: Service) => {
    setEditing({
      id: svc.id, name: svc.name, slug: svc.slug, description: svc.description ?? '',
      category_id: svc.category_id ?? '', duration_minutes: svc.duration_minutes,
      price_min: svc.price_min, price_max: svc.price_max,
      home_service_eligible: svc.home_service_eligible, is_active: svc.is_active,
      display_order: svc.display_order,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{services.length} services</p>
        <button onClick={() => setEditing({ ...EMPTY, category_id: categories[0]?.id ?? '' })}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-cream-50 text-sm hover:bg-ink-800 transition-colors">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {services.map((svc) => {
          const cat = categories.find((c) => c.id === svc.category_id);
          return (
            <div key={svc.id} className="bg-cream-50 border border-ink-100 p-4 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-ink-900 truncate">{svc.name}</p>
                  {!svc.is_active && <span className="text-xs text-ink-400">(inactive)</span>}
                  {svc.home_service_eligible && <HomeIcon size={13} className="text-olive-600" />}
                </div>
                <p className="text-xs text-ink-500">
                  {cat?.name ?? 'Uncategorized'} • {formatDuration(svc.duration_minutes)} • {formatPriceRange(svc.price_min, svc.price_max)}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => startEdit(svc)} className="p-2 text-ink-500 hover:text-ink-900 transition-colors">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(svc.id)} className="p-2 text-ink-500 hover:text-rose-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setEditing(null)} />
          <div className="relative bg-cream-50 w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-t-xl sm:rounded-none">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base lg:text-lg font-display text-ink-900">{editing.id ? 'Edit Service' : 'New Service'}</h2>
              <button onClick={() => setEditing(null)} className="p-1 text-ink-400 hover:text-ink-900"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-text">Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                  className="input-field" placeholder="Service name" />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="input-field resize-none" placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Category</label>
                  <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
                    className="input-field">
                    <option value="">— None —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Duration (min)</label>
                  <input type="number" value={editing.duration_minutes} onChange={(e) => setEditing({ ...editing, duration_minutes: Number(e.target.value) })}
                    className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Price Min</label>
                  <input type="number" value={editing.price_min} onChange={(e) => setEditing({ ...editing, price_min: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-text">Price Max</label>
                  <input type="number" value={editing.price_max} onChange={(e) => setEditing({ ...editing, price_max: Number(e.target.value) })}
                    className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Display Order</label>
                  <input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div className="flex items-end gap-4 pb-2">
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <input type="checkbox" checked={editing.home_service_eligible} onChange={(e) => setEditing({ ...editing, home_service_eligible: e.target.checked })} />
                    Home service
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>

              {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || !editing.name.trim()}
                  className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(null)} className="btn-outline">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
