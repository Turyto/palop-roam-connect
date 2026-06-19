---
name: Order provisioning paths
description: There are two independent eSIM provisioning code paths; order-status changes must be applied to both.
---

# Two provisioning paths (esim platform)

A paid order can be provisioned by EITHER of two paths, and they run independently:

1. **Client-invoked**: frontend calls the `esim-access` edge function (its own `persistESIMRecords`).
2. **Authoritative webhook**: `stripe-webhook` → `_shared/esim-provision.ts` `persistESIMRecords`.

**Rule:** any change to how an order's lifecycle fields are written (e.g. `status`, `completed_at`, `esim_status`) MUST be applied in BOTH persist functions, and the `stripe-webhook` "already provisioned" early-return guard must not skip the status flip.

**Why:** order `status` was stuck on `processing` forever because the `esim-access` path set only `esim_status='provisioned'` (never `status='completed'`), and when the webhook later fired it hit the `esim_status === 'provisioned'` guard and returned early without completing the order. Customers saw "processing" permanently.

**How to apply:** when editing provisioning/order-status logic, grep for `persistESIMRecords` (appears in `esim-access/index.ts` and `_shared/esim-provision.ts`) and update both; also re-check the webhook guard branch. Redeploy with `supabase functions deploy <fn> --project-ref btallyhejhqfpqwaboee --use-api` (Docker bundler fails on the esm.sh Stripe import, so `--use-api` is required).
