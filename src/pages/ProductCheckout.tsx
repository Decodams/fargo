import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useSettings } from '@/lib/hooks';
import { getSetting, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

type CartItem = { product: Product; quantity: number };

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  paymentReference: string;
};

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem('fargo-cart') || '[]') as CartItem[];
  } catch {
    return [];
  }
}

export default function ProductCheckout() {
  const { settings } = useSettings();
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [form, setForm] = useState<CheckoutForm>({ name: '', email: '', phone: '', address: '', notes: '', paymentReference: '' });
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const currency = getSetting(settings, 'currency_symbol') || '₦';
  const bankName = getSetting(settings, 'bank_name') || 'Moniepoint';
  const accountNumber = getSetting(settings, 'account_number') || '5308789513';
  const accountName = getSetting(settings, 'account_name') || 'Fargo Unisex Salon and Spa';
  const total = cart.reduce((sum, item) => sum + (Number(item.product.price) || 0) * item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('fargo-cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (productId: string, change: number) => {
    setCart((current) => current
      .map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || cart.length === 0) return;
    setSubmitting(true);
    setError('');

    try {
      let orderReference: string;
      const orderData = {
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_phone: form.phone.trim(),
        delivery_address: form.address.trim(),
        payment_reference: form.paymentReference.trim() || null,
        notes: form.notes.trim() || null,
      };

      if (isSupabaseConfigured) {
        const { data, error: orderError } = await supabase.rpc('create_public_product_order', {
          order_data: orderData,
          order_items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        });
        if (orderError) throw orderError;
        orderReference = typeof data === 'string' ? data : data.reference;
      } else {
        orderReference = `FAR-P-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      }

      localStorage.removeItem('fargo-cart');
      setCart([]);
      setReference(orderReference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-24">
        <div className="w-full max-w-xl text-center">
          <CheckCircle size={48} className="mx-auto mb-5 text-olive-500" />
          <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-3">Order received</p>
          <h1 className="text-3xl lg:text-4xl font-display text-ink-900 mb-3">Your order is being confirmed</h1>
          <p className="text-ink-600 leading-relaxed mb-6">Use the reference below when making or confirming your bank transfer.</p>
          <p className="font-mono text-lg text-ink-900 mb-8">{reference}</p>
          <div className="bg-cream-100 border border-ink-100 p-6 text-left mb-8 text-sm text-ink-700 space-y-1">
            <p className="font-medium text-ink-900 mb-2">Transfer details</p>
            <p>Bank: {bankName}</p><p>Account name: {accountName}</p><p>Account number: <span className="font-mono text-ink-900">{accountNumber}</span></p>
            <p className="pt-3 text-ink-500">Our team will verify your payment and contact you about pickup or delivery.</p>
          </div>
          <Link to="/products" className="btn-primary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 mb-8"><ArrowLeft size={15} /> Products</Link>
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
          <section className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6"><ShoppingBag size={20} className="text-rose-500" /><h1 className="text-3xl lg:text-4xl font-display text-ink-900">Your bag</h1></div>
            {cart.length === 0 ? (
              <div className="border border-ink-100 bg-cream-100 p-10 text-center"><p className="text-ink-500 mb-5">Your bag is empty.</p><Link to="/products" className="btn-outline">Browse products</Link></div>
            ) : (
              <div className="divide-y divide-ink-100 border-y border-ink-100">
                {cart.map((item) => <div key={item.product.id} className="py-5 flex gap-4 items-center">
                  <img src={item.product.image_url || ''} alt="" className="w-16 h-16 object-cover bg-cream-100" />
                  <div className="flex-1 min-w-0"><p className="font-display text-lg text-ink-900 truncate">{item.product.name}</p><p className="text-sm text-ink-500">{formatPrice(Number(item.product.price) || 0, currency)}</p></div>
                  <div className="flex items-center border border-ink-200"><button type="button" onClick={() => updateQuantity(item.product.id, -1)} className="p-2 text-ink-500 hover:text-ink-900"><Minus size={14} /></button><span className="w-8 text-center text-sm">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.product.id, 1)} className="p-2 text-ink-500 hover:text-ink-900"><Plus size={14} /></button></div>
                  <button type="button" onClick={() => updateQuantity(item.product.id, -item.quantity)} aria-label={`Remove ${item.product.name}`} className="p-2 text-ink-400 hover:text-rose-500"><Trash2 size={16} /></button>
                </div>)}
              </div>
            )}
          </section>

          <section className="lg:col-span-2">
            <h2 className="text-xl font-display text-ink-900 mb-5">Checkout details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Full name *" />
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="Email *" />
              <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Phone *" />
              <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field resize-none" placeholder="Pickup or delivery address *" />
              <input value={form.paymentReference} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} className="input-field" placeholder="Transfer reference (optional)" />
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" placeholder="Order notes (optional)" />
              <div className="bg-cream-100 border border-ink-100 p-4 text-sm text-ink-600"><p className="font-medium text-ink-900 mb-2">Pay by bank transfer</p><p>{bankName} · {accountName}</p><p className="font-mono">{accountNumber}</p><p className="mt-2 text-xs text-ink-500">Your order is captured immediately and confirmed after payment verification.</p></div>
              {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3">{error}</p>}
              <div className="flex items-center justify-between border-t border-ink-100 pt-5"><span className="text-ink-600">Total</span><span className="text-xl font-display text-ink-900">{formatPrice(total, currency)}</span></div>
              <button disabled={submitting || cart.length === 0} className="btn-primary w-full">{submitting ? 'Submitting...' : 'Place order'}</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
