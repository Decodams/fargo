/*
# Security fixes — function search_path and SECURITY DEFINER exposure

1. Set explicit search_path on all trigger functions to prevent search_path injection.
2. Revoke EXECUTE on the SECURITY DEFINER upsert function from anon and authenticated
   so it can only be called by the trigger (which runs with owner privileges), not via
   the REST API.
*/

-- Fix search_path on trigger functions
ALTER FUNCTION prevent_booking_conflict() SET search_path = public, pg_temp;
ALTER FUNCTION generate_booking_reference() SET search_path = public, pg_temp;
ALTER FUNCTION upsert_customer_from_booking() SET search_path = public, pg_temp;

-- Revoke direct execution of the SECURITY DEFINER function from anon and authenticated
-- It's only used by the AFTER INSERT trigger, which runs with the table owner's privileges
REVOKE EXECUTE ON FUNCTION upsert_customer_from_booking() FROM anon, authenticated;
