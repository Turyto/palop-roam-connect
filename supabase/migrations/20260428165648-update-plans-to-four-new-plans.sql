-- Update esim_packages to include the 4 new PALOP Connect plans.
-- Uses ON CONFLICT DO UPDATE so existing rows are updated rather than duplicated,
-- and new rows are inserted. No records are deleted.

INSERT INTO public.esim_packages (plan_id, plan_name, esim_access_package_id, package_name, data_amount, validity_days, price, currency)
VALUES
  ('arrival',   'Arrival',   'palop-2gb-7d',   'PALOP 2GB 7 Days',   '2 GB',  7,  3.99, 'EUR'),
  ('essential', 'Essential', 'palop-5gb-30d',  'PALOP 5GB 30 Days',  '5 GB',  30, 9.99, 'EUR'),
  ('comfort',   'Comfort',   'palop-10gb-30d', 'PALOP 10GB 30 Days', '10 GB', 30, 14.99, 'EUR'),
  ('freedom',   'Freedom',   'palop-20gb-30d', 'PALOP 20GB 30 Days', '20 GB', 30, 19.99, 'EUR')
ON CONFLICT (plan_id) DO UPDATE SET
  plan_name             = EXCLUDED.plan_name,
  esim_access_package_id = EXCLUDED.esim_access_package_id,
  package_name          = EXCLUDED.package_name,
  data_amount           = EXCLUDED.data_amount,
  validity_days         = EXCLUDED.validity_days,
  price                 = EXCLUDED.price,
  currency              = EXCLUDED.currency,
  updated_at            = now();

-- Also upsert into plan_inventory if that table exists (created in earlier migration)
INSERT INTO public.plan_inventory (plan_id, plan_name, available, threshold_low, threshold_critical)
VALUES
  ('arrival',   'Arrival',   true, 10, 3),
  ('essential', 'Essential', true, 10, 3),
  ('comfort',   'Comfort',   true, 10, 3),
  ('freedom',   'Freedom',   true, 10, 3)
ON CONFLICT (plan_id) DO UPDATE SET
  plan_name = EXCLUDED.plan_name,
  available = EXCLUDED.available;
