---
name: GDPR consent gating
description: How non-essential third-party trackers are gated behind cookie consent; what to do when adding a new tracker.
---

# GDPR cookie consent gating

Three non-essential services are gated behind active user consent and must NOT
run until the user accepts: **GA4, Tawk.to live chat, Sentry browser tracing**.
Essential services (**Stripe, Supabase**) are never gated — rejecting cookies
must still allow a full purchase.

**Why:** EU/GDPR pre-launch blocker — non-essential cookies/trackers may only
load after explicit opt-in, and rejection cannot break checkout.

**How to apply (adding any new analytics/chat/monitoring/ads tracker):**
- Convert it to an explicit `init*()` function — never an import-time side
  effect, and never a hardcoded `<script>` in `index.html`.
- Wire its init into `loadConsentedServices()` in `client/src/lib/consent.ts`
  (the single orchestrator; idempotent; only fires when consent === 'accepted').
- Do NOT gate anything on the Stripe/Supabase checkout path.
- Consent is stored in localStorage key `palop-cookie-consent`
  ('accepted'|'rejected'), with an in-memory runtime fallback so Accept works
  even when localStorage is blocked (won't persist across reload in that case).
- The banner only shows when consent is null (first visit).
