/*
# Fargo — Seed Data

Populates the database with initial categories, services, products, business hours,
staff, and default settings so the platform is usable immediately.

1. Categories: Hair, Face & Body, Add-ons
2. Services: full menu from the brief (15+ services)
3. Products: 10 retail products
4. Business hours: Tue–Sat 9–7, Sun 12–6, Mon closed
5. Settings: business name, contact, home service area, notification email
6. Staff: 4 sample stylists
*/

-- CATEGORIES
INSERT INTO categories (name, slug, display_order) VALUES
  ('Hair', 'hair', 1),
  ('Face & Body', 'face-and-body', 2),
  ('Add-ons', 'add-ons', 3)
ON CONFLICT (slug) DO NOTHING;

-- SERVICES
INSERT INTO services (category_id, name, slug, description, duration_minutes, price_min, price_max, home_service_eligible, display_order) VALUES
  ((SELECT id FROM categories WHERE slug='hair'), 'Hair Styling & Blow-dry', 'hair-styling-blow-dry', 'A finish tailored to your hair type — volume, curl definition, or sleek straight results.', 45, 3000, 6000, true, 1),
  ((SELECT id FROM categories WHERE slug='hair'), 'Braiding', 'braiding', 'All braiding styles — box braids, cornrows, knotless, feed-in, and more.', 240, 5000, 20000, true, 2),
  ((SELECT id FROM categories WHERE slug='hair'), 'Dreadlocks', 'dreadlocks', 'Installation, retouch, and maintenance for locs of all lengths.', 180, 4000, 15000, true, 3),
  ((SELECT id FROM categories WHERE slug='hair'), 'Hair Colouring', 'hair-colouring', 'Full colour, highlights, balayage, or root touch-ups using quality dyes.', 120, 5000, 18000, false, 4),
  ((SELECT id FROM categories WHERE slug='hair'), 'Trimming & Haircuts', 'trimming-haircuts', 'Precision cuts for all hair textures — from fades to layered styles.', 30, 2000, 5000, true, 5),
  ((SELECT id FROM categories WHERE slug='hair'), 'Relaxing & Texturising', 'relaxing-texturising', 'Chemical relaxing or texturising for smooth, manageable hair.', 90, 4000, 8000, false, 6),
  ((SELECT id FROM categories WHERE slug='hair'), 'Deep Conditioning Treatment', 'deep-conditioning-treatment', 'Intensive moisture and protein treatment to restore hair health.', 30, 2500, 5000, true, 7),
  ((SELECT id FROM categories WHERE slug='hair'), 'Scalp Treatment', 'scalp-treatment', 'Cleansing and revitalising scalp therapy for dandruff, dryness, or hair growth.', 30, 3000, 6000, true, 8),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Facials', 'facials', 'Deep-cleansing, brightening, or hydrating facials tailored to your skin.', 60, 5000, 12000, false, 9),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Pedicure', 'pedicure', 'Foot care including soak, scrub, nail care, and polish.', 45, 3500, 7000, true, 10),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Manicure', 'manicure', 'Nail shaping, cuticle care, hand massage, and polish.', 45, 3000, 6000, true, 11),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Lash Application & Lash Lift', 'lash-application-lash-lift', 'Classic or volume lash extensions, and semi-permanent lash lifts.', 60, 4000, 12000, false, 12),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Eyebrow Shaping & Threading', 'eyebrow-shaping-threading', 'Precision brow shaping through threading or waxing.', 20, 1500, 3000, true, 13),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Body Waxing & Hair Removal', 'body-waxing-hair-removal', 'Full body or area-specific waxing — legs, arms, underarms, bikini, back.', 60, 3000, 15000, false, 14),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Massage Therapy', 'massage-therapy', 'Full body, back, neck and shoulder massage for tension relief and relaxation.', 60, 6000, 18000, true, 15),
  ((SELECT id FROM categories WHERE slug='face-and-body'), 'Body Scrub & Exfoliation', 'body-scrub-exfoliation', 'Full-body exfoliation treatment to renew and soften skin.', 45, 5000, 10000, true, 16),
  ((SELECT id FROM categories WHERE slug='add-ons'), 'Nail Art', 'nail-art', 'Custom nail art — from minimal accents to full design sets.', 30, 1000, 5000, true, 17),
  ((SELECT id FROM categories WHERE slug='add-ons'), 'Head Massage', 'head-massage', 'Stimulating scalp and head massage for relaxation and circulation.', 15, 1500, 3000, true, 18),
  ((SELECT id FROM categories WHERE slug='add-ons'), 'Steam & Sauna Session', 'steam-sauna-session', 'A revitalising steam or sauna session to detoxify and unwind.', 20, 2000, 4000, false, 19)
ON CONFLICT (slug) DO NOTHING;

