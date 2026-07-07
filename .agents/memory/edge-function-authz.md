---
name: Edge function authorization
description: verify_jwt only proves a valid JWT (even anon key); privileged edge fns must not trust caller payloads
---
Supabase `verify_jwt` accepts any valid JWT, including the public anon key — it is authentication, not authorization. Any edge function invokable from the client that does privileged writes (service role) or sends emails MUST NOT trust request-body values.

**Why:** notify-provisioning-failure originally took customer_email/plan/error from the body — any user could send arbitrary emails or poison any order's failure reason.

**How to apply:** Accept only an id from the caller; load the record server-side with the service role; gate on actual DB state (e.g. paid + failed + not completed/cancelled); derive all email addresses and display data from the DB row; treat any free-text caller field as untrusted (length-cap, HTML-escape, write only if not already set).
