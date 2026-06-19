---
name: Order provisioning paths
description: This eSIM platform has two independent provisioning paths; order-lifecycle writes must be mirrored across both.
---

# Two provisioning paths

A paid order can be provisioned by EITHER of two independent paths: a client-invoked
edge function, or the authoritative Stripe webhook. They do not share persistence code.

**Rule:** any change to how an order's lifecycle fields are written (`status`,
`completed_at`, `esim_status`) must be applied to BOTH paths, and the webhook's
"already provisioned" early-return must still guarantee the final status.

**Why:** an order's `status` got stuck on `processing` forever because one path marked
the eSIM provisioned without completing the order, and the other path then short-circuited
on the "already provisioned" check and never completed it. Customers saw "processing"
permanently. A fix in only one path leaves the other broken.

**How to apply:** when touching provisioning/order-status logic, search for every place
that persists order status (more than one exists) and update them together; re-check the
webhook's idempotency guard so it never returns without ensuring the terminal status.
