---
name: Resend delivery suppression
description: Why alert emails can silently vanish — Resend suppresses recipients that hard-bounced
---
Resend accepts the API call (200 + id) even when the recipient address is on its suppression list from a prior hard bounce — the email is silently never delivered. Alert/admin emails to unmonitored domain addresses are especially at risk.

**Why:** A provisioning-failure alert on 7 Jul 2026 was "sent" but never arrived because NOTIFY_ADMIN_EMAIL pointed to a palopconnect.com address that had hard-bounced earlier.

**How to apply:** When an email "was sent but never arrived", check `GET https://api.resend.com/emails/{id}` — `last_event: bounced/suppressed` vs `delivered`. Point alert recipients at a real monitored mailbox (configured via Supabase secret NOTIFY_ADMIN_EMAIL) and verify delivery, not just the send response.
