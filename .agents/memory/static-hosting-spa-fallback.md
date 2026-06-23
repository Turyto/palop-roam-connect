---
name: Replit Static Hosting SPA fallback
description: How to make client-side-routed SPAs serve deep links on Replit Static when .replit rewrites can't be edited.
---

# Replit Static Hosting — SPA deep-link fallback

For a client-side-routed SPA (React Router etc.) on **Replit Static Hosting**, deep
links / hard refreshes (`/support`, `/orders`, `/admin/dashboard`) 404 unless there's
a fallback to the app shell.

**The clean way** is a rewrite in `.replit`:
```toml
[[deployment.rewrites]]
from = "/*"
to = "/index.html"
```
This serves index.html with a **200** status for unmatched paths.

**Why we couldn't use it / the workaround:** the agent cannot edit `.replit` directly
(blocked tool), and `deployConfig` has no `rewrites` parameter. Replit's documented
alternative is a `404.html` at the publicDir root — Static auto-serves it for unmatched
paths. So emit `dist/404.html` as a **copy of the BUILT `dist/index.html`** (must be the
built file so it carries the hashed asset refs), via a build-time Vite plugin
(`closeBundle` hook, gated to non-dev mode). See `vite.config.ts` `spaFallback()`.

**Tradeoff:** the 404.html path renders the SPA correctly but returns HTTP **404**
status (not 200) — fine functionally, minor SEO/monitoring downside. Prefer the rewrite
rule if a way to edit `.replit` rewrites becomes available.

**Deployment-type switch caveat:** Replit locks an existing deployment's type. Switching
Autoscale → Static is NOT in-place — the user must create a NEW Static deployment and
re-point the custom domain. `deployConfig` only stages `.replit` for the next/new deploy;
it does not change the live deployment.
