-- Seed the four Europa checkout plan package codes from eSIM Access supplier.
-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/btallyhejhqfpqwaboee/sql
INSERT INTO esim_packages (plan_id, plan_name, esim_access_package_id, updated_at)
VALUES
  ('arrival',   'Europa · Chegada',   'PRC8B6GK2', NOW()),
  ('essential', 'Europa · Essencial', 'PV0Q6PZ7G', NOW()),
  ('comfort',   'Europa · Conforto',  'P29FDU5TL', NOW()),
  ('freedom',   'Europa · Liberdade', 'P6PBYX5G4', NOW())
ON CONFLICT (plan_id) DO UPDATE SET
  esim_access_package_id = EXCLUDED.esim_access_package_id,
  plan_name               = EXCLUDED.plan_name,
  updated_at              = NOW();
