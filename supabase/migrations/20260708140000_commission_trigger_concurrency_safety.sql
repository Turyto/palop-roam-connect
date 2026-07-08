-- ──────────────────────────────────────────────────────────────────────────────
-- Follow-up to 20260708100000 (code review): make the commission trigger
-- concurrency-safe.
--
-- 1. True idempotency: unique index on partner_commissions(order_id)
--    (partial — manual rows may have NULL order_id) + INSERT ... ON CONFLICT
--    DO NOTHING, instead of a racy IF NOT EXISTS check.
-- 2. Race-safe volume tier at the 49→50 boundary: a per-partner-code
--    transaction advisory lock serializes count+insert, so two orders
--    completing concurrently can't both read the same pre-insert count.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX IF NOT EXISTS partner_commissions_order_id_uniq
ON public.partner_commissions (order_id)
WHERE order_id IS NOT NULL;

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

      -- Serialize count+insert per partner code so concurrent completions
      -- can't both compute the same pre-insert volume (tier boundary race).
      -- Transaction-scoped: released automatically at commit/rollback.
      PERFORM pg_advisory_xact_lock(hashtext('partner_commission:' || NEW.referral_code));

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

      -- Idempotency enforced by the unique index: a second completion event
      -- for the same order is a silent no-op.
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
      )
      ON CONFLICT (order_id) WHERE order_id IS NOT NULL DO NOTHING;

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
