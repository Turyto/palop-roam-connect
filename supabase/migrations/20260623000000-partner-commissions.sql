-- ──────────────────────────────────────────────────────────────────────────────
-- Partner Commission Ledger
-- Tracks commissions OWED to referral partners (e.g. Praiatur). Distinct from the
-- customer-facing `referral_rewards` table: partner payables have their own
-- lifecycle (owed → paid) and must be ADMIN-ONLY (never readable by customers).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.partner_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_name TEXT NOT NULL,
  partner_code TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EUR',
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'owed' CHECK (status IN ('owed', 'paid', 'cancelled')),
  notes TEXT,
  commission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────────────
-- Row Level Security — ADMIN ONLY.
-- Every operation (SELECT/INSERT/UPDATE/DELETE) requires the admin role.
-- No `authenticated`-role policy exists, so regular logged-in customers get
-- ZERO rows on read and are denied on writes. Uses the project-wide convention
-- public.get_current_user_role() = 'admin'.
-- ──────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.partner_commissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view partner commissions" ON public.partner_commissions;
CREATE POLICY "Admins can view partner commissions"
  ON public.partner_commissions FOR SELECT
  USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can insert partner commissions" ON public.partner_commissions;
CREATE POLICY "Admins can insert partner commissions"
  ON public.partner_commissions FOR INSERT
  WITH CHECK (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can update partner commissions" ON public.partner_commissions;
CREATE POLICY "Admins can update partner commissions"
  ON public.partner_commissions FOR UPDATE
  USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can delete partner commissions" ON public.partner_commissions;
CREATE POLICY "Admins can delete partner commissions"
  ON public.partner_commissions FOR DELETE
  USING (public.get_current_user_role() = 'admin');

-- Indexes for the admin ledger views (filter by partner & status)
CREATE INDEX IF NOT EXISTS idx_partner_commissions_partner ON public.partner_commissions(partner_name);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_status ON public.partner_commissions(status);
CREATE INDEX IF NOT EXISTS idx_partner_commissions_order_id ON public.partner_commissions(order_id);

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS update_partner_commissions_updated_at ON public.partner_commissions;
CREATE TRIGGER update_partner_commissions_updated_at
  BEFORE UPDATE ON public.partner_commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ──────────────────────────────────────────────────────────────────────────────
-- Backfill the first known outstanding commission:
-- Praiatur — €1.49 owed for Salomé Delgado (order 94cf650a, 18 Jun 2026).
-- Idempotent: only inserts if not already present.
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO public.partner_commissions
  (partner_name, partner_code, amount, currency, order_id, customer_name, customer_email, status, commission_date, notes)
SELECT
  'Praiatur', 'PRAIATUR', 1.49, 'EUR',
  '94cf650a-03ac-48b9-b3d9-fbbc59af5e87', 'Salomé Delgado', 'salomedelgado1963@gmail.com',
  'owed', '2026-06-18', 'Backfilled: first partner commission entry.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.partner_commissions
  WHERE order_id = '94cf650a-03ac-48b9-b3d9-fbbc59af5e87'
    AND partner_name = 'Praiatur'
);
