import type { Category, Service, Staff, BusinessHour, Product } from '@/types';

/*
 * Demo / offline fallback data.
 *
 * When Supabase is not configured (or returns no rows), the public site falls
 * back to this curated dataset so the experience is fully browsable and the
 * booking flow is usable for previews. Once a real backend is connected and
 * seeded, this data is ignored in favour of the live tables.
 */

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-hair', name: 'Hair', slug: 'hair', display_order: 1 },
  { id: 'cat-face', name: 'Face & Body', slug: 'face-and-body', display_order: 2 },
  { id: 'cat-addons', name: 'Add-ons', slug: 'add-ons', display_order: 3 },
];

export const FALLBACK_SERVICES: Service[] = [
  { id: 'svc-1', category_id: 'cat-hair', name: 'Hair Styling & Blow-dry', slug: 'hair-styling-blow-dry', description: 'A finish tailored to your hair type — volume, curl definition, or sleek straight results.', duration_minutes: 45, price_min: 3000, price_max: 6000, home_service_eligible: true, is_active: true, display_order: 1 },
  { id: 'svc-2', category_id: 'cat-hair', name: 'Braiding', slug: 'braiding', description: 'All braiding styles — box braids, cornrows, knotless, feed-in, and more.', duration_minutes: 240, price_min: 5000, price_max: 20000, home_service_eligible: true, is_active: true, display_order: 2 },
  { id: 'svc-3', category_id: 'cat-hair', name: 'Dreadlocks', slug: 'dreadlocks', description: 'Installation, retouch, and maintenance for locs of all lengths.', duration_minutes: 180, price_min: 4000, price_max: 15000, home_service_eligible: true, is_active: true, display_order: 3 },
  { id: 'svc-4', category_id: 'cat-hair', name: 'Hair Colouring', slug: 'hair-colouring', description: 'Full colour, highlights, balayage, or root touch-ups using quality dyes.', duration_minutes: 120, price_min: 5000, price_max: 18000, home_service_eligible: false, is_active: true, display_order: 4 },
  { id: 'svc-5', category_id: 'cat-hair', name: 'Trimming & Haircuts', slug: 'trimming-haircuts', description: 'Precision cuts for all hair textures — from fades to layered styles.', duration_minutes: 30, price_min: 2000, price_max: 5000, home_service_eligible: true, is_active: true, display_order: 5 },
  { id: 'svc-6', category_id: 'cat-hair', name: 'Relaxing & Texturising', slug: 'relaxing-texturising', description: 'Chemical relaxing or texturising for smooth, manageable hair.', duration_minutes: 90, price_min: 4000, price_max: 8000, home_service_eligible: false, is_active: true, display_order: 6 },
  { id: 'svc-7', category_id: 'cat-hair', name: 'Deep Conditioning Treatment', slug: 'deep-conditioning-treatment', description: 'Intensive moisture and protein treatment to restore hair health.', duration_minutes: 30, price_min: 2500, price_max: 5000, home_service_eligible: true, is_active: true, display_order: 7 },
  { id: 'svc-8', category_id: 'cat-hair', name: 'Scalp Treatment', slug: 'scalp-treatment', description: 'Cleansing and revitalising scalp therapy for dandruff, dryness, or hair growth.', duration_minutes: 30, price_min: 3000, price_max: 6000, home_service_eligible: true, is_active: true, display_order: 8 },
  { id: 'svc-9', category_id: 'cat-face', name: 'Facials', slug: 'facials', description: 'Deep-cleansing, brightening, or hydrating facials tailored to your skin.', duration_minutes: 60, price_min: 5000, price_max: 12000, home_service_eligible: false, is_active: true, display_order: 9 },
  { id: 'svc-10', category_id: 'cat-face', name: 'Pedicure', slug: 'pedicure', description: 'Foot care including soak, scrub, nail care, and polish.', duration_minutes: 45, price_min: 3500, price_max: 7000, home_service_eligible: true, is_active: true, display_order: 10 },
  { id: 'svc-11', category_id: 'cat-face', name: 'Manicure', slug: 'manicure', description: 'Nail shaping, cuticle care, hand massage, and polish.', duration_minutes: 45, price_min: 3000, price_max: 6000, home_service_eligible: true, is_active: true, display_order: 11 },
  { id: 'svc-12', category_id: 'cat-face', name: 'Lash Application & Lash Lift', slug: 'lash-application-lash-lift', description: 'Classic or volume lash extensions, and semi-permanent lash lifts.', duration_minutes: 60, price_min: 4000, price_max: 12000, home_service_eligible: false, is_active: true, display_order: 12 },
  { id: 'svc-13', category_id: 'cat-face', name: 'Eyebrow Shaping & Threading', slug: 'eyebrow-shaping-threading', description: 'Precision brow shaping through threading or waxing.', duration_minutes: 20, price_min: 1500, price_max: 3000, home_service_eligible: true, is_active: true, display_order: 13 },
  { id: 'svc-14', category_id: 'cat-face', name: 'Body Waxing & Hair Removal', slug: 'body-waxing-hair-removal', description: 'Full body or area-specific waxing — legs, arms, underarms, bikini, back.', duration_minutes: 60, price_min: 3000, price_max: 15000, home_service_eligible: false, is_active: true, display_order: 14 },
  { id: 'svc-15', category_id: 'cat-face', name: 'Massage Therapy', slug: 'massage-therapy', description: 'Full body, back, neck and shoulder massage for tension relief and relaxation.', duration_minutes: 60, price_min: 6000, price_max: 18000, home_service_eligible: true, is_active: true, display_order: 15 },
  { id: 'svc-16', category_id: 'cat-face', name: 'Body Scrub & Exfoliation', slug: 'body-scrub-exfoliation', description: 'Full-body exfoliation treatment to renew and soften skin.', duration_minutes: 45, price_min: 5000, price_max: 10000, home_service_eligible: true, is_active: true, display_order: 16 },
  { id: 'svc-17', category_id: 'cat-addons', name: 'Nail Art', slug: 'nail-art', description: 'Custom nail art — from minimal accents to full design sets.', duration_minutes: 30, price_min: 1000, price_max: 5000, home_service_eligible: true, is_active: true, display_order: 17 },
  { id: 'svc-18', category_id: 'cat-addons', name: 'Head Massage', slug: 'head-massage', description: 'Stimulating scalp and head massage for relaxation and circulation.', duration_minutes: 15, price_min: 1500, price_max: 3000, home_service_eligible: true, is_active: true, display_order: 18 },
  { id: 'svc-19', category_id: 'cat-addons', name: 'Steam & Sauna Session', slug: 'steam-sauna-session', description: 'A revitalising steam or sauna session to detoxify and unwind.', duration_minutes: 20, price_min: 2000, price_max: 4000, home_service_eligible: false, is_active: true, display_order: 19 },
];

