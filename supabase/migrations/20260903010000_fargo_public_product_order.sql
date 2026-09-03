/*
Allow customers to look up the confirmation status and receipt data
for their product order by reference (used after checkout to show a
downloadable receipt once the admin confirms payment).
Returns only the fields needed to render the receipt for that reference.
*/

CREATE OR REPLACE FUNCTION public.get_public_product_order(order_reference text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    jsonb_build_object(
      'reference', po.reference,
      'status', po.status,
      'payment_status', po.payment_status,
      'total_price', po.total_price,
      'delivery_method', po.delivery_method,
      'delivery_fee', po.delivery_fee,
      'created_at', po.created_at,
      'customer_name', po.customer_name,
      'items', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'product_name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
          )
          ORDER BY oi.id
        )
        FROM product_order_items oi
        WHERE oi.order_id = po.id
      ), '[]'::jsonb)
    )
  FROM product_orders po
  WHERE po.reference = order_reference
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_product_order (text) TO anon,
authenticated;