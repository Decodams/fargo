import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Download, Minus, Plus, RefreshCw, ShoppingBag, Trash2, Upload } from 'lucide-react';
import { supabase, isSupabaseConfigured, supabasePublicKey } from '@/lib/supabase';
import { useSettings } from '@/lib/hooks';
import { getSetting, formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/cart';
import PageMeta from '@/components/ui/PageMeta';
import { useProductReceipt, type ProductReceiptData } from '@/components/ui/ProductReceiptPDF';

type OrderStatus = {
  status: string;
  payment_status: string;
  total_price: number;
  delivery_method: string;
  delivery_fee: number;
  customer_name: string;
  created_at: string;
  items: { product_name: string; price: number; quantity: number }[];
};

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  paymentReference: string;
  deliveryMethod: 'walk_in' | 'delivery';
};

export default function ProductCheckout() {
  const { settings } = useSettings();
  const { items: cart, subtotal, updateQuantity, remove, clear } = useCart();
  const [form, setForm] = useState<CheckoutForm>({
    name: '', email: '', phone: '', address: '', notes: '', paymentReference: '', deliveryMethod: 'walk_in',
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [orderStatus, setOrderStatus] = useState<ProductReceiptData | null>(null);
  const { generatePDF } = useProductReceipt();

  const currency = getSetting(settings, 'currency_symbol') || '₦';
  const bankName = getSetting(settings, 'bank_name') || 'Moniepoint';
  const accountNumber = getSetting(settings, 'account_number') || '5308789513';
  const accountName = getSetting(settings, 'account_name') || 'Fargo Unisex Salon and Spa';
  const deliveryFeeSetting = Number(getSetting(settings, 'delivery_fee') || 0);
  const deliveryFee = form.deliveryMethod === 'delivery' ? deliveryFeeSetting : 0;
  const total = subtotal + deliveryFee;

  const uploadReceipt = async (file: File) => {
    if (!isSupabaseConfigured) return;
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `orders/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from('receipts').getPublicUrl(path);
      setReceiptUrl(publicUrl.publicUrl);
      setReceipt(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Receipt upload failed. Please try again or add the transfer reference instead.');
    } finally {
      setUploading(false);
    }
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
        delivery_method: form.deliveryMethod,
        delivery_fee: deliveryFee,
        receipt_url: receiptUrl,
      };

      if (isSupabaseConfigured) {
        const { data, error: orderError } = await supabase.rpc('create_public_product_order', {
          order_data: orderData,
          order_items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        });
        if (orderError) throw new Error(orderError.message || 'Order failed. Please try again.');
        orderReference = typeof data === 'string' ? data : data?.reference;
        if (!orderReference) throw new Error('Order failed. Please try again.');

        try {
          const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;
          await fetch(fnUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supabasePublicKey}` },
            body: JSON.stringify({
              type: 'product_order',
              reference: orderReference,
              customer_name: form.name.trim(),
              customer_email: form.email.trim(),
              customer_phone: form.phone.trim(),
              home_address: form.deliveryMethod === 'delivery' ? form.address.trim() : null,
              delivery_method: form.deliveryMethod,
              delivery_fee: deliveryFee,
              total_price: total,
              items: cart.map((item) => ({ name: item.product.name, quantity: item.quantity, price: item.product.price })),
              notes: form.notes.trim() || null,
            }),
          });
        } catch {
          // Email failure is non-critical — the order was already saved
        }
      } else {
        orderReference = `FAR-P-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      }

      clear();
      setReference(orderReference);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Poll for admin confirmation once an order has been placed.
  useEffect(() => {
    if (!reference || !isSupabaseConfigured) return;

    const checkStatus = async () => {
      const { data } = await supabase.rpc('get_public_product_order', { order_reference: reference });
      const typed = data as ProductReceiptData | null;
      if (typed?.status) setOrderStatus(typed);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [reference]);

  if (reference) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center px-5 py-24">
        <div className="w-full max-w-xl text-center">
          {orderStatus?.status === 'confirmed' ? (
            <>
              <CheckCircle size={48} className="mx-auto mb-5 text-olive-500" />
              <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-3">Order confirmed</p>
              <h1 className="text-3xl lg:text-4xl font-display text-ink-900 mb-3">Thank you for your order</h1>
              <p className="text-ink-600 leading-relaxed mb-6">
                Your payment has been confirmed. Download your receipt below — you can show it when you{' '}
                {orderStatus.delivery_method === 'delivery' ? 'receive your delivery' : 'pick up your order'} at the salon.
              </p>
              <p className="font-mono text-lg text-ink-900 mb-8">{reference}</p>

              <div className="bg-cream-100 border border-ink-100 divide-y divide-ink-100 text-left mb-8 text-sm">
                <div className="px-6 py-4 flex justify-between"><span className="text-ink-500">Customer</span><span className="text-ink-900 font-medium">{orderStatus.customer_name}</span></div>
                <div className="px-6 py-4 flex justify-between"><span className="text-ink-500">Delivery</span><span className="text-ink-900 font-medium">{orderStatus.delivery_method === 'delivery' ? 'Home Delivery' : 'Salon Pickup'}</span></div>
                <div className="px-6 py-4 flex justify-between"><span className="text-ink-500">Items</span><span className="text-ink-900 font-medium">{orderStatus.items.reduce((s, i) => s + i.quantity, 0)}</span></div>
                <div className="px-6 py-4 flex justify-between"><span className="text-ink-500">Total Paid</span><span className="text-ink-900 font-medium">{currency}{orderStatus.total_price.toLocaleString()}</span></div>
              </div>

              <button
                onClick={() => generatePDF(
                  { ...orderStatus, reference },
                  bankName,
                  accountNumber,
                  accountName,
                )}
                className="inline-flex items-center gap-3 px-8 py-4 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-colors mb-8"
              >
                <Download size={16} /> Download Payment Receipt (PDF)
              </button>

              <div>
                <Link to="/products" className="inline-flex items-center gap-2 text-sm uppercase tracking-wider-2 text-ink-900 border-b border-ink-900 pb-1 hover:text-rose-500 hover:border-rose-500 transition-colors">
                  Continue shopping <ArrowLeft size={14} className="rotate-180" />
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border-2 border-amber-400 bg-amber-50">
                <Clock size={28} className="text-amber-500" />
              </div>
              <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-3">Order received</p>
              <h1 className="text-3xl lg:text-4xl font-display text-ink-900 mb-3">Your order is being confirmed</h1>
              <p className="text-ink-600 leading-relaxed mb-6">
                Keep this reference handy. {form.deliveryMethod === 'delivery'
                  ? 'Our team will arrange home delivery once your payment is confirmed.'
                  : 'You can pick your order up at the salon once your payment is confirmed.'}
                &nbsp;Your receipt will be available here once your payment is confirmed.
              </p>
              <p className="font-mono text-lg text-ink-900 mb-8">{reference}</p>
              <div className="bg-cream-100 border border-ink-100 p-6 text-left mb-8 text-sm text-ink-700 space-y-1">
                <p className="font-medium text-ink-900 mb-2">Transfer details</p>
                <p>Bank: {bankName}</p><p>Account name: {accountName}</p><p>Account number: <span className="font-mono text-ink-900">{accountNumber}</span></p>
                <p className="pt-3 text-ink-500">Our team will verify your payment and contact you about {form.deliveryMethod === 'delivery' ? 'your delivery' : 'pickup'}.</p>
              </div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider-2 text-ink-500 mb-8">
                <RefreshCw size={14} className={submitting ? '' : 'animate-spin'} />
                Waiting for admin confirmation...
              </div>
              <Link to="/products" className="btn-primary">Continue shopping</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Checkout" path="/products/checkout" noindex />
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
                {cart.map((item) => <div key={item.product.id} className="py-5 flex items-start gap-4">
                  <img src={item.product.image_url || ''} alt="" className="w-16 h-16 shrink-0 object-cover bg-cream-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg text-ink-900 leading-snug">{item.product.name}</p>
                        <p className="text-sm text-ink-500 mt-0.5">{formatPrice(Number(item.product.price) || 0, currency)}</p>
                      </div>
                      <button type="button" onClick={() => remove(item.product.id)} aria-label={`Remove ${item.product.name}`} className="p-1.5 text-ink-400 hover:text-rose-500 shrink-0"><Trash2 size={16} /></button>
                    </div>
                    <div className="mt-3 inline-flex items-center border border-ink-200">
                      <button type="button" onClick={() => updateQuantity(item.product.id, -1)} aria-label="Decrease quantity" className="w-10 h-10 flex items-center justify-center text-ink-500 hover:text-ink-900 active:bg-ink-100"><Minus size={14} /></button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.product.id, 1)} aria-label="Increase quantity" className="w-10 h-10 flex items-center justify-center text-ink-500 hover:text-ink-900 active:bg-ink-100"><Plus size={14} /></button>
                    </div>
                  </div>
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

              <div>
                <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-2">Delivery method</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setForm({ ...form, deliveryMethod: 'walk_in' })} className={`border p-3 text-left text-sm transition-colors ${form.deliveryMethod === 'walk_in' ? 'border-ink-900 bg-cream-100' : 'border-ink-100 hover:border-ink-300'}`}>
                    <p className="font-medium text-ink-900 mb-1">Pickup</p>
                    <p className="text-xs text-ink-500">Collect from the salon</p>
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, deliveryMethod: 'delivery' })} className={`border p-3 text-left text-sm transition-colors ${form.deliveryMethod === 'delivery' ? 'border-ink-900 bg-cream-100' : 'border-ink-100 hover:border-ink-300'}`}>
                    <p className="font-medium text-ink-900 mb-1">Home delivery</p>
                    <p className="text-xs text-ink-500">{deliveryFeeSetting > 0 ? `${formatPrice(deliveryFeeSetting, currency)} fee` : 'Delivery arranged'}</p>
                  </button>
                </div>
              </div>

              {form.deliveryMethod === 'delivery' && (
                <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field resize-none" placeholder="Delivery address *" />
              )}
              {form.deliveryMethod === 'walk_in' && (
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="Pickup notes (optional)" />
              )}

              <input value={form.paymentReference} onChange={(e) => setForm({ ...form, paymentReference: e.target.value })} className="input-field" placeholder="Transfer reference (optional)" />
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field resize-none" placeholder="Order notes (optional)" />

              <div className="bg-cream-100 border border-ink-100 p-4 text-sm text-ink-600 space-y-3">
                <div><p className="font-medium text-ink-900 mb-1">Pay by bank transfer</p><p>{bankName} · {accountName}</p><p className="font-mono">{accountNumber}</p></div>
                <div className="border-t border-ink-100 pt-3">
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wider-2 text-ink-500 cursor-pointer">
                    <Upload size={14} /> {receiptUrl ? 'Replace payment receipt' : 'Upload payment receipt (optional)'}
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadReceipt(f); }} />
                  </label>
                  {uploading && <p className="text-xs text-ink-500 mt-2">Uploading...</p>}
                  {receiptUrl && <p className="text-xs text-olive-600 mt-2">Receipt uploaded: {receipt?.name}</p>}
                  <p className="text-xs text-ink-400 mt-1">Prefer to upload later? Add the transfer reference above instead.</p>
                </div>
              </div>

              {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3">{error}</p>}
              <div className="flex items-center justify-between border-t border-ink-100 pt-5">
                <span className="text-ink-600">{deliveryFee > 0 ? <>Subtotal</> : <>Total</>}</span>
                <span className="text-xl font-display text-ink-900">{formatPrice(subtotal, currency)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex items-center justify-between text-sm text-ink-600">
                  <span>Delivery</span><span>{formatPrice(deliveryFee, currency)}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex items-center justify-between text-lg font-medium text-ink-900">
                  <span>Total</span><span>{formatPrice(total, currency)}</span>
                </div>
              )}
              <button disabled={submitting || cart.length === 0} className="btn-primary w-full">{submitting ? 'Submitting...' : 'Place order'}</button>
            </form>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
