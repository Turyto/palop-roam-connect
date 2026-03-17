-- Add customer_email column to orders table
-- This stores the customer's email directly on the order row,
-- enabling admin visibility for both guest and registered user orders.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Add RLS policy to allow email-based order access for magic-link authenticated users
-- When a guest uses the magic link to sign in with their email, they can see
-- their orders via the customer_email column match (even across anonymous/email user switch).
CREATE POLICY "Users can view orders by matching email"
  ON public.orders
  FOR SELECT
  USING (customer_email IS NOT NULL AND customer_email = auth.email());
