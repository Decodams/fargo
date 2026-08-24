import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { DEFAULT_FAQ, type FaqSection } from '@/lib/content';
import { DEFAULT_SETTINGS } from '@/lib/utils';
import { SaveBar, saveSettings, useAdminSettings } from '@/lib/adminSettings';
import Card from '@/components/ui/Card';

export default function AdminFAQ() {
  const { settings, update, loading } = useAdminSettings();
  const [sections, setSections] = useState<FaqSection[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSection, setOpenSection] = useState<number | null>(0);

  if (!loading && !initialized) {
    const raw = settings.faq_sections ?? DEFAULT_SETTINGS.faq_sections ?? '';
    if (raw.trim()) {
      try {
        setSections(JSON.parse(raw) as FaqSection[]);
      } catch {
        setSections(DEFAULT_FAQ);
      }
    } else {
      setSections(DEFAULT_FAQ);
    }
    setInitialized(true);
  }

  const persist = (next: FaqSection[]) => {
    setSections(next);
    update('faq_sections', JSON.stringify(next));
  };

  const addSection = () => {
    persist([...sections, { title: 'New Section', items: [{ q: '', a: '' }] }]);
    setOpenSection(sections.length);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const merged = { ...settings, faq_sections: JSON.stringify(sections) };
      await saveSettings(merged);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
        <p className="text-sm text-ink-500">Edit FAQ sections and answers shown on the public FAQ page.</p>
        <button onClick={addSection} className="btn-primary shrink-0"><Plus size={15} /> Add Section</button>
      </div>

      {sections.map((section, si) => (
        <Card key={si} className="space-y-4">
          <button
            type="button"
            onClick={() => setOpenSection(openSection === si ? null : si)}
            className="w-full flex items-center justify-between gap-4 text-left"
          >
            <input
              type="text"
              value={section.title}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const next = [...sections];
                next[si] = { ...section, title: e.target.value };
                persist(next);
              }}
              className="font-display text-lg text-ink-900 bg-transparent border-b border-transparent focus:border-ink-300 focus:outline-none flex-1 min-w-0"
            />
            {openSection === si ? <ChevronUp size={18} className="shrink-0 text-ink-400" /> : <ChevronDown size={18} className="shrink-0 text-ink-400" />}
          </button>

          {openSection === si && (
            <div className="space-y-4 pt-2 border-t border-ink-100">
              {section.items.map((item, ii) => (
                <div key={ii} className="space-y-2 bg-cream-100 border border-ink-100 p-4">
                  <input
                    type="text"
                    value={item.q}
                    placeholder="Question"
                    onChange={(e) => {
                      const next = [...sections];
                      const items = [...section.items];
                      items[ii] = { ...item, q: e.target.value };
                      next[si] = { ...section, items };
                      persist(next);
                    }}
                    className="input-field"
                  />
                  <textarea
                    value={item.a}
                    placeholder="Answer"
                    rows={3}
                    onChange={(e) => {
                      const next = [...sections];
                      const items = [...section.items];
                      items[ii] = { ...item, a: e.target.value };
                      next[si] = { ...section, items };
                      persist(next);
                    }}
                    className="input-field resize-y"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...sections];
                      next[si] = { ...section, items: section.items.filter((_, i) => i !== ii) };
                      persist(next);
                    }}
                    className="text-xs text-ink-400 hover:text-rose-500 flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Remove question
                  </button>
                </div>
              ))}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const next = [...sections];
                    next[si] = { ...section, items: [...section.items, { q: '', a: '' }] };
                    persist(next);
                  }}
                  className="text-sm text-ink-600 hover:text-ink-900"
                >
                  + Add question
                </button>
                <button
                  type="button"
                  onClick={() => persist(sections.filter((_, i) => i !== si))}
                  className="text-sm text-rose-500 hover:text-rose-600 ml-auto"
                >
                  Delete section
                </button>
              </div>
            </div>
          )}
        </Card>
      ))}

      <SaveBar saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}
