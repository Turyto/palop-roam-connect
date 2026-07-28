---
name: Admin problem-order metrics
description: Shared definition of "failed delivery" and order status semantics for admin KPIs/alerts
---

Rule: every admin surface (KPI card, tab banner, global alert bar) must read problem counts from the shared `useDeliveryProblems` hook — never define "failed/pending" ad hoc per component.

**Why:** Three surfaces once each had their own filter and the numbers contradicted each other (KPI said 8 pending, screen said 0, banner said 1 failed).

**How to apply:** Failed delivery = `esim_status='failed' AND payment_status='succeeded' AND status NOT IN (completed,cancelled)`. Failed top-up = `topup_orders.payment_status='succeeded' AND status NOT IN (completed,cancelled)`.

Status semantics landmines:
- `esim_status='provisioned'` MEANS delivered to customer; many rows never get `'delivered'` or `esim_delivered_at` set. Legacy rows may only have `esim_order_id` as proof of provisioning.
- Failed-provisioning orders carry `status='needs_attention'` (not `'failed'`; `'failed'` = payment failed).
- Include `status IS NULL` legacy rows when excluding statuses in PostgREST (`.or('status.is.null,status.not.in.(...)')`), or paid failures silently vanish from counts.
- Any admin mutation that can fix a problem order must also invalidate the shared query key or surfaces contradict each other for up to a minute.
