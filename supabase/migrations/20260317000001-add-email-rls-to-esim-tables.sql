-- Email-based RLS policies for eSIM-related tables.
--
-- When a guest purchases via anonymous auth and later returns via magic link,
-- their new session has auth.email() set but a different user_id from the
-- anonymous session. These policies allow access to eSIM artifacts via the
-- parent order's customer_email, bridging the anonymous → email auth transition.
--
-- Security model is the same as for orders (see previous migration):
--   auth.email() is only set after Supabase verifies email ownership.
--   The subquery uses service-level access to orders; it cannot be bypassed
--   via client filters. The NOT NULL check on customer_email is inherited
--   from the orders policy constraint.

-- Allow guests to read their qr_codes via order customer_email match.
CREATE POLICY "Users can view qr_codes by order customer_email"
  ON public.qr_codes
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_email IS NOT NULL AND customer_email = auth.email()
    )
  );

-- Allow guests to read their esim_activations via order customer_email match.
CREATE POLICY "Users can view esim_activations by order customer_email"
  ON public.esim_activations
  FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE customer_email IS NOT NULL AND customer_email = auth.email()
    )
  );
