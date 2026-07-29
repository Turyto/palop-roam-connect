-- Task: connect admin-created plans to the public store page.
-- Adds storefront display fields to plans, a public read policy for active
-- plans, and backfills the fields from the previously hardcoded page content.

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS name_pt text,
  ADD COLUMN IF NOT EXISTS name_en text,
  ADD COLUMN IF NOT EXISTS subtitle_pt text,
  ADD COLUMN IF NOT EXISTS subtitle_en text,
  ADD COLUMN IF NOT EXISTS coverage_label_pt text,
  ADD COLUMN IF NOT EXISTS coverage_label_en text,
  ADD COLUMN IF NOT EXISTS data_gb numeric,
  ADD COLUMN IF NOT EXISTS validity_days integer,
  ADD COLUMN IF NOT EXISTS coverage_tab text,
  ADD COLUMN IF NOT EXISTS country_key text,
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Coverage tab must be one of the storefront tabs (or NULL = not on storefront)
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_coverage_tab_check;
ALTER TABLE public.plans ADD CONSTRAINT plans_coverage_tab_check
  CHECK (coverage_tab IS NULL OR coverage_tab IN ('europe', 'south-africa', 'brazil', 'palop'));

ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_country_key_check;
ALTER TABLE public.plans ADD CONSTRAINT plans_country_key_check
  CHECK (country_key IS NULL OR country_key IN ('mozambique', 'cabo-verde', 'guinea-bissau', 'angola'));

-- The store page is public: allow anyone to read active plans.
DROP POLICY IF EXISTS "Public can view active plans" ON public.plans;
CREATE POLICY "Public can view active plans"
  ON public.plans FOR SELECT
  USING (status = 'active');

-- ---------------------------------------------------------------------------
-- Backfill from the hardcoded storefront content (matched by storefront_slug)
-- ---------------------------------------------------------------------------
WITH content(slug, name_pt, name_en, subtitle_pt, subtitle_en, cov_pt, cov_en, gb, days, tab, country, popular, sort) AS (
  VALUES
  ('arrival',   'Chegada',   'Arrival',   'Ideal para chegada, mensagens e mapas', 'Great for arrival, messages and maps', 'Portugal + Europa', 'Portugal + Europe', 3, 15, 'europe', NULL, false, 0),
  ('essential', 'Essencial', 'Essential', 'Ideal para uso diário e videochamadas', 'Ideal for daily use and video calls',  'Portugal + Europa', 'Portugal + Europe', 5, 30, 'europe', NULL, true,  1),
  ('comfort',   'Conforto',  'Comfort',   'Ideal para estadias mais longas',       'Best for longer stays',                'Portugal + Europa', 'Portugal + Europe', 10, 30, 'europe', NULL, false, 2),
  ('freedom',   'Liberdade', 'Freedom',   'Tranquilidade total',                   'Total peace of mind',                  'Portugal + Europa', 'Portugal + Europe', 20, 30, 'europe', NULL, false, 3),
  ('sa-3gb',  'África do Sul 3 GB',  'South Africa 3 GB',  'Ideal para chegada, mensagens e mapas', 'Great for arrival, messages and maps', 'África do Sul', 'South Africa', 3, 30, 'south-africa', NULL, false, 4),
  ('sa-5gb',  'África do Sul 5 GB',  'South Africa 5 GB',  'Ideal para uso diário e videochamadas', 'Ideal for daily use and video calls',  'África do Sul', 'South Africa', 5, 30, 'south-africa', NULL, true,  5),
  ('sa-10gb', 'África do Sul 10 GB', 'South Africa 10 GB', 'Ideal para estadias mais longas',       'Best for longer stays',                'África do Sul', 'South Africa', 10, 30, 'south-africa', NULL, false, 6),
  ('br-3gb',  'Brasil 3 GB',  'Brazil 3 GB',  'Ideal para chegada, mensagens e mapas', 'Great for arrival, messages and maps', 'Brasil', 'Brazil', 3, 30, 'brazil', NULL, false, 7),
  ('br-5gb',  'Brasil 5 GB',  'Brazil 5 GB',  'Ideal para uso diário e videochamadas', 'Ideal for daily use and video calls',  'Brasil', 'Brazil', 5, 30, 'brazil', NULL, true,  8),
  ('br-10gb', 'Brasil 10 GB', 'Brazil 10 GB', 'Ideal para estadias mais longas',       'Best for longer stays',                'Brasil', 'Brazil', 10, 30, 'brazil', NULL, false, 9),
  ('br-20gb', 'Brasil 20 GB', 'Brazil 20 GB', 'Tranquilidade total',                   'Total peace of mind',                  'Brasil', 'Brazil', 20, 30, 'brazil', NULL, false, 10),
  ('mz-3gb', 'Moçambique 3 GB', 'Mozambique 3 GB', 'Ideal para visitas curtas',       'Great for short visits', 'Moçambique', 'Mozambique', 3, 30, 'palop', 'mozambique', false, 11),
  ('mz-5gb', 'Moçambique 5 GB', 'Mozambique 5 GB', 'Ideal para estadias mais longas', 'Best for longer stays',  'Moçambique', 'Mozambique', 5, 30, 'palop', 'mozambique', false, 12),
  ('cv-3gb', 'Cabo Verde 3 GB', 'Cabo Verde 3 GB', 'Ideal para visitas curtas',       'Great for short visits', 'Cabo Verde', 'Cabo Verde', 3, 30, 'palop', 'cabo-verde', false, 13),
  ('cv-5gb', 'Cabo Verde 5 GB', 'Cabo Verde 5 GB', 'Ideal para estadias mais longas', 'Best for longer stays',  'Cabo Verde', 'Cabo Verde', 5, 30, 'palop', 'cabo-verde', false, 14),
  ('gw-3gb', 'Guiné-Bissau 3 GB', 'Guinea-Bissau 3 GB', 'Ideal para visitas curtas',       'Great for short visits', 'Guiné-Bissau', 'Guinea-Bissau', 3, 15, 'palop', 'guinea-bissau', false, 15),
  ('gw-5gb', 'Guiné-Bissau 5 GB', 'Guinea-Bissau 5 GB', 'Ideal para estadias mais longas', 'Best for longer stays',  'Guiné-Bissau', 'Guinea-Bissau', 5, 30, 'palop', 'guinea-bissau', false, 16),
  ('ao-3gb', 'Angola 3 GB', 'Angola 3 GB', 'Ideal para visitas curtas',       'Great for short visits', 'Angola', 'Angola', 3, 15, 'palop', 'angola', false, 17),
  ('ao-5gb', 'Angola 5 GB', 'Angola 5 GB', 'Ideal para estadias mais longas', 'Best for longer stays',  'Angola', 'Angola', 5, 30, 'palop', 'angola', false, 18)
)
UPDATE public.plans p SET
  name_pt = c.name_pt,
  name_en = c.name_en,
  subtitle_pt = c.subtitle_pt,
  subtitle_en = c.subtitle_en,
  coverage_label_pt = c.cov_pt,
  coverage_label_en = c.cov_en,
  data_gb = c.gb,
  validity_days = c.days,
  coverage_tab = c.tab,
  country_key = c.country,
  is_popular = c.popular,
  sort_order = c.sort
FROM content c
WHERE p.storefront_slug = c.slug;
