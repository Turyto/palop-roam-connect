-- Idempotency guard: when the provisioning-failure notification was sent
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS failure_notified_at timestamptz;
