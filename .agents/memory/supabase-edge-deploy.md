---
name: Supabase edge function deploy via API
description: How to deploy edge functions with shared modules via the management API multipart endpoint
---
Deploy via `POST /v1/projects/<ref>/functions/deploy?slug=<fn>` with multipart:
- metadata part: `{"entrypoint_path":"<fn>/index.ts","name":"<fn>","verify_jwt":false}` — entrypoint MUST be prefixed with the function dir.
- files: `-F "file=@<fn>/index.ts;filename=<fn>/index.ts"` and shared modules as `-F "file=@_shared/x.ts;filename=_shared/x.ts"`.
**Why:** the bundler places uploads under a `source/` root; if entrypoint is bare `index.ts`, relative `../_shared/...` imports resolve outside the upload and fail with "Module not found" (HTTP 400).
**How to apply:** any curl-based deploy of functions that import `../_shared/*`. Occasional 502s are transient — retry.
Also: no local deno here; server-side bundling on deploy is the only typecheck. Test runtime behavior (npm: deps) with a throwaway function, then DELETE it via the API.
