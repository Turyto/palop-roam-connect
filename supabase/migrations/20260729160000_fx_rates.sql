-- Store the USD->EUR conversion rate fetched daily, replacing the hard-coded frontend constant.
CREATE TABLE IF NOT EXISTS public.fx_rates (
  pair TEXT PRIMARY KEY,
  rate NUMERIC(12,6) NOT NULL CHECK (rate > 0),
  source TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

-- Anyone signed in may read the rate (admin dashboard); only service role writes.
DROP POLICY IF EXISTS "fx_rates_read" ON public.fx_rates;
CREATE POLICY "fx_rates_read" ON public.fx_rates FOR SELECT TO authenticated USING (true);

-- Seed with the previous hard-coded rate so there is always a fallback row.
INSERT INTO public.fx_rates (pair, rate, source, fetched_at)
VALUES ('USD_EUR', 0.92, 'seed (legacy hard-coded rate)', '2026-01-01T00:00:00Z')
ON CONFLICT (pair) DO NOTHING;
