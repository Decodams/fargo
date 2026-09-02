import type { Product } from '@/types';

/**
 * Curated fallback imagery keyed by product slug.
 * When a product has no `image_url` in the database, we fall back to these
 * so the storefront and detail page always render a consistent image.
 */
const PRODUCT_IMAGES: Record<string, string> = {
  'hair-dye-black': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'professional-hair-clippers': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'firm-hold-hair-spray': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'styling-comb-set': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'edge-control-gel': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'moisturising-shampoo': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'deep-conditioner': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'hair-growth-oil-serum': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'wig-extension-care-kit': 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'premium-nail-polish-set': 'https://images.pexels.com/photos/5238075/pexels-photo-5238075.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  'glow-facial-kit': 'https://images.pexels.com/photos/1470165/pexels-photo-1470165.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
};

const PLACEHOLDER =
  'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&h=400&w=400';

export function getProductImage(product: Product): string {
  return PRODUCT_IMAGES[product.slug] ?? product.image_url ?? PLACEHOLDER;
}
