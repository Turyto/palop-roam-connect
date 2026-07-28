---
name: eSIM Access top-ups
description: How real top-ups work (supplier endpoint, idempotency, region anchoring) and the invariants any change must keep.
---

- Supplier endpoint (verified live): `POST /api/v1/open/esim/topup` with `{ iccid | esimTranNo, packageCode: 'TOPUP_*', transactionId }`. `transactionId` is the supplier's idempotency key — always the Stripe PaymentIntent id, so webhook retries can never buy twice.
- Top-up catalogs are fetched per package via `/package/list { type: 'TOPUP', packageCode }`; `topup_options` rows carry `supplier_package_code` + `location_code` + `wholesale_cost` and must only be created from that live catalog.
- **Region anchoring rule:** eligibility and option matching must resolve from the ORDER's purchased package code (`orders.esim_package_id` → `esim_packages.esim_access_package_id` → `location_code`), never "latest esim_packages row by plan_id". **Why:** catalog remaps after purchase must not change what an existing eSIM can receive (charged-with-wrong-region risk).
- Webhook fulfilment claim allows re-claiming `processing` rows with `supplier_order_no IS NULL` on purpose — a crash mid-fulfilment must be resumable by the next Stripe retry (supplier dedupes on transactionId).
- Top-up PIs carry `metadata.kind='topup'` and are routed to `topup_orders`; the plan-order path in stripe-webhook must stay untouched by top-up logic.
- eSIMCard orders (cv-*, mz-*) do not support top-ups; they surface as `supported:false` because their package codes never match `esim_access_package_id`.
