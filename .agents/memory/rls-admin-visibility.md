---
name: RLS admin visibility after ownership reassignment
description: Owner-based RLS silently breaks admin tools when a row's user_id is reassigned to a non-admin account.
---

Rule: whenever a row's `user_id`/owner is reassigned away from an admin account in a table whose RLS only has owner-based policies, admin dashboards silently lose read/write access to that row (empty lists, no errors).

**Why:** After the PRAIATUR referral code was reassigned from the admin to the partner account, `referral_codes` (owner-only policies) became invisible to admins — breaking the admin referrals list/toggle and partner dropdowns. Fixed by adding an explicit `get_current_user_role() = 'admin'` FOR ALL policy (the established pattern used on newer tables).

**How to apply:** before reassigning ownership of any row, check the table's RLS policies for an admin policy; if only owner-based policies exist, add the admin policy first. When admin UI shows unexpectedly empty data with no error, suspect this immediately.
