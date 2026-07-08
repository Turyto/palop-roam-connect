-- ──────────────────────────────────────────────────────────────────────────────
-- P0.2 / P0.3 (Partner Area Build Plan v2.1) — Praia Tur partner account.
-- RECORD OF A DATA FIX ALREADY APPLIED to prod (8 Jul 2026). Idempotent.
--
-- The auth user was created via the Supabase Auth admin API (not SQL):
--   email patrick.oliveira@praiatur.cv, pre-confirmed, temp password issued.
--   uid: 99bee940-d18b-4318-9eb9-1341e80f1bfe
-- handle_new_user() auto-created the profile with role 'customer'; the two
-- statements below promote it to 'partner' and point the PRAIATUR referral
-- code at this account. Requires 20260708110000 (enum value) committed first.
-- ──────────────────────────────────────────────────────────────────────────────

UPDATE public.profiles
SET role = 'partner'
WHERE id = '99bee940-d18b-4318-9eb9-1341e80f1bfe';

UPDATE public.referral_codes
SET user_id = '99bee940-d18b-4318-9eb9-1341e80f1bfe'
WHERE code = 'PRAIATUR';
