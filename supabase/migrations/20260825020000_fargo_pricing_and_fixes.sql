/*
# Fargo — Pricing, Distance Zones & Fixes

This migration adds distance-based travel fee support, pricing features, fixes the
payment_status CHECK constraint, seeds missing frontend settings, adds updated_at
triggers, and creates performance indexes.

## Changes
1. Fix payment_status CHECK constraint to allow 'prepaid' and 'postpaid'
2. Create `distance_zones` table with RLS and default seed data
3. Add columns to `bookings`: distance_zone_id, travel_fee, discount_amount, party_size
4. Add column to `booking_services`: quantity
5. Add column to `services`: per_person
6. Seed multi-service discount and per-person pricing settings
7. Seed all missing frontend settings (from DEFAULT_SETTINGS in utils.ts)
8. Add updated_at auto-update triggers for bookings, services, inquiries
9. Add performance indexes on bookings
*/

-- ============================================
-- 1. Fix payment_status CHECK constraint
-- ============================================
-- Drop the existing named constraint so we can replace it with a wider set of values.
-- We use DO blocks to make this safe even if the constraint name varies.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bookings_payment_status_check'
      AND conrelid = 'bookings'::regclass
  ) THEN
    ALTER TABLE bookings DROP CONSTRAINT bookings_payment_status_check;
  END IF;
END $$;

-- Some databases may use an auto-generated constraint name. Drop any CHECK constraint
-- on the payment_status column as a fallback.
DO $$
DECLARE
  con record;
BEGIN
  FOR con IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid = 'bookings'::regclass
      AND c.contype = 'c'
      AND a.attname = 'payment_status'
  LOOP
    EXECUTE format('ALTER TABLE bookings DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('unpaid', 'paid', 'prepaid', 'postpaid', 'failed', 'refunded'));

-- ============================================
-- 2. Create distance_zones table
-- ============================================
CREATE TABLE IF NOT EXISTS distance_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  min_km numeric NOT NULL DEFAULT 0,
  max_km numeric,
  fee numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE distance_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_distance_zones" ON distance_zones;
CREATE POLICY "public_read_distance_zones" ON distance_zones FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_distance_zones" ON distance_zones;
CREATE POLICY "admin_insert_distance_zones" ON distance_zones FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_distance_zones" ON distance_zones;
CREATE POLICY "admin_update_distance_zones" ON distance_zones FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_distance_zones" ON distance_zones;
CREATE POLICY "admin_delete_distance_zones" ON distance_zones FOR DELETE
  TO authenticated USING (true);

-- Seed default distance zones
INSERT INTO distance_zones (name, min_km, max_km, fee, is_active, display_order) VALUES
  ('Nearby (0-5km)',   0,  5,  0,    true, 1),
  ('Mid-range (5-15km)', 5,  15, 1500, true, 2),
  ('Far (15km+)',      15, NULL, 3000, true, 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. Add columns to bookings
-- ============================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS distance_zone_id uuid REFERENCES distance_zones(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_fee numeric NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS party_size int NOT NULL DEFAULT 1;

-- ============================================
-- 4. Add column to booking_services
-- ============================================
ALTER TABLE booking_services ADD COLUMN IF NOT EXISTS quantity int NOT NULL DEFAULT 1;

-- ============================================
-- 5. Add column to services
-- ============================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS per_person boolean NOT NULL DEFAULT false;

-- ============================================
-- 6. Seed multi-service discount & per-person settings
-- ============================================
INSERT INTO settings (key, value) VALUES
  ('multi_service_enabled', 'false'),
  ('multi_service_min_services', '3'),
  ('multi_service_discount_percent', '10'),
  ('per_person_enabled', 'false'),
  ('per_person_max', '10')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 7. Seed missing frontend settings (from DEFAULT_SETTINGS in utils.ts)
-- ============================================
INSERT INTO settings (key, value) VALUES
  ('hero_title', 'Hair, beauty, and wellness — considered, not rushed.'),
  ('hero_subtitle', 'An appointment should feel like a break, not a transaction. We''re here when you are — in-salon or at home.'),
  ('hero_image_url', ''),
  ('stat_1_number', '20+'),
  ('stat_1_label', 'Services'),
  ('stat_1_sub', ''),
  ('stat_2_sub', ''),
  ('stat_3_number', '2'),
  ('stat_3_label', 'Locations'),
  ('stat_3_sub', 'Salon & Home'),
  ('philosophy_eyebrow', 'Our Philosophy'),
  ('philosophy_title', 'We don''t just style hair. We give people back their time.'),
  ('philosophy_body', 'Fargo is built on a simple idea: a salon visit should feel like a break, not a transaction. Whether you''re here for a quick trim or a full spa day, the pace is yours.\n\nOur team covers the full range — braiding, colouring, cuts, facials, massage, nails, and more. And for days when you can''t come in, we bring the salon to your door.'),
  ('cta_title', 'Ready when you are.'),
  ('cta_subtitle', 'Book in a few steps. No account needed — just pick a time that works.'),
  ('location_strip', 'In-salon and at-home service'),
  ('footer_tagline', 'A unisex hair, beauty, and wellness destination. In-salon and at-home, built around how you live.'),
  ('seo_title', 'Fargo Unisex Salon & Spa — Hair, Beauty & Wellness'),
  ('seo_description', 'Fargo Unisex Salon & Spa offers hair styling, braiding, facials, massage, and at-home services. Book your session in-salon or at home.'),
  ('seo_keywords', 'unisex salon, spa, hair styling, braiding, facial, massage, home service, Nigeria salon'),
  ('seo_og_image', 'https://images.pexels.com/photos/3992862/pexels-photo-3992862.jpeg?auto=compress&cs=tinysrgb&w=1200'),
  ('gallery_items', ''),
  ('faq_sections', '')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 8. updated_at auto-update triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Performance indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at);
