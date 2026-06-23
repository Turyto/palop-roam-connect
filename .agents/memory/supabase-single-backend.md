---
name: Supabase single shared backend
description: There is no dev/prod DB split — schema changes hit live production directly.
---

# Single shared Supabase backend (no dev/prod split)

This project uses ONE Supabase project (`btallyhejhqfpqwaboee`, eu-west-1) for everything.
The repl's local Postgres (`DATABASE_URL`) is NOT what the app uses — the app/client talks to Supabase.

**Rule:** A migration is not "live" just because the `.sql` file exists in `supabase/migrations/`.
You must also apply it to the live Supabase project, and that means it lands on **production data**.

**Why:** There is no separate staging Supabase. Editing schema = editing the live customer DB.
Always make migrations idempotent (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`, guarded backfills)
and verify afterwards (table exists, `relrowsecurity`, `pg_policies`, row counts).

**How to apply / query (Build mode only — POST is blocked in Plan mode):**
POST to `https://api.supabase.com/v1/projects/btallyhejhqfpqwaboee/database/query`
with `Authorization: Bearer $SUPABASE_ACCESS_TOKEN` and body `{"query": "..."}`.

**Admin RLS convention:** gate admin-only tables with `public.get_current_user_role() = 'admin'`
(security-definer fn returning `profiles.role::text`). Add separate policies per command
(SELECT/INSERT/UPDATE/DELETE); do NOT add an `authenticated`-role policy on admin-only tables.
