-- Per-channel idempotency: track customer delay email separately from admin alert
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_notified_at timestamptz;
