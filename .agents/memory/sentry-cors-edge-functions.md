---
name: Sentry CORS edge functions
description: Every Supabase edge function must allow sentry-trace and baggage headers or checkout breaks in production — Sentry is prod-only so this is invisible in dev testing.
---

# Sentry CORS — Edge Function Rule

## The rule
Every Supabase edge function MUST have this exact corsHeaders object:

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

**Why:** Sentry's `browserTracingIntegration` injects `sentry-trace` and `baggage` headers into all requests matching `tracePropagationTargets` (which includes `*.supabase.co`). The browser sends an OPTIONS preflight listing these headers. If the function doesn't declare them in `Access-Control-Allow-Headers`, the preflight fails with CORS error and `supabase.functions.invoke()` returns an error — silently blocking the entire call.

**How to apply:** Any time a new edge function is created, or an existing one is edited, check that `corsHeaders` includes both `sentry-trace` and `baggage`. Do not copy the old 4-header pattern.

## Why this is invisible in dev testing
`instrument.ts` has `enabled: import.meta.env.PROD` — Sentry is completely disabled on `localhost` and `*.replit.dev`. The CORS preflight never carries Sentry headers in dev, so missing headers only manifest in production.

## History
- 1 Jun 2026: fix applied only to `fetch-supplier-rates` (the function being tested). Four checkout-critical functions missed.
- 3 Jun 2026: production deployment → 100% checkout failure for ~24 hours.
- 3 Jun 2026: all 4 functions fixed and redeployed; preflight verified 200.

## Structural fix still needed
All functions define their own `corsHeaders` independently. A shared `supabase/functions/_shared/cors.ts` would prevent this class of bug entirely.
