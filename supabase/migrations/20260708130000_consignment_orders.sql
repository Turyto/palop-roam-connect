-- ──────────────────────────────────────────────────────────────────────────────
-- P3.1 (Partner Area Build Plan v2.1) — consignment_orders table.
--
-- Tracks eSIM stock handed to partners on consignment. RLS enabled from
-- creation. Admin: full access. Partner: read own rows only (defence in
-- depth — primary partner access is the get-partner-dashboard edge function).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE public.consignment_orders (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  partner_code   text NOT NULL,
  batch_id       text,
  plan_name      text NOT NULL,
  quantity       integer NOT NULL CHECK (quantity > 0),
  unit_price     numeric NOT NULL CHECK (unit_price >= 0),
  total_value    numeric GENERATED ALWAYS AS (quantity * unit_price) STORED,
  status         text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at        timestamptz,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.consignment_orders ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "Admins can manage consignment orders"
ON public.consignment_orders
FOR ALL
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Partner: read own rows only (defence in depth — primary access is via edge function)
CREATE POLICY "Partners can view their own consignment orders"
ON public.consignment_orders
FOR SELECT
USING (auth.uid() = partner_id);
