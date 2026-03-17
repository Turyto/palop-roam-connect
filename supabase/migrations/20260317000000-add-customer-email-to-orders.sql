-- Add customer_email column to orders table.
-- Stores the customer's email directly on the order row so it survives
-- across anonymous → email auth transitions and is readable by admins
-- without joining the profiles table.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Email-based RLS policy for guest order recovery.
--
-- Security model:
--   Supabase auth.email() is set only after the user authenticates (email OTP
--   or password). An attacker cannot forge auth.email() without possessing the
--   magic link sent to that address, so email ownership is verified by Supabase
--   before this policy can be triggered.
--
--   The NOT NULL guard prevents NULL = NULL matches, so orders without an email
--   are never returned by this policy.
--
--   This policy is intentionally additive: the existing user_id-based policy
--   still applies. A guest who converts to a password account retains access
--   via both user_id (updateUser preserves the session) and this policy.
--
--   Orders created before this migration have customer_email = NULL and are
--   unaffected by this policy; they remain accessible only via user_id.
CREATE POLICY "Users can view orders by matching email"
  ON public.orders
  FOR SELECT
  USING (customer_email IS NOT NULL AND customer_email = auth.email());
