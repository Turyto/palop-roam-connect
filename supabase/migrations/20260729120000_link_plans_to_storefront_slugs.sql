-- Task: unify package code display in Supplier Rates.
-- Context: checkout/delivery resolves esim_packages by the storefront content
-- slug ('br-20gb', 'arrival', ...), while the admin catalog uses plans.id
-- UUIDs. The Supplier Rates tab previously displayed the never-populated
-- supplier_rates.supplier_plan_id, showing "Not specified" everywhere.
--
-- Fix:
-- 1) Link each catalog plan to its storefront slug (plans.storefront_slug).
-- 2) Mirror slug-keyed esim_packages rows onto UUID keys so the admin UI and
--    fetch-supplier-rates (which join on the UUID) see the real delivery code.
-- 3) The plan editor now writes both rows (UUID + slug) so they cannot drift.

ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS storefront_slug TEXT UNIQUE;

UPDATE public.plans SET storefront_slug = v.slug
FROM (VALUES
  ('0a1a2051-b73f-42c2-9cf5-645e47b5a12a', 'arrival'),
  ('c3dcf6cc-8ca6-4d91-ba7f-4de623d57846', 'essential'),
  ('7c66d082-d2f5-4272-99e9-19f3696dca6f', 'comfort'),
  ('f0228a5e-9aea-4b18-91da-93356f4ad7d5', 'freedom'),
  ('890af287-75e0-40f9-bd05-1792721ff4f5', 'sa-3gb'),
  ('7a3fcc8c-2b2e-4b62-819d-ed7539f22651', 'sa-5gb'),
  ('fd8f447e-0ac3-40a9-b071-89a4534a9c1b', 'sa-10gb'),
  ('cdfaa857-c403-4f6e-8fe3-b07e08e3e0b7', 'br-3gb'),
  ('6c2d8570-69b6-4a3e-b23b-b1abe1eb48ed', 'br-5gb'),
  ('604f9989-4afd-4f13-943d-25265e855238', 'br-10gb'),
  ('91981d43-46e9-4105-9c00-d725e11688d0', 'br-20gb'),
  ('69466b4f-694f-4b41-92f9-dba358d01394', 'mz-3gb'),
  ('8648cdfa-3929-45c5-a7fb-08c45d7426a6', 'mz-5gb'),
  ('64718467-0292-4904-8674-38f47e4fe549', 'cv-3gb'),
  ('e6a52f8e-39bd-45bf-b69e-1c8e27058083', 'cv-5gb'),
  ('8e5c344c-3211-4919-9eab-838f42b94632', 'gw-3gb'),
  ('02c13b39-d0cd-4bff-850d-dbe2ec913986', 'gw-5gb'),
  ('7f9d8098-f85b-424e-b382-dd59e195bd81', 'ao-3gb'),
  ('34ac4c1a-af2a-4688-9322-6a2172e50979', 'ao-5gb')
) AS v(plan_uuid, slug)
WHERE public.plans.id::text = v.plan_uuid;

-- Mirror slug-keyed mappings onto the plan UUID key where missing.
INSERT INTO public.esim_packages
  (plan_id, plan_name, esim_access_package_id, supplier, supplier_package_id,
   wholesale_cost, wholesale_currency, location_code)
SELECT p.id::text, p.name, ep.esim_access_package_id, ep.supplier,
       ep.supplier_package_id, ep.wholesale_cost, ep.wholesale_currency,
       ep.location_code
FROM public.plans p
JOIN public.esim_packages ep ON ep.plan_id = p.storefront_slug
WHERE p.storefront_slug IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.esim_packages e2 WHERE e2.plan_id = p.id::text
  );

-- EUA Essencial: its code only lived in the stale supplier_rates column.
-- Copy it into the real mapping table (plan has no storefront slug yet, so it
-- is not sellable; Fetch Live Prices will validate the code visibly).
INSERT INTO public.esim_packages (plan_id, plan_name, esim_access_package_id, supplier)
SELECT '06d0a330-7356-4616-8304-fcf59430a84c', 'EUA Essencial - 5 GB', 'PKJNMJIIU', 'esim_access'
WHERE NOT EXISTS (
  SELECT 1 FROM public.esim_packages WHERE plan_id = '06d0a330-7356-4616-8304-fcf59430a84c'
);
