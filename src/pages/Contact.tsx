import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSettings } from '@/lib/hooks';
import { getSetting } from '@/lib/utils';
import type { Product } from '@/types';
import Reveal from '@/components/ui/Reveal';

export default function Contact() {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const phone = getSetting(settings, 'contact_phone');
  const email = getSetting(settings, 'contact_email');
  const address = getSetting(settings, 'address');
  const instagram = getSetting(settings, 'instagram_url');
  const facebook = getSetting(settings, 'facebook_url');

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }) => {
        setProducts(data ?? []);
        const productSlug = searchParams.get('product');
        if (productSlug) setSelectedProduct(productSlug);
      });
  }, [searchParams]);

  const selectedProductObj = products.find((p) => p.slug === selectedProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);

    try {
      const inquiryData: Record<string, unknown> = {
        type: selectedProductObj ? 'product' : 'general',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        message: form.message.trim(),
      };

      if (selectedProductObj) {
        inquiryData.product_id = selectedProductObj.id;
        inquiryData.product_name = selectedProductObj.name;
      }

      const { error: insertError } = await supabase.from('inquiries').insert(inquiryData);

      if (insertError) throw insertError;

      // Fire notification email (non-blocking)
      try {
        const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;
        await fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
          body: JSON.stringify({
            type: 'inquiry',
            customer_name: form.name.trim(),
            customer_email: form.email.trim(),
            customer_phone: form.phone.trim() || null,
            message: form.message.trim(),
            inquiry_type: selectedProductObj ? 'product' : 'general',
            product_name: selectedProductObj?.name ?? null,
          }),
        });
      } catch {
        // Email failure is non-critical — inquiry was saved
      }

      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      setSelectedProduct('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-cream-100 border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-5">Contact</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-ink-900 leading-[1.05] text-balance max-w-3xl">
            Questions, product inquiries, or just saying hello.
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Contact info */}
            <div className="lg:col-span-4">
              <Reveal>
                <h2 className="text-2xl font-display text-ink-900 mb-6">Get in touch</h2>
                <div className="space-y-6">
                  <ContactRow icon={<Phone size={18} />} label="Phone" value={phone} href={`tel:${phone}`} />
                  <ContactRow icon={<Mail size={18} />} label="Email" value={email} href={`mailto:${email}`} />
                  <ContactRow icon={<MapPin size={18} />} label="Location" value={address} />
                </div>

                <div className="mt-8 pt-8 border-t border-ink-100">
                  <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-4">Follow</p>
                  <div className="flex items-center gap-3">
                    <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center border border-ink-200 hover:border-rose-500 hover:text-rose-500 transition-colors" aria-label="Instagram">
                      <Instagram size={18} />
                    </a>
                    <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center border border-ink-200 hover:border-rose-500 hover:text-rose-500 transition-colors" aria-label="Facebook">
                      <Facebook size={18} />
                    </a>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-ink-100">
                  <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-4">Hours</p>
                  <ul className="space-y-2 text-sm text-ink-600">
                    <li className="flex justify-between"><span>Tue – Sat</span><span>9:00 – 19:00</span></li>
                    <li className="flex justify-between"><span>Sunday</span><span>12:00 – 18:00</span></li>
                    <li className="flex justify-between"><span>Monday</span><span>Closed</span></li>
                  </ul>
                </div>

                <div className="mt-8 pt-8 border-t border-ink-100">
                  <p className="text-sm text-ink-500">Looking to book an appointment?</p>
                  <Link to="/booking" className="inline-flex items-center gap-2 mt-3 text-sm uppercase tracking-wider-2 text-ink-900 border-b border-ink-900 pb-1 hover:text-rose-500 hover:border-rose-500 transition-colors">
                    Go to Booking
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <Reveal delay={100}>
                {submitted ? (
                  <div className="bg-cream-100 border border-ink-100 p-10 lg:p-16 text-center">
                    <CheckCircle size={40} className="text-olive-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-display text-ink-900 mb-3">Message sent</h3>
                    <p className="text-ink-600 max-w-md mx-auto">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 text-sm uppercase tracking-wider-2 text-rose-500 hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-cream-100 border border-ink-100 p-6 lg:p-10">
                    {selectedProductObj && (
                      <div className="mb-6 p-4 bg-rose-50 border border-rose-200">
                        <p className="text-xs uppercase tracking-wider-2 text-rose-500 mb-1">Product Inquiry</p>
                        <p className="text-ink-900 font-display text-lg">{selectedProductObj.name}</p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label-text" htmlFor="name">Name *</label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="input-field"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="label-text" htmlFor="email">Email *</label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="input-field"
                          placeholder="you@email.com"
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="label-text" htmlFor="phone">Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field"
                        placeholder="Optional"
                      />
                    </div>

                    {!selectedProductObj && products.length > 0 && (
                      <div className="mt-5">
                        <label className="label-text" htmlFor="product">Product (optional)</label>
                        <select
                          id="product"
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="input-field"
                        >
                          <option value="">— None —</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.slug}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mt-5">
                      <label className="label-text" htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="input-field resize-none"
                        placeholder="Tell us what you need..."
                      />
                    </div>

                    {error && (
                      <p className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary mt-6"
                    >
                      {submitting ? 'Sending...' : 'Send Message'} <Send size={15} />
                    </button>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-start gap-4">
      <span className="w-10 h-10 flex items-center justify-center border border-ink-200 text-ink-700 shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wider-2 text-ink-400 mb-1">{label}</p>
        <p className="text-ink-800">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href} className="block hover:opacity-70 transition-opacity">{content}</a> : content;
}
