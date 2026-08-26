/*
Update business hours and add staff profile images.
*/

UPDATE business_hours
SET open_time = CASE WHEN day_of_week = 0 THEN '11:00'::time ELSE '08:00'::time END,
    close_time = CASE WHEN day_of_week = 0 THEN '20:00'::time ELSE '21:00'::time END,
    is_closed = false
WHERE day_of_week BETWEEN 0 AND 6;

ALTER TABLE staff ADD COLUMN IF NOT EXISTS image_url text;

INSERT INTO
    storage.buckets (id, name, public)
VALUES (
        'staff-images',
        'staff-images',
        true
    )
ON CONFLICT (id) DO
UPDATE
SET
    public = true;

DROP POLICY IF EXISTS "public_read_staff_images" ON storage.objects;

CREATE POLICY "public_read_staff_images" ON storage.objects FOR
SELECT TO anon, authenticated USING (bucket_id = 'staff-images');

DROP POLICY IF EXISTS "admin_upload_staff_images" ON storage.objects;

CREATE POLICY "admin_upload_staff_images" ON storage.objects FOR INSERT TO authenticated
WITH
    CHECK (bucket_id = 'staff-images');

DROP POLICY IF EXISTS "admin_update_staff_images" ON storage.objects;

CREATE POLICY "admin_update_staff_images" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'staff-images')
WITH
    CHECK (bucket_id = 'staff-images');

DROP POLICY IF EXISTS "admin_delete_staff_images" ON storage.objects;

CREATE POLICY "admin_delete_staff_images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'staff-images');