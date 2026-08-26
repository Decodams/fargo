/*
Product categories and device-uploaded product images.
*/

ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories (id) ON DELETE SET NULL;

UPDATE products
SET
    category_id = categories.id
FROM categories
WHERE
    products.category_id IS NULL
    AND products.category IS NOT NULL
    AND lower(products.category) = lower(categories.name);

INSERT INTO
    storage.buckets (id, name, public)
VALUES (
        'product-images',
        'product-images',
        true
    )
ON CONFLICT (id) DO
UPDATE
SET
    public = true;

DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;

CREATE POLICY "public_read_product_images" ON storage.objects FOR
SELECT TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;

CREATE POLICY "admin_upload_product_images" ON storage.objects FOR INSERT TO authenticated
WITH
    CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;

CREATE POLICY "admin_update_product_images" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'product-images')
WITH
    CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;

CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

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