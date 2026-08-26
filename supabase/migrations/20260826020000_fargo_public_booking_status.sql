/*
Allow customers to check only the confirmation status for their booking.
*/

CREATE OR REPLACE FUNCTION public.get_public_booking_status(booking_reference text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT confirmation_status
  FROM bookings
  WHERE reference = booking_reference
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_booking_status (text) TO anon,
authenticated;