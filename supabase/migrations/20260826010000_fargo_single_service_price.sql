/*
Services use one specific price and must belong to a category.
*/

ALTER TABLE services ADD COLUMN IF NOT EXISTS price numeric(10, 2);

UPDATE services
SET
    price = COALESCE(price_max, price_min, 0)
WHERE
    price IS NULL;

ALTER TABLE services ALTER COLUMN price
SET
    DEFAULT 0,
    ALTER COLUMN price
SET
    NOT NULL;

INSERT INTO
    categories (name, slug)
VALUES ('General', 'general')
ON CONFLICT (slug) DO NOTHING;

UPDATE services
SET
    category_id = (
        SELECT id
        FROM categories
        WHERE
            slug = 'general'
    )
WHERE
    category_id IS NULL;

ALTER TABLE services ALTER COLUMN category_id SET NOT NULL;

ALTER TABLE services
DROP COLUMN IF EXISTS price_min,
DROP COLUMN IF EXISTS price_max;

CREATE OR REPLACE FUNCTION public.create_public_booking(booking_data jsonb, booking_services jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_booking bookings;
  service_row jsonb;
BEGIN
  INSERT INTO bookings (
    staff_id, customer_name, customer_email, customer_phone, service_mode,
    home_address, distance_zone_id, scheduled_at, duration_minutes, total_price,
    travel_fee, discount_amount, party_size, payment_status, confirmation_status,
    status, notes
  ) VALUES (
    NULLIF(booking_data->>'staff_id', '')::uuid,
    booking_data->>'customer_name',
    booking_data->>'customer_email',
    booking_data->>'customer_phone',
    booking_data->>'service_mode',
    NULLIF(booking_data->>'home_address', ''),
    NULLIF(booking_data->>'distance_zone_id', '')::uuid,
    (booking_data->>'scheduled_at')::timestamptz,
    (booking_data->>'duration_minutes')::int,
    (booking_data->>'total_price')::numeric,
    (booking_data->>'travel_fee')::numeric,
    (booking_data->>'discount_amount')::numeric,
    (booking_data->>'party_size')::int,
    booking_data->>'payment_status',
    booking_data->>'confirmation_status',
    booking_data->>'status',
    NULLIF(booking_data->>'notes', '')
  ) RETURNING * INTO new_booking;

  FOR service_row IN SELECT * FROM jsonb_array_elements(booking_services)
  LOOP
    INSERT INTO booking_services (booking_id, service_id, service_name, price, quantity, duration_minutes)
    VALUES (
      new_booking.id,
      NULLIF(service_row->>'service_id', '')::uuid,
      service_row->>'service_name',
      (service_row->>'price')::numeric,
      (service_row->>'quantity')::int,
      (service_row->>'duration_minutes')::int
    );
  END LOOP;

  RETURN new_booking.reference;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_public_booking (jsonb, jsonb) TO anon,
authenticated;