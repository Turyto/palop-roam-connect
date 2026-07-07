-- Task: provisioning failure warning system
-- Persist the supplier failure reason on the order so admins can see WHY
-- provisioning failed without digging through edge-function logs.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS esim_failure_reason text;
