---
name: Paid order creation & eSIM provisioning architecture
description: Why orders must be created server-side before the charge and why the Stripe webhook is the authoritative eSIM provisioner
---

# Paid order creation must be server-side, before the charge

**Rule:** Never create a paid order row from the browser after a Stripe charge.
Create it server-side (service role) inside `create-payment-intent`, BEFORE returning
the `clientSecret`, using the `user_id` from the verified bearer token.

**Why:** `orders.user_id` is NOT NULL and the RLS INSERT policy requires
`auth.uid() = user_id`. The browser session identity could diverge from the
order's `user_id` at insert time (anonymous guest sessions, token refresh, 3DS
redirect), so the client INSERT was rejected by RLS — money was taken in Stripe
LIVE mode but no order row existed. This was a real P0 incident (multiple LIVE
charges, only one order ever persisted).

**How to apply:** Any new paid flow resolves the supplier package mapping and
inserts a pending order server-side first; if that insert fails, return an error
and DO NOT return the `clientSecret` (the PaymentIntent is unconfirmed at that
point, so no charge happens). Only then let the client confirm payment.

# The Stripe webhook is the authoritative eSIM provisioner

**Rule:** eSIM provisioning happens in the `stripe-webhook` on
`payment_intent.succeeded`, not in the browser. The browser only navigates to a
success page that POLLS for the webhook's outcome.

**Why:** Browser-driven provisioning loses the result if the customer closes the
tab, and races with the webhook. The supplier call costs real money, so it must
run exactly once from a reliable server context.

**How to apply:** Before provisioning, do an ATOMIC CLAIM — update the order
`esim_status` from `pending|failed|null` → `provisioning` and check that a row was
actually returned. Zero rows means another invocation (or a Stripe retry) already
owns it → skip. On supplier failure: set `esim_status='failed'`, fire
`notify-provisioning-failure`, and return HTTP 200 (returning 5xx makes Stripe
retry forever and re-hit the supplier). Only `order not found` should throw so
Stripe retries (the row should always exist by then).

# Shared provisioning logic

`supabase/functions/_shared/esim-provision.ts` (`provisionOrder()`) is the single
server-side provisioning path: HMAC-signed eSIM Access `/esim/order`, poll
`/esim/query` for ICCID/LPA/QR, persist `esim_activations`/`qr_codes`/`orders`
(idempotent, existence-checked), then Resend email. The `_shared` folder is bundled
automatically by the Supabase CLI (`config.toml` + `.temp/` present) so relative
imports like `../_shared/esim-provision.ts` work on deploy.
