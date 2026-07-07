---
name: Supplier code validation
description: How to validate eSIM Access package codes before making plans sellable
---

Rule: any plan id that gains an `esim_packages` mapping becomes purchasable via checkout pre-flight. Never insert a mapping until the package code has been confirmed to exist in the live eSIM Access catalog (`/api/v1/open/package/list`, HMAC auth pattern as in the `fetch-supplier-rates` edge function, using ESIM_ACCESS_ACCESS_CODE/SECRET_KEY).

**Why:** Task-spec code lists have contained typos and wrong validity periods (e.g. an Angola 3GB code was 15 days, not the assumed 30; codes use letter "O" that looks like zero). A wrong code makes paid orders fail provisioning on the LIVE store.

**How to apply:** Fetch the catalog, match codes exactly, and take displayed data/validity/wholesale cost from the catalog response — not from the request text. Full sellability also requires one successful test provisioning per region before public promotion.

Prod DB changes go through the Supabase Management API (`POST /v1/projects/<ref>/database/query` with SUPABASE_ACCESS_TOKEN) — local DATABASE_URL is an unused Replit PG, the app is a frontend-only SPA on Supabase.
