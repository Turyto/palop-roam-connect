-- Allow the distinct paid-but-provisioning-failed state
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status = ANY (ARRAY['pending','processing','completed','failed','cancelled','refunded','needs_attention']));
