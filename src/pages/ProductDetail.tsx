import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingBag, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/lib/cart';
import { getProductImage } from '@/lib/productImages';
import type { Product } from '@/types';
import { FALLBACK_PRODUCTS } from '@/lib/fallbackData';
import PageMeta from '@/components/ui/PageMeta';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { add: addToCart } = useCart();

  useEffect(() => {
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      setProduct((data as Product | null) ?? FALLBACK_PRODUCTS.find((p) => p.slug === slug) ?? null);
      setLoading(false);
    })();
  }, [slug]);

  const buyNow = (p: Product) => {
    addToCart(p);
    navigate('/products/checkout');
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 h-[26rem] bg-cream-100 animate-pulse" />
            <div className="lg:col-span-7 space-y-4"><div className="h-6 w-24 bg-cream-100 animate-pulse" /><div className="h-10 w-3/4 bg-cream-100 animate-pulse" /><div className="h-4 w-full bg-cream-100 animate-pulse" /><div className="h-4 w-5/6 bg-cream-100 animate-pulse" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <>
        <PageMeta title="Product not found" path="/products" noindex />
        <div className="pt-32 pb-20 min-h-screen bg-cream-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-display text-ink-900 mb-4">Product not found</h1>
            <Link to="/products" className="text-rose-500 hover:underline">Back to products</Link>
          </div>
        </div>
      </>
    );
  }

  const image = getProductImage(product);
  const stocked = product.price != null;

  return (
    <>
      <PageMeta
        title={product.name}
        description={product.description || `${product.name} at Fargo Unisex Salon & Spa. Shop online for pickup or delivery.`}
        path={`/products/${product.slug}`}
      />

      {/* Breadcrumb */}
      <div className="pt-28 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors">
            <ArrowLeft size={15} /> Products
          </Link>
        </div>
      </div>

      {/* Product hero */}
      <section className="py-8 lg:py-12 bg-cream-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5 order-1">
              <div className="aspect-square bg-cream-100 overflow-hidden">
                <img src={image} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="lg:col-span-7 order-2">
              <p className="text-xs uppercase tracking-wider-3 text-rose-500 mb-4 flex items-center gap-2">
                <Tag size={14} /> {product.category ?? 'Product'}
              </p>
              <h1 className="text-4xl sm:text-5xl font-display text-ink-900 leading-[1.05] text-balance">
                {product.name}
              </h1>

              {stocked && (
                <p className="text-2xl font-display text-ink-900 mt-5">{formatPrice(product.price!)}</p>
              )}

              {product.description ? (
                <p className="mt-6 text-lg text-ink-600 leading-relaxed max-w-xl whitespace-pre-line">
                  {product.description}
                </p>
              ) : (
                <p className="mt-6 text-ink-500">
                  This product is available at Fargo Unisex Salon &amp; Spa. Add it to your bag and check out for salon pickup or home delivery.
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-olive-500/10 text-olive-600 text-sm">
                  <Check size={15} /> Pickup or home delivery
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-ink-100 text-ink-700 text-sm">
                  <ShoppingBag size={15} /> Pay on confirmation
                </span>
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-ink-900 text-ink-900 text-sm tracking-wider-2 uppercase font-medium hover:bg-ink-900 hover:text-cream-50 transition-all"
                >
                  Add to bag
                </button>
                <button
                  type="button"
                  onClick={() => buyNow(product)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-ink-900 text-cream-50 text-sm tracking-wider-2 uppercase font-medium hover:bg-rose-500 transition-all"
                >
                  Buy now
                </button>
              </div>

              <div className="mt-10 pt-6 border-t border-ink-100 flex items-center justify-between">
                <Link to="/products" className="text-sm text-ink-500 hover:text-ink-900 border-b border-ink-200 pb-0.5 transition-colors">
                  Continue shopping
                </Link>
                <Link to="/products/checkout" className="inline-flex items-center gap-2 text-sm uppercase tracking-wider-2 text-ink-900 hover:text-rose-500 transition-colors">
                  View bag <ArrowLeft size={14} className="rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
