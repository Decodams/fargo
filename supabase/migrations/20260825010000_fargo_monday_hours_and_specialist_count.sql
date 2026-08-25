/*
  Fargo — Fix Monday hours and specialist count

  1. Monday (day_of_week=1) should be open 09:00–19:00 (same as Tue–Sat)
  2. Set stat_2_number = '10' to reflect 10 specialists
*/

-- Open Mondays: same hours as other weekdays
UPDATE business_hours
SET is_closed = false, open_time = '09:00', close_time = '19:00'
WHERE day_of_week = 1;

-- Add specialist count setting (insert or update)
INSERT INTO settings (key, value) VALUES ('stat_2_number', '10')
ON CONFLICT (key) DO UPDATE SET value = '10';
