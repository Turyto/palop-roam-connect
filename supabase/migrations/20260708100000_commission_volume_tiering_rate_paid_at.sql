-- ──────────────────────────────────────────────────────────────────────────────
-- P0.0 (Partner Area Build Plan v2.1) — Volume-based commission tiering.
--
-- The previous trigger tiered the rate on ORDER PRICE (>= €50 → 20%).
-- Correct business rule: VOLUME-based — 15% for a partner's sales 1–49,
-- 20% from sale 50 onwards. Cancelled commissions do not count toward volume.
--
-- Also adds to partner_commissions:
--   * rate    — the commission rate applied to that row (stored per-insert)
--   * paid_at — set by the admin when marking a commission paid (the trigger
--               never touches it). Left NULL on the pre-existing paid row:
--               exact payment date is not recoverable; null is honest.
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.partner_commissions
ADD COLUMN IF NOT EXISTS rate numeric NOT NULL DEFAULT 0.15,
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

CREATE OR REPLACE FUNCTION public.record_partner_commission_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_partner_label TEXT;
  v_completed_sales INTEGER;
  v_rate NUMERIC;
  v_amount NUMERIC;
  v_customer_name TEXT;
  v_customer_email TEXT;
BEGIN
  -- Only act on completed orders that carry a referral code.
  IF NEW.status = 'completed' AND NEW.referral_code IS NOT NULL THEN

    -- The referral code must belong to an ACTIVE PARTNER. Customer codes are
    -- ignored here (they are handled by the referral_rewards trigger).
    SELECT COALESCE(NULLIF(label, ''), code)
      INTO v_partner_label
    FROM public.referral_codes
    WHERE code = NEW.referral_code
      AND type = 'partner'
      AND is_active = true
    LIMIT 1;

    IF v_partner_label IS NOT NULL THEN

      -- Idempotency guard: never create a second commission for the same order.
      IF NOT EXISTS (
        SELECT 1 FROM public.partner_commissions
        WHERE order_id = NEW.id
      ) THEN

        -- VOLUME-based tiered rate: count this partner's existing
        -- non-cancelled commissions BEFORE this insert. 49 or more existing
        -- rows means this is sale #50+ → 20%; otherwise 15%.
        SELECT COUNT(*)
          INTO v_completed_sales
        FROM public.partner_commissions
        WHERE partner_code = NEW.referral_code
          AND status NOT IN ('cancelled');

        v_rate := CASE WHEN v_completed_sales >= 49 THEN 0.20 ELSE 0.15 END;
        v_amount := ROUND(COALESCE(NEW.price, 0) * v_rate, 2);

        -- Best-effort customer name from the buyer's profile; email from the
        -- order (fallback to profile email).
        SELECT full_name, email
          INTO v_customer_name, v_customer_email
        FROM public.profiles
        WHERE id = NEW.user_id
        LIMIT 1;

        INSERT INTO public.partner_commissions (
          partner_name, partner_code, amount, currency,
          order_id, customer_name, customer_email,
          status, commission_date, rate, notes
        )
        VALUES (
          v_partner_label, NEW.referral_code, v_amount, COALESCE(NEW.currency, 'EUR'),
          NEW.id, v_customer_name, COALESCE(NEW.customer_email, v_customer_email),
          'owed', CURRENT_DATE, v_rate,
          'Auto-recorded on order completion (' ||
            (v_rate * 100)::int || '% of €' || COALESCE(NEW.price, 0)::text ||
            ', volume tier: sale #' || (v_completed_sales + 1)::text || ').'
        );

      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill: the existing row was the partner's first sale → 15% tier.
-- paid_at intentionally left NULL (exact payment date not recoverable).
UPDATE public.partner_commissions SET rate = 0.15;
