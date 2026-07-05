---
name: Referral & partner commission triggers
description: Order completion auto-generates rewards/commissions via DB triggers on orders — not in the edge functions.
---

# Referral rewards & partner commissions are DB triggers on `orders`

Two AFTER triggers on `public.orders` react to an order reaching `status='completed'`:
- `trg_attribute_referral` — customer codes → `referral_rewards` (flat credit).
- `trg_record_partner_commission` — **partner**-type codes (`referral_codes.type='partner'`) → `partner_commissions` (status `owed`).

**Rule:** commission/reward creation belongs in these triggers, NOT in the provisioning
edge functions. Both provisioning paths flip `orders.status` to `completed` via UPDATE,
so a single trigger fires regardless of path — do not add commission logic to
`esim-provision.ts` or `stripe-webhook` or you will double-count.

**Partner commission amount rule (confirmed with business, Jul 2026):**
tiered % of `orders.price` — 15% when price < €50, 20% when price ≥ €50.

**Why:** putting the logic in one DB trigger avoids the classic double-count when two
independent provisioners both complete the same order. Idempotency is guarded on
`order_id` (skip if a `partner_commissions` row already exists for that order).

**Gotcha:** `trg_attribute_referral` is AFTER INSERT only; `trg_record_partner_commission`
is AFTER INSERT OR UPDATE OF status (the correct pattern, since orders are inserted as
pending/processing and only later UPDATE'd to completed).
