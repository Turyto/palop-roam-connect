-- Task: rename the Brazil store tab to Americas and add a hot-deal flag.
-- 1. Allow 'americas' as a coverage_tab value and migrate 'brazil' rows to it.
-- 2. Add is_hot_deal so admins can flag plans for the Hot Deals tab.
-- 3. Put the EUA (USA) plan on the Americas tab, visible but not purchasable
--    (is_available=false) until delivery is confirmed. Card data verified
--    against the live eSIM Access catalog: US 5GB / 30 days.

ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_coverage_tab_check;

UPDATE public.plans SET coverage_tab = 'americas' WHERE coverage_tab = 'brazil';

ALTER TABLE public.plans ADD CONSTRAINT plans_coverage_tab_check
  CHECK (coverage_tab IS NULL OR coverage_tab IN ('europe', 'south-africa', 'americas', 'palop'));

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS is_hot_deal boolean NOT NULL DEFAULT false;

-- EUA (USA) plan: show on Americas tab, not yet purchasable.
UPDATE public.plans SET
  coverage_tab = 'americas',
  name_pt = 'EUA 5 GB',
  name_en = 'USA 5 GB',
  subtitle_pt = 'Ideal para uso diário e videochamadas',
  subtitle_en = 'Ideal for daily use and video calls',
  coverage_label_pt = 'Estados Unidos',
  coverage_label_en = 'United States',
  data_gb = 5,
  validity_days = 30,
  is_available = false,
  sort_order = 999
WHERE id = '06d0a330-7356-4616-8304-fcf59430a84c';
