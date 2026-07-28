---
name: Referral rewards status contract
description: Allowed status values and column naming on referral_rewards; abandoned-checkout sweep interplay with the Stripe webhook
---
- `referral_rewards.status` has a live CHECK constraint allowing only `pending | claimed | expired`. Admin "Mark Paid" must write `claimed`. Writing `paid` fails at the DB.
- The amount column is `reward_amount` (not `amount`); selecting `amount` fails silently in react-query (empty defaults, no visible error).
- **Why:** admin UI was built assuming paid/cancelled statuses and an `amount` column; both were wrong and failed only at runtime.
- **How to apply:** any code touching referral_rewards — verify column names and status values against the live schema first (repo migrations may diverge).
- Abandoned-checkout sweep: pg_cron job `cleanup-abandoned-checkouts` (03:15 UTC daily) cancels orders/topup_orders still `pending`+payment `pending` after 24h. The stripe-webhook top-up claim therefore accepts `cancelled` as claimable (guarded by supplier_order_no null) so a late-succeeding payment still fulfils.
