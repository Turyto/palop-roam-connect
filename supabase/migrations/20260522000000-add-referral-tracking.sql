-- Add referral_code column to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Index for lookups by referral code
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders (referral_code)
  WHERE referral_code IS NOT NULL;

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: when a completed order with a referral_code is inserted,
-- increment the referrer's uses_count and create a pending reward.
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.attribute_referral_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  IF NEW.status = 'completed' AND NEW.referral_code IS NOT NULL THEN

    SELECT user_id INTO v_referrer_id
    FROM public.referral_codes
    WHERE code = NEW.referral_code
      AND is_active = true
    LIMIT 1;

    -- Only reward if referrer exists and is not buying their own referral
    IF v_referrer_id IS NOT NULL AND v_referrer_id IS DISTINCT FROM NEW.user_id THEN

      UPDATE public.referral_codes
        SET uses_count = uses_count + 1,
            updated_at = now()
      WHERE code = NEW.referral_code;

      INSERT INTO public.referral_rewards (
        referrer_id, referee_id, referral_code,
        reward_type, reward_amount, status
      )
      VALUES (
        v_referrer_id, NEW.user_id, NEW.referral_code,
        'credit', 2.00, 'pending'
      )
      ON CONFLICT DO NOTHING;

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_attribute_referral ON public.orders;
CREATE TRIGGER trg_attribute_referral
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.attribute_referral_on_order();
