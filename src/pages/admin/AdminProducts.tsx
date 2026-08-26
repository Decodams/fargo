import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Category, Product } from '@/types';

interface EditState {
  id?: string;
  name: string;
  slug: string;
  category_id: string;
  category: string;
  description: string;
  price: number | string;
  image_url: string;
  is_active: boolean;
}

const EMPTY: EditState = {
  name: '', slug: '', category_id: '', category: '', description: '', price: '', image_url: '', is_active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [{ data }, { data: categoryData }] = await Promise.all([
      supabase.from('products').select('*').order('name', { ascending: true }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
    ]);
    setProducts((data ?? []) as Product[]);
    setCategories((categoryData ?? []) as Category[]);
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
        category_id: editing.category_id || null,
        category: editing.category.trim() || null,
        description: editing.description.trim() || null,
        price: editing.price ? Number(editing.price) : null,
        image_url: editing.image_url.trim() || null,
        is_active: editing.is_active,
      };
      if (editing.id) {
        const { error: e } = await supabase.from('products').update(data).eq('id', editing.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('products').insert(data);
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

  const handleImageUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    setError('');
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setEditing((current) => current ? { ...current, image_url: data.publicUrl } : current);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    await load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">{products.length} products</p>
        <button onClick={() => setEditing({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 text-cream-50 text-sm hover:bg-ink-800 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.id} className="bg-cream-50 border border-ink-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900 truncate">{p.name}</p>
                <p className="text-xs text-ink-400">{p.category ?? 'Uncategorized'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setEditing({ id: p.id, name: p.name, slug: p.slug, category_id: p.category_id ?? '', category: p.category ?? '', description: p.description ?? '', price: p.price ?? '', image_url: p.image_url ?? '', is_active: p.is_active })}
                  className="p-1.5 text-ink-500 hover:text-ink-900 transition-colors"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-ink-500 hover:text-rose-500 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
            {p.price && <p className="text-sm text-ink-700">{formatPrice(p.price)}</p>}
            {!p.is_active && <p className="text-xs text-ink-400 mt-1">(inactive)</p>}
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-ink-900/40" aria-hidden="true" />
          <div className="relative bg-cream-50 w-full sm:max-w-lg max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-t-xl sm:rounded-none">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base lg:text-lg font-display text-ink-900">{editing.id ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setEditing(null)} className="p-1 text-ink-400 hover:text-ink-900"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label-text">Name</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                  className="input-field" placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Category</label>
                  <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value, category: categories.find((category) => category.id === e.target.value)?.name ?? '' })}
                    className="input-field">
                    <option value="">No category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-text">Price</label>
                  <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                    className="input-field" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="input-field resize-none" placeholder="Brief description" />
              </div>
              <div>
                <label className="label-text">Product image (optional)</label>
                <input type="file" accept="image/*" disabled={uploading} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImageUpload(file);
                  e.target.value = '';
                }} className="input-field file:mr-3 file:border-0 file:bg-ink-900 file:px-3 file:py-1.5 file:text-cream-50" />
                {editing.image_url && <img src={editing.image_url} alt="Product preview" className="mt-3 h-24 w-24 object-cover border border-ink-100" />}
                <label className="label-text mt-3">Or use an image URL</label>
                <input type="text" value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className="input-field" placeholder="https://..." />
              </div>
              <div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm text-ink-700">
                    <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>
              {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || !editing.name.trim()} className="btn-primary flex-1">
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
