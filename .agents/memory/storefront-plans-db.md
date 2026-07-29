---
name: Storefront plans are DB-driven
description: Store page/purchase plans come from the plans table, not plansPageContent.ts
---
The public store page (FeaturedPlansSection, SimpleComparisonSection) and Purchase page now read plans from the `plans` table via `useStorefrontPlans` — no longer from the hardcoded `plansPageContent.ts` planCards (that file still provides types, tabs, palopCountries, hero copy).

**Rules:**
- A plan appears on the store when `status='active'` AND `coverage_tab` is set; `is_available=false` shows the card but blocks purchase. Public RLS SELECT policy covers all active plans (even hidden ones) — tighten if hidden plans must stay undiscoverable.
- Plan card id = `storefront_slug` if set, else UUID; purchase links use `/purchase?plan=<id>`.
- Coverage labels (pt/en) are stored columns, auto-derived in the admin create-plan flow from tab/PALOP country.
- Purchase page must resolve legacy hardcoded plans without depending on the storefront fetch, and show an error+retry (never blank) when the fetch fails.

**Why:** plans were previously hardcoded, so admin-created plans never reached the store; migrating meant adding display columns + a public read policy (plans RLS was admin-only).
