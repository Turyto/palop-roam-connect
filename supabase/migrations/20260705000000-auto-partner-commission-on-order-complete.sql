-- ──────────────────────────────────────────────────────────────────────────────
-- Auto-record partner commissions when a referred order completes.
--
-- Previously partner commissions were entered by hand in the admin dashboard
-- (AdminCommissions.tsx -> partner_commissions). This trigger makes them
-- automatic: every order that used a PARTNER referral code and reaches
-- status='completed' generates a matching `owed` commission row.
--
-- Single authoritative place: the trigger lives on `orders`, so it fires no
-- matter which provisioning path completes the order (client `esim-access`
-- persist OR `_shared/esim-provision.ts` via stripe-webhook) — both flip
-- orders.status to 'completed' with an UPDATE. Firing here avoids the
-- double-counting risk of adding the logic to each edge function.
--
-- Commission rule (confirmed with the business):
--   * order price €1–€49   → 15% of price
--   * order price €50+     → 20% of price
--
-- Idempotency: guarded on order_id — no second commission is created if the
-- order completes/provisions more than once.
-- Only PARTNER-type referral codes generate commissions (customer codes do not).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.record_partner_commission_on_order()
RETURNS TRIGGER AS $$
DECLARE
  v_partner_label TEXT;
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

        -- Tiered rate on the order price.
        v_rate := CASE WHEN COALESCE(NEW.price, 0) >= 50 THEN 0.20 ELSE 0.15 END;
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
          status, commission_date, notes
        )
        VALUES (
          v_partner_label, NEW.referral_code, v_amount, COALESCE(NEW.currency, 'EUR'),
          NEW.id, v_customer_name, COALESCE(NEW.customer_email, v_customer_email),
          'owed', CURRENT_DATE,
          'Auto-recorded on order completion (' ||
            (v_rate * 100)::int || '% of €' || COALESCE(NEW.price, 0)::text || ').'
        );

      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fire on INSERT (orders created directly as completed) and on UPDATE OF status
-- (the normal path: pending/processing → completed via provisioning). The
-- order_id guard makes repeated fires safe.
DROP TRIGGER IF EXISTS trg_record_partner_commission ON public.orders;
CREATE TRIGGER trg_record_partner_commission
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.record_partner_commission_on_order();

-- ──────────────────────────────────────────────────────────────────────────────
-- Backfill: create commission rows for already-completed partner-referred orders
-- that don't have one yet. Uses the same tiered rule. Idempotent (order_id guard).
-- The pre-existing manual Praiatur backfill row is preserved (its order already
-- has a commission, so it is skipped here).
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_commissions (
  partner_name, partner_code, amount, currency,
  order_id, customer_name, customer_email,
  status, commission_date, notes
)
SELECT
  COALESCE(NULLIF(rc.label, ''), rc.code),
  o.referral_code,
  ROUND(COALESCE(o.price, 0) * (CASE WHEN COALESCE(o.price, 0) >= 50 THEN 0.20 ELSE 0.15 END), 2),
  COALESCE(o.currency, 'EUR'),
  o.id,
  p.full_name,
  COALESCE(o.customer_email, p.email),
  'owed',
  COALESCE(o.completed_at::date, CURRENT_DATE),
  'Backfilled on order completion (auto commission migration).'
FROM public.orders o
JOIN public.referral_codes rc
  ON rc.code = o.referral_code
 AND rc.type = 'partner'
 AND rc.is_active = true
LEFT JOIN public.profiles p ON p.id = o.user_id
WHERE o.status = 'completed'
  AND o.referral_code IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.partner_commissions pc
    WHERE pc.order_id = o.id
  );
