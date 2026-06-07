---
name: Sentry CORS edge functions
description: Every Supabase edge function must allow sentry-trace and baggage headers (and *.supabase.co must stay in Sentry tracePropagationTargets) or checkout/Tawk.to break in production only.
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

And `client/src/instrument.ts` must keep `*.supabase.co` in `tracePropagationTargets`:

```ts
tracePropagationTargets: [
  'localhost',
  /^https:\/\/palopconnect\.com/,
  /^https:\/\/[a-z]+\.supabase\.co/,
],
```

**Why:** Sentry's `browserTracingIntegration` injects `sentry-trace` + `baggage` headers into every fetch matching `tracePropagationTargets` (which includes `*.supabase.co`). The browser then sends an OPTIONS preflight listing those headers. If a function doesn't declare them in `Access-Control-Allow-Headers`, the preflight fails with a CORS error and `supabase.functions.invoke()` returns `FunctionsFetchError` — silently blocking the entire call (this caused a ~24h, 100% checkout outage). Removing `*.supabase.co` from the targets instead breaks Tawk.to widget init (it depends on the fetch instrumentation). PostgREST (`/rest/v1/`) is unaffected because it returns `Access-Control-Allow-Headers: *`.

**How to apply:** Whenever you create OR edit any edge function, verify `corsHeaders` includes both `sentry-trace` and `baggage`. Never copy the old 4-header pattern. After deploying, verify the preflight returns 200 with those headers echoed.

## Why this is invisible in dev testing
`instrument.ts` has `enabled: import.meta.env.PROD` — Sentry is fully disabled on `localhost` and `*.replit.dev`. Dev preflights never carry Sentry headers, so missing headers only manifest in production. Always verify against the deployed function, not dev.

## Structural fix still worth doing
Each function defines its own `corsHeaders`. A shared `supabase/functions/_shared/cors.ts` would prevent this whole class of bug.
