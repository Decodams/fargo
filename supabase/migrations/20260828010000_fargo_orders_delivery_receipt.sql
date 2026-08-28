/* 
# Fargo — Product order delivery & receipt upload

Adds delivery method + receipt upload support to product orders.

1. Add `delivery_method` and `receipt_url` columns to product_orders
2. Create a public storage bucket for receipt uploads
3. Ensure the orders RPC accepts the new fields
*/

-- ============================
-- 1. Add columns to product_orders
-- ============================
ALTER TABLE product_orders
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'walk_in'
  CHECK (delivery_method IN ('walk_in', 'delivery'));

ALTER TABLE product_orders
  ADD COLUMN IF NOT EXISTS receipt_url text;

ALTER TABLE product_orders
  ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) NOT NULL DEFAULT 0;

-- ============================
-- 2. Create public storage bucket for receipts
-- ============================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload receipt images to the receipts bucket
DROP POLICY IF EXISTS "public_insert_receipts" ON storage.objects;
CREATE POLICY "public_insert_receipts" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "public_read_receipts" ON storage.objects;
CREATE POLICY "public_read_receipts" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'receipts');

-- ============================
-- 3. Update RPC to accept delivery method + receipt
-- ============================
CREATE OR REPLACE FUNCTION public.create_public_product_order(order_data jsonb, order_items jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order product_orders;
  item jsonb;
  product_row products;
  item_quantity int;
  calculated_total numeric(10,2) := 0;
  delivery_method text;
  receipt_url text;
  delivery_fee numeric(10,2) := 0;
BEGIN
  IF jsonb_array_length(order_items) = 0 THEN
    RAISE EXCEPTION 'Your bag is empty';
  END IF;

  delivery_method := COALESCE(NULLIF(trim(order_data->>'delivery_method'), ''), 'walk_in');
  receipt_url := NULLIF(trim(COALESCE(order_data->>'receipt_url', '')), '');
  IF delivery_method = 'delivery' AND order_data->>'delivery_fee' IS NOT NULL THEN
    delivery_fee := GREATEST(0, (order_data->>'delivery_fee')::numeric);
  END IF;

  INSERT INTO product_orders (reference, customer_name, customer_email, customer_phone, delivery_address, payment_reference, notes, delivery_method, receipt_url, delivery_fee)
  VALUES (
    'FAR-P-' || upper(substr(md5(random()::text), 1, 8)),
    trim(order_data->>'customer_name'), trim(order_data->>'customer_email'), trim(order_data->>'customer_phone'),
    trim(order_data->>'delivery_address'), NULLIF(trim(order_data->>'payment_reference'), ''), NULLIF(trim(order_data->>'notes'), ''),
    delivery_method, receipt_url, delivery_fee
  ) RETURNING * INTO new_order;

  FOR item IN SELECT * FROM jsonb_array_elements(order_items)
  LOOP
    SELECT * INTO product_row FROM products WHERE id = (item->>'product_id')::uuid AND is_active = true;
    item_quantity := greatest(1, (item->>'quantity')::int);
    IF NOT FOUND OR product_row.price IS NULL THEN
      RAISE EXCEPTION 'One of the selected products is no longer available';
    END IF;
    calculated_total := calculated_total + product_row.price * item_quantity;
    INSERT INTO product_order_items (order_id, product_id, product_name, price, quantity)
    VALUES (new_order.id, product_row.id, product_row.name, product_row.price, item_quantity);
  END LOOP;

  UPDATE product_orders SET total_price = calculated_total + delivery_fee WHERE id = new_order.id;
  RETURN new_order.reference;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_public_product_order (jsonb, jsonb) TO anon, authenticated;
