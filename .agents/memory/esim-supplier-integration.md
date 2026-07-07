---
name: eSIM supplier integration rules
description: Durable rules for multi-supplier eSIM provisioning (eSIM Access + eSIMCard) and duplicate-spend guards
---

# Multi-supplier eSIM provisioning

- Supplier is branched on `esim_packages.supplier` (`esim_access` default, `esimcard`). The eSIM Access path must stay untouched when adding suppliers.
- **Duplicate-spend guard rule:** any provisioning path that spends real reseller money must be gated on `orders.esim_order_id IS NULL`, not just `esim_status`. Status can be reset to `failed` by downstream error handlers, but `esim_order_id` (real supplier id or `esimcard-pending-<orderId>` marker) is never cleared.
  **Why:** webhook replays / client retries after a "charged but activation not ready" purchase would otherwise re-purchase from the supplier.
  **How to apply:** the webhook claim uses `.is('esim_order_id', null)`; the client-invoked edge fn returns `alreadyProvisioned` when set.
- Provisioning is only "success" with a complete activation payload: iccid + one of LPA/QR/universal link. Incomplete → `success:false`, order marked `processing` with pending marker (manual follow-up; find via `esim_order_id like 'esimcard-pending-%'`).
- Client-invoked provisioning edge fns must resolve the supplier package server-side from the order's `plan_id` and require `payment_status in ('succeeded','paid')` — never trust client-supplied package ids (arbitrary reseller spend vector).
- eSIMCard reseller API: base `portal.esimcard.com/api/developer/reseller`; POST /login {email,password}→access_token; POST /package/purchase {package_type_id}; delayed purchases (`sim_applied:false`) need polling `/my-esims`. Creds in Supabase secrets `ESIMCARD_EMAIL`/`ESIMCARD_PASSWORD`.
- Edge functions deployed via Management API `POST /v1/projects/<ref>/functions/deploy?slug=<fn>` with multipart metadata + files (include `_shared/*.ts`). All CORS must allow `sentry-trace, baggage`.
- mz-3gb was upgraded from 15→30 days (user-approved, Jul 2026) because eSIMCard has no 15-day Mozambique package.
- Real eSIMCard test provisioning still pending — reseller balance was $0; user chose to skip live test.
