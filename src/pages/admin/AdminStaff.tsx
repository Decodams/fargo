import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Staff } from '@/types';
import Card from '@/components/ui/Card';

interface EditState {
  id?: string;
  name: string;
  role: string;
  bio: string;
  specialties: string;
  is_active: boolean;
}

const EMPTY: EditState = {
  name: '', role: '', bio: '', specialties: '', is_active: true,
};

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('staff').select('*').order('name', { ascending: true });
    setStaff((data ?? []) as Staff[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const data = {
        name: editing.name.trim(),
        role: editing.role.trim(),
        bio: editing.bio.trim() || null,
        specialties: editing.specialties.trim() || null,
        is_active: editing.is_active,
      };
      if (editing.id) {
        const { error: e } = await supabase.from('staff').update(data).eq('id', editing.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from('staff').insert(data);
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
    if (!confirm('Remove this team member?')) return;
    await supabase.from('staff').delete().eq('id', id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-500">Manage specialists shown on About and Booking pages.</p>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary shrink-0">
          <Plus size={15} /> Add Member
        </button>
      </div>

      {editing && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-ink-900">{editing.id ? 'Edit' : 'New'} Team Member</h3>
            <button onClick={() => setEditing(null)} className="text-ink-400 hover:text-ink-900"><X size={20} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
            <Field label="Role" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} />
            <Field label="Specialties" value={editing.specialties} onChange={(v) => setEditing({ ...editing, specialties: v })} />
          </div>
          <div>
            <label className="label-text">Bio</label>
            <textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} rows={3} className="input-field resize-y" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            Active on site
          </label>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button onClick={handleSave} disabled={saving || !editing.name.trim()} className="btn-primary">
            {saving ? 'Saving...' : 'Save Member'}
          </button>
        </Card>
      )}

      <div className="space-y-2">
        {staff.map((s) => (
          <Card key={s.id} padding="sm" className="flex items-center gap-4 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink-900 truncate">{s.name}</p>
              <p className="text-sm text-ink-500 truncate">{s.role}{s.specialties ? ` · ${s.specialties}` : ''}</p>
            </div>
            <span className={`text-xs uppercase tracking-wider-2 shrink-0 ${s.is_active ? 'text-olive-600' : 'text-ink-400'}`}>
              {s.is_active ? 'Active' : 'Hidden'}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setEditing({ id: s.id, name: s.name, role: s.role, bio: s.bio ?? '', specialties: s.specialties ?? '', is_active: s.is_active })} className="p-2 text-ink-400 hover:text-ink-900"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(s.id)} className="p-2 text-ink-400 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          </Card>
        ))}
        {staff.length === 0 && <p className="text-ink-400 text-sm py-8 text-center">No team members yet.</p>}
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
