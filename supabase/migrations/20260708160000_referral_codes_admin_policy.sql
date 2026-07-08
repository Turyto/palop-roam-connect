-- Admins lost visibility of the PRAIATUR referral code when it was
-- reassigned from the admin account to the Praia Tur partner account
-- (20260708120000): referral_codes RLS only had owner-based policies.
-- Admin tools (AdminReferrals list/toggle, AdminConsignment partner
-- dropdown, PartnerMonthlySummary partner picker) need full admin access.
-- Same pattern as "Admins can manage consignment orders".

CREATE POLICY "Admins can manage referral codes"
ON public.referral_codes
FOR ALL
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');
