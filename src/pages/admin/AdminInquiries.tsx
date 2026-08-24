import { useEffect, useState, useCallback } from 'react';
import { X, MessageSquare, Package, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRelative } from '@/lib/utils';
import type { Inquiry } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

const TYPE_FILTERS = ['all', 'general', 'product', 'service'] as const;
const STATUS_FILTERS = ['all', 'new', 'responded', 'closed'] as const;

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filtered, setFiltered] = useState<Inquiry[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    setInquiries((data ?? []) as Inquiry[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let result = inquiries;
    if (typeFilter !== 'all') result = result.filter((i) => i.type === typeFilter);
    if (statusFilter !== 'all') result = result.filter((i) => i.status === statusFilter);
    setFiltered(result);
  }, [inquiries, typeFilter, statusFilter]);

  const openDetail = (inq: Inquiry) => {
    setSelected(inq);
    setResponseNotes(inq.response_notes ?? '');
  };

  const updateStatus = async (status: string) => {
    if (!selected) return;
    const { data } = await supabase
      .from('inquiries')
      .update({ status, response_notes: responseNotes, updated_at: new Date().toISOString() })
      .eq('id', selected.id)
      .select()
      .single();
    if (data) {
      setInquiries((prev) => prev.map((i) => (i.id === selected.id ? { ...i, status: status as Inquiry['status'], response_notes: responseNotes } : i)));
      setSelected({ ...selected, status: status as Inquiry['status'], response_notes: responseNotes });
    }
  };

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {TYPE_FILTERS.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`whitespace-nowrap px-3 py-2 text-sm capitalize transition-colors ${typeFilter === t ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:text-ink-900'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap px-3 py-2 text-sm capitalize transition-colors ${statusFilter === s ? 'bg-ink-700 text-cream-50' : 'text-ink-500 hover:text-ink-900'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-cream-100 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-cream-100 border border-ink-100 p-12 text-center text-ink-400 text-sm">No inquiries found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inq) => (
            <button key={inq.id} onClick={() => openDetail(inq)}
              className="w-full bg-cream-50 border border-ink-100 p-4 flex items-center justify-between gap-4 hover:border-ink-300 transition-colors text-left">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="shrink-0">
                  {inq.type === 'product' ? <Package size={18} className="text-ink-400" /> : <MessageSquare size={18} className="text-ink-400" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{inq.name}</p>
                  <p className="text-xs text-ink-500 truncate">
                    {inq.type === 'product' && inq.product_name ? `${inq.product_name} — ` : ''}{inq.message}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">{formatRelative(inq.created_at)}</p>
                </div>
              </div>
              <StatusBadge status={inq.status} variant="inquiry" />
            </button>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-cream-50 h-full overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-cream-50 border-b border-ink-100 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-display text-ink-900">Inquiry</h2>
              <button onClick={() => setSelected(null)} className="text-ink-400 hover:text-ink-900"><X size={20} /></button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <StatusBadge status={selected.status} variant="inquiry" />
                <span className="text-xs uppercase tracking-wider-2 text-ink-400">{selected.type}</span>
              </div>

              <div className="border-t border-ink-100 pt-4 space-y-3">
                <DetailRow label="From" value={selected.name} />
                <DetailRow label="Email" value={selected.email} />
                {selected.phone && <DetailRow label="Phone" value={selected.phone} />}
                {selected.product_name && <DetailRow label="Product" value={selected.product_name} />}
                <DetailRow label="Received" value={formatRelative(selected.created_at)} />
              </div>

              <div className="border-t border-ink-100 pt-4">
                <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-2">Message</p>
                <p className="text-sm text-ink-800 leading-relaxed bg-cream-100 p-4 border border-ink-100">{selected.message}</p>
              </div>

              <div className="border-t border-ink-100 pt-4">
                <label className="block text-xs uppercase tracking-wider-2 text-ink-400 mb-2">Response Notes</label>
                <textarea rows={4} value={responseNotes} onChange={(e) => setResponseNotes(e.target.value)}
                  className="input-field resize-none" placeholder="Track your response here..." />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button onClick={() => updateStatus('responded')}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider-2 bg-ink-900 text-cream-50 hover:bg-ink-800 transition-colors">
                  Mark Responded
                </button>
                <button onClick={() => updateStatus('closed')}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider-2 border border-ink-200 text-ink-600 hover:border-ink-900 transition-colors">
                  Close
                </button>
              </div>

              <a href={`mailto:${selected.email}?subject=Re: Your inquiry to Fargo Salon`}
                className="flex items-center gap-2 text-sm text-rose-500 hover:underline pt-2">
                <Mail size={15} /> Reply via email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider-2 text-ink-400">{label}</p>
      <p className="text-sm text-ink-800 mt-0.5">{value}</p>
    </div>
  );
}
