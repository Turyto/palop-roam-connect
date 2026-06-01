---
name: Sentry + Supabase Edge Function CORS
description: Edge functions must allow sentry-trace and baggage headers, and *.supabase.co must stay in tracePropagationTargets, or Tawk.to breaks.
---

## The Rule
Every Supabase Edge Function's `corsHeaders` must include `sentry-trace, baggage` in `Access-Control-Allow-Headers`.

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
```

`client/src/instrument.ts` must keep `*.supabase.co` in `tracePropagationTargets`:
```ts
tracePropagationTargets: [
  'localhost',
  /^https:\/\/palopconnect\.com/,
  /^https:\/\/[a-z]+\.supabase\.co/,
],
```

**Why:** Sentry's `browserTracingIntegration` adds `sentry-trace` + `baggage` headers to all fetch requests matching `tracePropagationTargets`. Removing `*.supabase.co` breaks Tawk.to widget initialization (timing/fetch instrumentation dependency). Keeping it means edge function CORS must explicitly allow those two headers or the OPTIONS preflight fails with a CORS error, causing `FunctionsFetchError`.

**How to apply:** Any time a new edge function is created, copy the corsHeaders template above. Supabase REST API (/rest/v1/) is unaffected because PostgREST uses `Access-Control-Allow-Headers: *`.
