-- Task #26: Replace South America plans with Brazil plans (eSIM Access)
-- Codes verified against the live eSIM Access catalog on 2026-07-28:
--   PWUJG82CJ Brazil 3GB 30Days  ($3.90 wholesale)
--   CKH333    Brazil 5GB 30Days  ($6.42 wholesale)
--   CKH349    Brazil 10GB 30Days ($11.40 wholesale)
--   CKH860    Brazil 20GB 30Days ($23.75 wholesale)
-- No orders exist for sam-* plan ids (verified 2026-07-28), so their
-- esim_packages mappings are removed outright to make them unsellable.

-- 1. Deactivate the South America rows in the admin plans catalog
UPDATE plans
SET status = 'inactive', updated_at = now()
WHERE 'south-america' = ANY(tags) AND status = 'active';

-- 2. Add Brazil rows to the admin plans catalog (idempotent)
INSERT INTO plans (name, description, tags, coverage, status, retail_price)
SELECT v.name, v.description, v.tags, v.coverage, 'active', v.retail_price
FROM (VALUES
  ('Brasil · 3 GB',  '3 GB / 30 dias',  ARRAY['brazil'], ARRAY['Brazil'],  7.90),
  ('Brasil · 5 GB',  '5 GB / 30 dias',  ARRAY['brazil'], ARRAY['Brazil'], 12.90),
  ('Brasil · 10 GB', '10 GB / 30 dias', ARRAY['brazil'], ARRAY['Brazil'], 22.90),
  ('Brasil · 20 GB', '20 GB / 30 dias', ARRAY['brazil'], ARRAY['Brazil'], 47.90)
) AS v(name, description, tags, coverage, retail_price)
WHERE NOT EXISTS (SELECT 1 FROM plans p WHERE p.name = v.name);

-- 3. Remove the South America checkout mappings (no orders reference them)
DELETE FROM esim_packages WHERE plan_id IN ('sam-3gb', 'sam-5gb', 'sam-10gb');

-- 4. Add the Brazil checkout mappings (idempotent)
INSERT INTO esim_packages
  (plan_id, esim_access_package_id, supplier, supplier_package_id, plan_name, wholesale_cost, wholesale_currency, price_last_synced_at)
SELECT v.plan_id, v.code, 'esim_access', v.code, v.plan_name, v.cost, 'USD', now()
FROM (VALUES
  ('br-3gb',  'PWUJG82CJ', 'Brasil · 3 GB',   3.90),
  ('br-5gb',  'CKH333',    'Brasil · 5 GB',   6.42),
  ('br-10gb', 'CKH349',    'Brasil · 10 GB', 11.40),
  ('br-20gb', 'CKH860',    'Brasil · 20 GB', 23.75)
) AS v(plan_id, code, plan_name, cost)
WHERE NOT EXISTS (SELECT 1 FROM esim_packages e WHERE e.plan_id = v.plan_id);
