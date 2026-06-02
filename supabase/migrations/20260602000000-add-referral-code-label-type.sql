-- Add label (partner display name) and type (customer | partner) to referral_codes
ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS label TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'customer';

-- Index for fast partner-only lookups
CREATE INDEX IF NOT EXISTS idx_referral_codes_type
  ON public.referral_codes (type)
  WHERE type = 'partner';

-- Back-fill PRAIATUR as partner if it already exists
UPDATE public.referral_codes
  SET type = 'partner', label = 'Praiatur'
  WHERE code = 'PRAIATUR';
