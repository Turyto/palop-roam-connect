-- ──────────────────────────────────────────────────────────────────────────────
-- P0.1 (Partner Area Build Plan v2.1) — Add 'partner' to the app_role enum.
--
-- MUST be its own migration: a newly added enum value cannot be used in the
-- same transaction that adds it. Any statement assigning role='partner'
-- (see 20260708120000) must run only after this has committed.
-- No existing profile rows are changed here.
-- ──────────────────────────────────────────────────────────────────────────────

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner';
