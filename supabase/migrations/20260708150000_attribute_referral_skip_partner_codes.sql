-- ──────────────────────────────────────────────────────────────────────────────
-- CRITICAL FIX (found during Task #57 verification, 8 Jul 2026).
--
-- The LIVE body of attribute_referral_on_order() (which had diverged from the
-- repo's 20260522 migration) inserts reward_type='commission' into
-- referral_rewards — but the table's check constraint only allows
-- 'discount' | 'credit' | 'free_plan'. Because this is an AFTER trigger on
-- orders, the constraint violation ABORTS THE WHOLE TRANSACTION that
-- completes an order carrying a referral code.
--
-- Until now this was masked: the only referral code (PRAIATUR) pointed at the
-- admin's own uid and the only such order was the admin's own purchase, so the
-- self-referral guard exited early. After P0.3 reassigned PRAIATUR to the
-- Praia Tur partner account, ANY customer sale via ref=PRAIATUR would fail to
-- complete (payment taken, provisioning status update aborted).
--
-- Fix (minimal): the referrer lookup now skips type='partner' codes — exactly
-- the behavior the Partner Area plan already assumed this trigger had.
-- Partner sales are handled solely by record_partner_commission_on_order().
-- Customer-code behavior is otherwise byte-for-byte the live body, INCLUDING
-- its still-latent reward_type='commission' bug (no customer codes exist
-- today; flagged as a follow-up to fix deliberately, not smuggled in here).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.attribute_referral_on_order()
RETURNS TRIGGER AS $function$
DECLARE
  v_referrer_id       uuid;
  v_new_count         integer;
  v_commission_rate   numeric;
  v_commission_amount numeric;
BEGIN
  -- Guard: only act on INSERT with status='completed'
  --        OR UPDATE that transitions status to 'completed'
  IF NOT (
    (TG_OP = 'INSERT' AND NEW.status = 'completed' AND NEW.referral_code IS NOT NULL) OR
    (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.status = 'completed' AND NEW.referral_code IS NOT NULL)
  ) THEN
    RETURN NEW;
  END IF;

  -- Look up referrer — CUSTOMER codes only. Partner codes are handled by
  -- record_partner_commission_on_order(); processing them here violated the
  -- referral_rewards reward_type check constraint and aborted order completion.
  SELECT user_id INTO v_referrer_id
  FROM public.referral_codes
  WHERE code = NEW.referral_code
    AND is_active = true
    AND type IS DISTINCT FROM 'partner'
  LIMIT 1;

  -- Skip if referrer not found or is the buyer themselves (self-referral guard)
  IF v_referrer_id IS NULL OR v_referrer_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Increment uses_count, capture the new cumulative value
  UPDATE public.referral_codes
    SET uses_count = uses_count + 1, updated_at = now()
  WHERE code = NEW.referral_code
  RETURNING uses_count INTO v_new_count;

  -- Tiered commission on gross order amount:
  --   sales 1-49  → 15%
  --   sales 50+   → 20%
  v_commission_rate   := CASE WHEN v_new_count >= 50 THEN 0.20 ELSE 0.15 END;
  v_commission_amount := ROUND((COALESCE(NEW.price, 0) * v_commission_rate)::numeric, 2);

  -- Write commission row
  INSERT INTO public.referral_rewards (
    referrer_id, referee_id, referral_code, reward_type, reward_amount, status
  ) VALUES (
    v_referrer_id, NEW.user_id, NEW.referral_code, 'commission', v_commission_amount, 'pending'
  ) ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;
