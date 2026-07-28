-- 1) Admin visibility + updates on referral_rewards (previously owner-only RLS)
CREATE POLICY "Admins can view referral rewards"
  ON public.referral_rewards FOR SELECT
  USING (public.get_current_user_role() = 'admin');

-- NOTE: referral_rewards.status is constrained to ('pending','claimed','expired').
-- Admin "Mark Paid" maps to 'claimed'; do not write 'paid'.
CREATE POLICY "Admins can update referral rewards"
  ON public.referral_rewards FOR UPDATE
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- 2) Daily cleanup of abandoned checkouts (pending > 24h, never paid)
SELECT cron.schedule(
  'cleanup-abandoned-checkouts',
  '15 3 * * *',
  $$
    UPDATE public.orders
       SET status = 'cancelled', updated_at = now()
     WHERE status = 'pending'
       AND payment_status = 'pending'
       AND created_at < now() - interval '24 hours';

    UPDATE public.topup_orders
       SET status = 'cancelled', updated_at = now()
     WHERE status = 'pending'
       AND payment_status = 'pending'
       AND created_at < now() - interval '24 hours';
  $$
);
