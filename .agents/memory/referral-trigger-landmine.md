---
name: Referral trigger constraint landmine
description: Why order-completion AFTER triggers on this DB can silently break sales, and how partner vs customer referral codes are split across triggers
---
- The live DB's trigger functions can DIVERGE from the repo's `supabase/migrations/` files (hot patches applied directly). Always read the live body (`pg_get_functiondef`) before editing a trigger — never trust the repo copy.
- **Why:** `attribute_referral_on_order()` had been hot-patched live to insert `reward_type='commission'` into `referral_rewards`, which its check constraint rejects (`discount|credit|free_plan` only). Because it's an AFTER trigger on `orders`, the violation aborts the ENTIRE order-completion transaction (payment already taken, provisioning status lost). It was masked only by the self-referral guard until the PRAIATUR code was reassigned to a real partner (Jul 2026).
- **How to apply:** referral codes are split by `type`: partner codes → `record_partner_commission_on_order()` (volume-tiered, advisory-locked, ON CONFLICT idempotent on `order_id`); customer codes → `attribute_referral_on_order()` (now skips `type='partner'`). The customer path STILL has the latent `reward_type='commission'` bug — must be fixed before any customer referral code is activated.
- Safe way to test order triggers on the live DB: clone a completed order into a temp table inside a transaction, insert + flip status, assert, then ROLLBACK (advisory xact locks self-release).
