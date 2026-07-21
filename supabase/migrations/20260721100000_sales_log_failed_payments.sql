-- GA4 Phase 2 (Task: server-side purchase): revenue-truth tables written by the
-- stripe-webhook edge function (service role). Admin-only read via RLS; no
-- client INSERT/UPDATE/DELETE policies — service role bypasses RLS.

CREATE TABLE IF NOT EXISTS public.sales_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id text NOT NULL UNIQUE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id uuid,
  plan_id text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  channel text NOT NULL DEFAULT 'direct',      -- 'partner' | 'direct'
  partner_code text,
  ga_client_id text,
  ga4_sent boolean NOT NULL DEFAULT false,     -- whether the MP purchase event was dispatched
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.failed_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payment_intent_id text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  event_type text NOT NULL,                    -- 'payment_failed' | 'canceled'
  failure_code text,
  failure_message text,
  amount numeric(10,2),
  currency text,
  plan_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_failed_payments_pi ON public.failed_payments (stripe_payment_intent_id);

ALTER TABLE public.sales_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_payments ENABLE ROW LEVEL SECURITY;

-- Admin-only read. Writes come exclusively from the service role (webhook).
CREATE POLICY "Admins can view sales log"
  ON public.sales_log FOR SELECT
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can view failed payments"
  ON public.failed_payments FOR SELECT
  USING (public.get_current_user_role() = 'admin');
