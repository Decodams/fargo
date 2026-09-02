import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice, formatRelative } from '@/lib/utils';
import type { ProductOrder, ProductOrderItem } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'fulfilled', 'cancelled'] as const;

export default function AdminOrders() {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [selected, setSelected] = useState<ProductOrder | null>(null);
  const [items, setItems] = useState<ProductOrderItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currency, setCurrency] = useState('₦');

  const load = useCallback(async () => {
    const [{ data }, { data: settings }] = await Promise.all([
      supabase.from('product_orders').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('key, value'),
    ]);
    setOrders((data ?? []) as ProductOrder[]);
    const map: Record<string, string> = {};
    ((settings ?? []) as { key: string; value: string }[]).forEach((s) => { map[s.key] = s.value; });
    setCurrency(map.currency_symbol || '₦');
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openDetail = async (order: ProductOrder) => {
    setSelected(order);
    const { data } = await supabase.from('product_order_items').select('*').eq('order_id', order.id);
    setItems((data ?? []) as ProductOrderItem[]);
  };

  const updateOrder = async (status: ProductOrder['status'], paymentStatus?: ProductOrder['payment_status']) => {
    if (!selected) return;
    const update = { status, ...(paymentStatus ? { payment_status: paymentStatus } : {}), updated_at: new Date().toISOString() };
    const { data } = await supabase.from('product_orders').update(update).eq('id', selected.id).select().single();
    if (data) {
      setOrders((current) => current.map((order) => order.id === selected.id ? { ...order, ...data } as ProductOrder : order));
      setSelected({ ...selected, ...data } as ProductOrder);
    }
  };

  const filtered = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const query = search.toLowerCase();
    return matchesStatus && (!query || order.customer_name.toLowerCase().includes(query) || order.reference.toLowerCase().includes(query) || order.customer_email.toLowerCase().includes(query));
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {STATUS_FILTERS.map((status) => <button key={status} onClick={() => setStatusFilter(status)} className={`whitespace-nowrap px-3 py-2 text-sm capitalize ${statusFilter === status ? 'bg-ink-900 text-cream-50' : 'text-ink-600 hover:text-ink-900'}`}>{status}</button>)}
        </div>
        <div className="relative sm:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders..." className="input-field pl-9" /></div>
      </div>

      {filtered.length === 0 ? <div className="bg-cream-100 border border-ink-100 p-12 text-center text-ink-400 text-sm">No product orders found.</div> : <div className="space-y-2">
        {filtered.map((order) => <button key={order.id} onClick={() => void openDetail(order)} className="w-full bg-cream-50 border border-ink-100 p-4 flex items-center justify-between gap-4 text-left hover:border-ink-300">
          <div className="min-w-0"><p className="text-sm font-medium text-ink-900 truncate">{order.customer_name}</p><p className="text-xs text-ink-500 truncate">{order.reference} · {order.customer_email}</p><p className="text-xs text-ink-400 mt-1">{formatRelative(order.created_at)}</p></div>
          <div className="text-right shrink-0"><p className="text-sm text-ink-900">{formatPrice(order.total_price, currency)}</p><StatusBadge status={order.status} /></div>
        </button>)}
      </div>}

      {selected && <div className="fixed inset-0 z-50 flex justify-end"><div className="absolute inset-0 bg-ink-900/40" onClick={() => setSelected(null)} /><div className="relative w-full max-w-md bg-cream-50 h-full overflow-y-auto p-5 lg:p-6"><div className="flex items-start justify-between border-b border-ink-100 pb-4 mb-5"><div><h2 className="text-xl font-display text-ink-900">{selected.reference}</h2><p className="text-xs text-ink-500 mt-1">{selected.customer_name}</p></div><button onClick={() => setSelected(null)} className="text-ink-500 hover:text-ink-900">Close</button></div>
        <div className="space-y-4 text-sm"><div className="flex justify-between"><span className="text-ink-500">Payment</span><StatusBadge status={selected.payment_status} /></div><div className="flex justify-between"><span className="text-ink-500">Delivery</span><span className="capitalize">{selected.delivery_method === 'delivery' ? 'Home delivery' : 'Pickup'}</span></div>{selected.delivery_fee > 0 && <div className="flex justify-between"><span className="text-ink-500">Delivery fee</span><span>{formatPrice(selected.delivery_fee, currency)}</span></div>}<div className="border-t border-ink-100 pt-4 space-y-2"><p><span className="text-ink-500">Email:</span> {selected.customer_email}</p><p><span className="text-ink-500">Phone:</span> {selected.customer_phone}</p><p><span className="text-ink-500">Address:</span> {selected.delivery_address}</p>{selected.receipt_url && <p><span className="text-ink-500">Receipt:</span> <a href={selected.receipt_url} target="_blank" rel="noreferrer" className="text-rose-600 underline">View file</a></p>}</div><div className="border-t border-ink-100 pt-4"><p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-3">Items</p>{items.map((item) => <div key={item.id} className="flex justify-between py-1"><span>{item.product_name} × {item.quantity}</span><span>{formatPrice(item.price * item.quantity, currency)}</span></div>)}<div className="flex justify-between border-t border-ink-100 mt-3 pt-3 font-medium"><span>Total</span><span>{formatPrice(selected.total_price, currency)}</span></div></div><div className="flex flex-wrap gap-2 pt-3"><button onClick={() => void updateOrder('confirmed', 'paid')} className="btn-primary">Confirm payment</button><button onClick={() => void updateOrder('fulfilled')} className="btn-outline">Mark fulfilled</button><button onClick={() => void updateOrder('cancelled', 'failed')} className="btn-outline">Cancel order</button></div></div>
      </div></div>}
    </div>
  );
}