-- STAFF
INSERT INTO staff (name, role, bio, specialties, display_order) VALUES
  ('Adanna Okeke', 'Senior Stylist', 'Adanna leads our hair team with over a decade of experience in braiding, colouring, and protective styling.', 'Braiding, Colouring, Protective Styles', 1),
  ('Emeka Nwosu', 'Barber & Grooming Specialist', 'Emeka specialises in precision cuts, fades, and men''s grooming.', 'Haircuts, Fades, Beard Grooming', 2),
  ('Chioma Eze', 'Esthetician', 'Chioma brings expertise in facials, waxing, and skincare treatments.', 'Facials, Waxing, Skincare', 3),
  ('Tobias Okoro', 'Massage Therapist', 'Tobias is a certified therapist focused on deep tissue and relaxation massage.', 'Massage, Body Treatments', 4)
ON CONFLICT DO NOTHING;

-- Link staff to services
INSERT INTO staff_services (staff_id, service_id)
  SELECT s.id, sv.id FROM staff s, services sv
  WHERE (s.name = 'Adanna Okeke' AND sv.slug IN ('hair-styling-blow-dry','braiding','dreadlocks','hair-colouring','deep-conditioning-treatment','scalp-treatment'))
     OR (s.name = 'Emeka Nwosu' AND sv.slug IN ('trimming-haircuts','relaxing-texturising','hair-styling-blow-dry'))
     OR (s.name = 'Chioma Eze' AND sv.slug IN ('facials','pedicure','manicure','lash-application-lash-lift','eyebrow-shaping-threading','body-waxing-hair-removal','body-scrub-exfoliation','nail-art'))
     OR (s.name = 'Tobias Okoro' AND sv.slug IN ('massage-therapy','body-scrub-exfoliation','head-massage','steam-sauna-session'))
ON CONFLICT DO NOTHING;

-- BUSINESS HOURS (0=Sunday, 1=Monday, ... 6=Saturday)
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
  (0, '12:00', '18:00', false),
  (1, '09:00', '18:00', true),
  (2, '09:00', '19:00', false),
  (3, '09:00', '19:00', false),
  (4, '09:00', '19:00', false),
  (5, '09:00', '19:00', false),
  (6, '09:00', '19:00', false)
ON CONFLICT (day_of_week) DO NOTHING;

-- SETTINGS
INSERT INTO settings (key, value) VALUES
  ('business_name', 'Fargo Unisex Salon & Spa'),
  ('notification_email', 'hello@fargosalon.com'),
  ('site_url', 'https://fargosalon.com'),
  ('contact_phone', '+234 800 000 0000'),
  ('contact_email', 'hello@fargosalon.com'),
  ('address', 'Southeast Nigeria'),
  ('home_service_area', 'Within 15km of our salon location'),
  ('home_service_fee', '2000'),
  ('instagram_url', 'https://instagram.com'),
  ('facebook_url', 'https://facebook.com'),
  ('buffer_time_minutes', '15'),
  ('currency_symbol', '₦')
ON CONFLICT (key) DO NOTHING;

-- PRODUCTS
INSERT INTO products (name, slug, category, description, price, display_order) VALUES
  ('Permanent Hair Dye — Black', 'hair-dye-black', 'Hair Colour', 'Long-lasting black hair dye for rich, even coverage.', 2500, 1),
  ('Professional Hair Clippers', 'professional-hair-clippers', 'Tools', 'Cordless professional clippers with adjustable blades.', 15000, 2),
  (' Firm Hold Hair Spray', 'firm-hold-hair-spray', 'Styling', 'Long-lasting firm hold without flaking or stiffness.', 2000, 3),
  ('Styling Comb Set', 'styling-comb-set', 'Tools', 'A set of premium styling combs for all hair types.', 1500, 4),
  ('Edge Control Gel', 'edge-control-gel', 'Styling', 'Sleek edge control with 24-hour hold and no flaking.', 1800, 5),
  ('Moisturising Shampoo', 'moisturising-shampoo', 'Hair Care', 'Sulphate-free moisturising shampoo for daily use.', 3000, 6),
  ('Deep Conditioner', 'deep-conditioner', 'Hair Care', 'Intensive conditioning treatment for dry or damaged hair.', 3500, 7),
  ('Hair Growth Oil Serum', 'hair-growth-oil-serum', 'Hair Care', 'Nourishing oil blend to support scalp health and growth.', 2800, 8),
  ('Wig & Extension Care Kit', 'wig-extension-care-kit', 'Hair Care', 'Everything you need to maintain wigs and extensions.', 5000, 9),
  ('Premium Nail Polish Set', 'premium-nail-polish-set', 'Nails', 'A curated set of six long-wear nail polish shades.', 4000, 10),
  ('Glow Facial Kit', 'glow-facial-kit', 'Skincare', 'At-home facial kit with cleanser, mask, and serum.', 6000, 11)
ON CONFLICT (slug) DO NOTHING;