export const FALLBACK_STAFF: Staff[] = [
  { id: 'st-1', name: 'Adanna Okeke', role: 'Senior Stylist', bio: 'Adanna leads our hair team with over a decade of experience in braiding, colouring, and protective styling.', specialties: 'Braiding, Colouring, Protective Styles', is_active: true, display_order: 1 },
  { id: 'st-2', name: 'Emeka Nwosu', role: 'Barber & Grooming Specialist', bio: 'Emeka specialises in precision cuts, fades, and men’s grooming.', specialties: 'Haircuts, Fades, Beard Grooming', is_active: true, display_order: 2 },
  { id: 'st-3', name: 'Chioma Eze', role: 'Esthetician', bio: 'Chioma brings expertise in facials, waxing, and skincare treatments.', specialties: 'Facials, Waxing, Skincare', is_active: true, display_order: 3 },
  { id: 'st-4', name: 'Tobias Okoro', role: 'Massage Therapist', bio: 'Tobias is a certified therapist focused on deep tissue and relaxation massage.', specialties: 'Massage, Body Treatments', is_active: true, display_order: 4 },
];

export const FALLBACK_BUSINESS_HOURS: BusinessHour[] = [
  { id: 'bh-0', day_of_week: 0, open_time: '12:00', close_time: '18:00', is_closed: false },
  { id: 'bh-1', day_of_week: 1, open_time: '09:00', close_time: '18:00', is_closed: true },
  { id: 'bh-2', day_of_week: 2, open_time: '09:00', close_time: '19:00', is_closed: false },
  { id: 'bh-3', day_of_week: 3, open_time: '09:00', close_time: '19:00', is_closed: false },
  { id: 'bh-4', day_of_week: 4, open_time: '09:00', close_time: '19:00', is_closed: false },
  { id: 'bh-5', day_of_week: 5, open_time: '09:00', close_time: '19:00', is_closed: false },
  { id: 'bh-6', day_of_week: 6, open_time: '09:00', close_time: '19:00', is_closed: false },
];

export const FALLBACK_PRODUCTS: Product[] = [
  { id: 'pr-1', name: 'Permanent Hair Dye — Black', slug: 'hair-dye-black', category: 'Hair Colour', description: 'Long-lasting black hair dye for rich, even coverage.', price: 2500, image_url: null, is_active: true, display_order: 1 },
  { id: 'pr-2', name: 'Professional Hair Clippers', slug: 'professional-hair-clippers', category: 'Tools', description: 'Cordless professional clippers with adjustable blades.', price: 15000, image_url: null, is_active: true, display_order: 2 },
  { id: 'pr-3', name: 'Firm Hold Hair Spray', slug: 'firm-hold-hair-spray', category: 'Styling', description: 'Long-lasting firm hold without flaking or stiffness.', price: 2000, image_url: null, is_active: true, display_order: 3 },
  { id: 'pr-4', name: 'Moisturising Shampoo', slug: 'moisturising-shampoo', category: 'Hair Care', description: 'Sulphate-free moisturising shampoo for daily use.', price: 3000, image_url: null, is_active: true, display_order: 4 },
  { id: 'pr-5', name: 'Deep Conditioner', slug: 'deep-conditioner', category: 'Hair Care', description: 'Intensive conditioning treatment for dry or damaged hair.', price: 3500, image_url: null, is_active: true, display_order: 5 },
  { id: 'pr-6', name: 'Hair Growth Oil Serum', slug: 'hair-growth-oil-serum', category: 'Hair Care', description: 'Nourishing oil blend to support scalp health and growth.', price: 2800, image_url: null, is_active: true, display_order: 6 },
  { id: 'pr-7', name: 'Premium Nail Polish Set', slug: 'premium-nail-polish-set', category: 'Nails', description: 'A curated set of six long-wear nail polish shades.', price: 4000, image_url: null, is_active: true, display_order: 7 },
  { id: 'pr-8', name: 'Glow Facial Kit', slug: 'glow-facial-kit', category: 'Skincare', description: 'At-home facial kit with cleanser, mask, and serum.', price: 6000, image_url: null, is_active: true, display_order: 8 },
];

/** Returns live rows when present, otherwise the curated offline dataset. */
export function withFallback<T>(rows: T[] | null, fallback: T[]): T[] {
  return rows && rows.length > 0 ? rows : fallback;
}
