/*
# Fargo Unisex Salon & Spa — Initial Schema

## Overview
Creates the complete database schema for the Fargo salon platform: service categories,
services, staff, business hours, bookings, booking services, products, inquiries,
customers, and a flexible settings table.

## New Tables
1. **categories** — service categories (Hair, Face & Body, Add-ons)
2. **services** — individual services with duration, price, category, home-service flag
3. **staff** — stylists/professionals with name, role, bio
4. **staff_services** — many-to-many linking staff to services they perform
5. **business_hours** — weekly operating hours per day
6. **settings** — key-value business configuration
7. **bookings** — customer reservations with mode (in-salon/home), datetime, status
8. **booking_services** — many-to-many linking bookings to selected services
9. **products** — retail products for inquiry-based sales
10. **inquiries** — general and product inquiries from customers
11. **customers** — basic CRM records derived from bookings

## Security (RLS)
- Public tables (categories, services, staff, staff_services, business_hours, products, settings):
  SELECT open to anon + authenticated; write operations restricted to authenticated (admin).
- Bookings: INSERT open to public (anon can create bookings); SELECT/UPDATE/DELETE restricted
  to authenticated (admin manages bookings). The public only creates, doesn't read.
- Booking services: INSERT open to public; SELECT/UPDATE/DELETE restricted to authenticated.
- Inquiries: INSERT open to public; SELECT/UPDATE/DELETE restricted to authenticated.
- Customers: all operations restricted to authenticated.

## Conflict Prevention
- A trigger function `prevent_booking_conflict()` prevents overlapping bookings for the same
  staff member when status is not cancelled.
- A trigger `update_customer_from_booking()` upserts customer records when bookings are created.
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- SERVICES
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  duration_minutes int NOT NULL DEFAULT 60,
  price_min numeric(10,2) NOT NULL DEFAULT 0,
  price_max numeric(10,2) NOT NULL DEFAULT 0,
  home_service_eligible boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- STAFF
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  specialties text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_staff" ON staff;
CREATE POLICY "public_read_staff" ON staff FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_staff" ON staff;
CREATE POLICY "admin_insert_staff" ON staff FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_staff" ON staff;
CREATE POLICY "admin_update_staff" ON staff FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_staff" ON staff;
CREATE POLICY "admin_delete_staff" ON staff FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- STAFF_SERVICES (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS staff_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(staff_id, service_id)
);
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_staff_services" ON staff_services;
CREATE POLICY "public_read_staff_services" ON staff_services FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_staff_services" ON staff_services;
CREATE POLICY "admin_insert_staff_services" ON staff_services FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_staff_services" ON staff_services;
CREATE POLICY "admin_update_staff_services" ON staff_services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_staff_services" ON staff_services;
CREATE POLICY "admin_delete_staff_services" ON staff_services FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- BUSINESS HOURS
-- ============================================
CREATE TABLE IF NOT EXISTS business_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week int NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time time NOT NULL DEFAULT '09:00',
  close_time time NOT NULL DEFAULT '18:00',
  is_closed boolean NOT NULL DEFAULT false,
  UNIQUE(day_of_week)
);
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_business_hours" ON business_hours;
CREATE POLICY "public_read_business_hours" ON business_hours FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_business_hours" ON business_hours;
CREATE POLICY "admin_insert_business_hours" ON business_hours FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_business_hours" ON business_hours;
CREATE POLICY "admin_update_business_hours" ON business_hours FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_business_hours" ON business_hours;
CREATE POLICY "admin_delete_business_hours" ON business_hours FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- SETTINGS (key-value)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_settings" ON settings;
CREATE POLICY "public_read_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_settings" ON settings;
CREATE POLICY "admin_insert_settings" ON settings FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_settings" ON settings;
CREATE POLICY "admin_update_settings" ON settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_settings" ON settings;
CREATE POLICY "admin_delete_settings" ON settings FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- CUSTOMERS (CRM)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  notes text,
  total_bookings int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_customers" ON customers;
CREATE POLICY "admin_read_customers" ON customers FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_customers" ON customers;
CREATE POLICY "admin_insert_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_customers" ON customers;
CREATE POLICY "admin_update_customers" ON customers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_customers" ON customers;
CREATE POLICY "admin_delete_customers" ON customers FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  staff_id uuid REFERENCES staff(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  service_mode text NOT NULL DEFAULT 'in_salon' CHECK (service_mode IN ('in_salon', 'home')),
  home_address text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes int NOT NULL DEFAULT 60,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
  payment_reference text,
  payment_amount numeric(10,2),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can create bookings (no sign-in required)
DROP POLICY IF EXISTS "public_create_bookings" ON bookings;
CREATE POLICY "public_create_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
-- Only admin can read/update/delete bookings
DROP POLICY IF EXISTS "admin_read_bookings" ON bookings;
CREATE POLICY "admin_read_bookings" ON bookings FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_bookings" ON bookings;
CREATE POLICY "admin_update_bookings" ON bookings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_bookings" ON bookings;
CREATE POLICY "admin_delete_bookings" ON bookings FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference);

-- ============================================
-- BOOKING_SERVICES (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS booking_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  service_name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_minutes int NOT NULL DEFAULT 60
);
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_create_booking_services" ON booking_services;
CREATE POLICY "public_create_booking_services" ON booking_services FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_booking_services" ON booking_services;
CREATE POLICY "admin_read_booking_services" ON booking_services FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_booking_services" ON booking_services;
CREATE POLICY "admin_update_booking_services" ON booking_services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_booking_services" ON booking_services;
CREATE POLICY "admin_delete_booking_services" ON booking_services FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_booking_services_booking ON booking_services(booking_id);

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text,
  description text,
  price numeric(10,2),
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- INQUIRIES
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'product', 'service')),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'responded', 'closed')),
  response_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_create_inquiries" ON inquiries;
CREATE POLICY "public_create_inquiries" ON inquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_read_inquiries" ON inquiries;
CREATE POLICY "admin_read_inquiries" ON inquiries FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_update_inquiries" ON inquiries;
CREATE POLICY "admin_update_inquiries" ON inquiries FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_inquiries" ON inquiries;
CREATE POLICY "admin_delete_inquiries" ON inquiries FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_type ON inquiries(type);

-- ============================================
-- TRIGGER: Booking conflict prevention
-- ============================================
CREATE OR REPLACE FUNCTION prevent_booking_conflict()
RETURNS trigger AS $$
BEGIN
  IF NEW.status NOT IN ('cancelled') AND NEW.staff_id IS NOT NULL THEN
    PERFORM 1 FROM bookings
    WHERE staff_id = NEW.staff_id
      AND id != NEW.id
      AND status NOT IN ('cancelled')
      AND tstzrange(NEW.scheduled_at, NEW.scheduled_at + make_interval(mins => NEW.duration_minutes))
      && tstzrange(scheduled_at, scheduled_at + make_interval(mins => duration_minutes));
    IF FOUND THEN
      RAISE EXCEPTION 'Booking time conflict: this staff member already has an appointment at that time';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_booking_conflict ON bookings;
CREATE TRIGGER trg_prevent_booking_conflict
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION prevent_booking_conflict();

-- ============================================
-- TRIGGER: Auto-generate booking reference
-- ============================================
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'FAR-' || UPPER(SUBSTRING(MD5(RANDOM()::text || NEW.created_at::text || NEW.customer_email) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_reference ON bookings;
CREATE TRIGGER trg_generate_reference
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- ============================================
-- TRIGGER: Upsert customer from booking
-- ============================================
CREATE OR REPLACE FUNCTION upsert_customer_from_booking()
RETURNS trigger AS $$
BEGIN
  INSERT INTO customers (name, email, phone, total_bookings)
  VALUES (NEW.customer_name, NEW.customer_email, NEW.customer_phone, 1)
  ON CONFLICT DO NOTHING;

  -- If conflict (email exists), increment booking count
  UPDATE customers SET
    total_bookings = total_bookings + 1,
    phone = COALESCE(NEW.customer_phone, customers.phone),
    updated_at = now()
  WHERE email = NEW.customer_email OR (email IS NULL AND phone = NEW.customer_phone);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_upsert_customer ON bookings;
CREATE TRIGGER trg_upsert_customer
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION upsert_customer_from_booking();

-- Grant needed permissions for the SECURITY DEFINER function
GRANT INSERT, UPDATE ON customers TO anon, authenticated;
