-- Backfill eSIM Card country codes so the live-price fetch can query
-- the supplier's per-country package list.
UPDATE public.esim_packages SET location_code = 'CV'
WHERE supplier = 'esimcard' AND supplier_package_id IN
  ('c918bbc0-8651-4946-8b7c-694ec3aae6b4','0f3a6aff-e924-4df1-b011-9806fea0b815');
UPDATE public.esim_packages SET location_code = 'MZ'
WHERE supplier = 'esimcard' AND supplier_package_id IN
  ('b01da492-b744-4fcc-9867-4e24c4cd7573','e59fe17e-37c0-488c-909d-ca113ea8c752');
