-- Retail product checkout and admin order capture.
CREATE TABLE IF NOT EXISTS product_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    reference text NOT NULL UNIQUE,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    delivery_address text NOT NULL,
    total_price numeric(10, 2) NOT NULL DEFAULT 0,
    payment_status text NOT NULL DEFAULT 'pending' CHECK (
        payment_status IN (
            'pending',
            'paid',
            'failed',
            'refunded'
        )
    ),
    status text NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'confirmed',
            'fulfilled',
            'cancelled'
        )
    ),
    payment_reference text,
    notes text,
    created_at timestamptz DEFAULT now (),
    updated_at timestamptz DEFAULT now ()
);

CREATE TABLE IF NOT EXISTS product_order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    order_id uuid NOT NULL REFERENCES product_orders (id) ON DELETE CASCADE,
    product_id uuid REFERENCES products (id) ON DELETE SET NULL,
    product_name text NOT NULL,
    price numeric(10, 2) NOT NULL DEFAULT 0,
    quantity int NOT NULL CHECK (quantity > 0)
);

ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;

ALTER TABLE product_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_product_orders" ON product_orders;

CREATE POLICY "admin_read_product_orders" ON product_orders FOR
SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_product_orders" ON product_orders;

CREATE POLICY "admin_update_product_orders" ON product_orders FOR
UPDATE TO authenticated USING (true)
WITH
    CHECK (true);

DROP POLICY IF EXISTS "admin_read_product_order_items" ON product_order_items;

CREATE POLICY "admin_read_product_order_items" ON product_order_items FOR
SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders (status);

CREATE INDEX IF NOT EXISTS idx_product_orders_created ON product_orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_order_items_order ON product_order_items (order_id);

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
BEGIN
  IF jsonb_array_length(order_items) = 0 THEN
    RAISE EXCEPTION 'Your bag is empty';
  END IF;

  INSERT INTO product_orders (reference, customer_name, customer_email, customer_phone, delivery_address, payment_reference, notes)
  VALUES (
    'FAR-P-' || upper(substr(md5(random()::text), 1, 8)),
    trim(order_data->>'customer_name'), trim(order_data->>'customer_email'), trim(order_data->>'customer_phone'),
    trim(order_data->>'delivery_address'), NULLIF(trim(order_data->>'payment_reference'), ''), NULLIF(trim(order_data->>'notes'), '')
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

  UPDATE product_orders SET total_price = calculated_total WHERE id = new_order.id;
  RETURN new_order.reference;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_public_product_order (jsonb, jsonb) TO anon,
authenticated;