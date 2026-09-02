import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { DEFAULT_GALLERY, type GalleryItem } from '@/lib/content';
import { DEFAULT_SETTINGS } from '@/lib/utils';
import { AdminField, SaveBar, saveSettings, useAdminSettings } from '@/lib/adminSettings';
import Card from '@/components/ui/Card';

const CATEGORIES = ['Hair', 'Spa', 'Nails', 'Space'];

export default function AdminGallery() {
  const { settings, update, loading } = useAdminSettings();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!loading && !initialized) {
    const raw = settings.gallery_items ?? DEFAULT_SETTINGS.gallery_items ?? '';
    if (raw.trim()) {
      try {
        setItems(JSON.parse(raw) as GalleryItem[]);
      } catch {
        setItems(DEFAULT_GALLERY);
      }
    } else {
      setItems(DEFAULT_GALLERY);
    }
    setInitialized(true);
  }

  const persist = (next: GalleryItem[]) => {
    setItems(next);
    update('gallery_items', JSON.stringify(next));
  };

  const addItem = () => {
    persist([...items, { src: '', alt: '', category: 'Hair', span: false }]);
  };

  const removeItem = (index: number) => {
    persist(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  };

  const updateItem = (index: number, field: keyof GalleryItem, value: string | boolean) => {
    persist(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const merged = { ...settings, gallery_items: JSON.stringify(items) };
      await saveSettings(merged);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-ink-200 border-t-ink-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-500">Manage gallery images, categories, and layout order.</p>
        <button onClick={addItem} className="btn-primary shrink-0"><Plus size={15} /> Add Image</button>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <Card key={i} padding="sm" className="space-y-3">
            <div className="flex items-start gap-4">
              {item.src ? (
                <img src={item.src} alt={item.alt || 'Preview'} className="w-20 h-20 object-cover shrink-0 bg-cream-100" />
              ) : (
                <div className="w-20 h-20 bg-cream-100 shrink-0 flex items-center justify-center text-xs text-ink-400">No image</div>
              )}
              <div className="flex-1 min-w-0 space-y-3">
                <AdminField label="Image URL" value={item.src} onChange={(v) => updateItem(i, 'src', v)} />
                <AdminField label="Alt Text" value={item.alt} onChange={(v) => updateItem(i, 'alt', v)} />
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="label-text">Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(i, 'category', e.target.value)}
                      className="input-field w-auto min-w-[120px]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-ink-600 pt-5">
                    <input type="checkbox" checked={!!item.span} onChange={(e) => updateItem(i, 'span', e.target.checked)} />
                    Large tile
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="p-1.5 text-ink-400 hover:text-ink-900 disabled:opacity-30"><ArrowUp size={16} /></button>
                <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} className="p-1.5 text-ink-400 hover:text-ink-900 disabled:opacity-30"><ArrowDown size={16} /></button>
                <button onClick={() => removeItem(i)} className="p-1.5 text-ink-400 hover:text-rose-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <SaveBar saving={saving} saved={saved} onSave={handleSave} />

      {error && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3 -mt-4">
          {error}
        </p>
      )}
    </div>
  );
}
