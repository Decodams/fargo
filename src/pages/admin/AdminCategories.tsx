import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import Card from '@/components/ui/Card';

interface EditState {
  id?: string;
  name: string;
  slug: string;
  display_order: number;
}

const EMPTY: EditState = { name: '', slug: '', display_order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories((data ?? []) as Category[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const data = {
        name: editing.name.trim(),
        slug: editing.slug || slugify(editing.name),
        display_order: Number(editing.display_order),
      };
      if (editing.id) {
        const { error: e } = await supabase.from('categories').update(data).eq('id', editing.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('categories').insert(data);
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
    if (!confirm('Delete this category? Services using it will lose their category link.')) return;
    await supabase.from('categories').delete().eq('id', id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-500">Organise services into categories for filtering on the Services page.</p>
        <button onClick={() => setEditing({ ...EMPTY, display_order: categories.length })} className="btn-primary shrink-0">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {editing && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-ink-900">{editing.id ? 'Edit' : 'New'} Category</h3>
            <button onClick={() => setEditing(null)} className="text-ink-400 hover:text-ink-900"><X size={20} /></button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v, slug: editing.slug || slugify(v) })} />
            <Field label="Slug" value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
            <Field label="Order" value={String(editing.display_order)} onChange={(v) => setEditing({ ...editing, display_order: Number(v) || 0 })} />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button onClick={handleSave} disabled={saving || !editing.name.trim()} className="btn-primary">
            {saving ? 'Saving...' : 'Save Category'}
          </button>
        </Card>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <Card key={cat.id} padding="sm" className="flex items-center gap-4 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink-900 truncate">{cat.name}</p>
              <p className="text-sm text-ink-400 truncate">{cat.slug}</p>
            </div>
            <span className="text-xs text-ink-400 shrink-0">Order {cat.display_order}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setEditing({ id: cat.id, name: cat.name, slug: cat.slug, display_order: cat.display_order })} className="p-2 text-ink-400 hover:text-ink-900"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(cat.id)} className="p-2 text-ink-400 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label-text">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="input-field" />
    </div>
  );
}
