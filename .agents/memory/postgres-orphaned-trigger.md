---
name: Orphaned trigger after DROP TABLE CASCADE
description: Dropping a table does not remove triggers/functions on OTHER tables that reference it; they survive as latent runtime errors.
---

# Orphaned trigger / function after DROP TABLE CASCADE

`DROP TABLE x CASCADE` removes objects that depend on `x`, but a trigger defined on a
*different* table whose function body references `x` is **not** a tracked dependency — it
survives and becomes dead code that only errors at runtime when its branch executes.

**Why:** In this project, `public.plan_inventory` was dropped, but
`trigger_decrease_plan_inventory` on `public.orders` (function `decrease_plan_inventory_on_order`)
remained. It threw only on the `status -> 'completed'` transition, so it lay dormant while the
webhook set `status='processing'`, then would have blocked every order completion.

**How to apply:** After dropping any table, grep migrations/functions for other objects that
reference it by name. When a trigger errors only on a specific column/status transition, suspect
a stale function referencing a removed table. Fix by dropping the orphaned trigger+function (or
recreating the table) via a migration AND applying it to the live DB.
