/*
Add a separate home-service price per service, distinct from the walk-in price.
If set (non-null) and a service is home-service eligible, home bookings use this
price instead of the standard walk-in price.
*/

ALTER TABLE services ADD COLUMN IF NOT EXISTS home_service_price numeric(10, 2);
