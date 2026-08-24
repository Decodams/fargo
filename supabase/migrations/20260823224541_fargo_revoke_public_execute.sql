/*
# Revoke PUBLIC execute on upsert_customer_from_booking

The SECURITY DEFINER function upsert_customer_from_booking() is only meant to be
called by the AFTER INSERT trigger on bookings. Revoke from PUBLIC to prevent
any role from calling it via the REST API.
*/

REVOKE EXECUTE ON FUNCTION upsert_customer_from_booking() FROM PUBLIC;
