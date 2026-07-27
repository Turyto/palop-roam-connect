-- ──────────────────────────────────────────────────────────────────────────────
-- Palopianos partner account. RECORD OF A DATA FIX ALREADY APPLIED to prod
-- (27 Jul 2026). Idempotent. Mirrors 20260708120000 (Praiatur).
--
-- The auth user was created via the Supabase Auth admin API (not SQL):
--   email palopianos.pt@gmail.com, pre-confirmed, temp password issued.
--   uid: 58e25e81-27d6-46a2-be15-87c344571337
-- handle_new_user() auto-created the profile with role 'customer'; the two
-- statements below promote it to 'partner' and point the pre-existing
-- PALOPIANOS referral code (created by the admin via the Referrals UI)
-- at this account.
-- ──────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles
SET role = 'partner'
WHERE id = '58e25e81-27d6-46a2-be15-87c344571337';

UPDATE public.referral_codes
SET user_id = '58e25e81-27d6-46a2-be15-87c344571337'
WHERE code = 'PALOPIANOS';
