# PALOP Roam Connect - eSIM Platform

## Overview
BuéChama eSIM is a comprehensive eSIM platform designed for PALOP (Portuguese-speaking African countries) communities. The platform provides affordable data and voice roaming plans specifically for travelers and communities from Angola, Cape Verde, Guinea-Bissau, Mozambique, and São Tomé and Príncipe.

## Current State
**Status:** ✅ LIVE — Stripe LIVE mode active, eSIM provisioning confirmed, chat support active

### June 2026 — Sprint 2 Stable Version (published palopconnect.com)
- Stripe **LIVE mode** payments processing real money
- eSIM Access provisioning end-to-end confirmed working (purchase → QR code → email)
- Admin live supplier rate fetching working (`fetch-supplier-rates` edge function)
- Tawk.to live chat active (widget `1jpng5feu`, property `6a18529e6034501c34c0b384`)
- Sentry error monitoring active in production (20% trace sample, EU only)
- Bilingual PT/EN throughout (translations in `client/src/lib/translations.ts`)
- WhatsApp support: +351 911 186 695 (8h–20h)
- Social icons centered in footer (clear of Tawk.to bubble)
- CORS + Sentry tracePropagationTargets resolved for edge functions

### Key Fix (Jun 2026): Sentry + Edge Function CORS
Sentry's `tracePropagationTargets` includes `*.supabase.co` (required for Tawk.to init).
Edge functions must allow `sentry-trace` and `baggage` in their CORS `Access-Control-Allow-Headers`.
Any new edge function must include these headers or its preflight will fail.

### June 2026 — CTO Soft-Launch Punch-List
Done (deployed to `btallyhejhqfpqwaboee`):
- **Item 1** — deleted placeholder `esim_packages` row `palop-essential-5gb` (`ESIM_PALOP_5GB`). It was unreachable from the storefront (checkout only sells `arrival/essential/comfort/freedom`) but was a landmine.
- **Item 2** — order `status` now reaches `completed` after provisioning. Two provisioning paths exist and BOTH now set `status='completed'`: the client-invoked `esim-access` persist, and `_shared/esim-provision.ts` (stripe-webhook). The webhook's "already provisioned" guard now also flips a stuck `processing` order to `completed`. Existing stuck orders backfilled.
- **Item 3** — `payment_intent.canceled` handler is live (cancels ghost/abandoned orders, never overrides paid). Existing stale `pending` orders (>1h) cancelled.
- **Item 5** — GDPR: stripped JWT token-prefix and customer-email from all edge-function logs (`esim-access`, `sync-supplier-inventory`, `_shared/esim-provision.ts`, `stripe-webhook`); logs now use `userId`/`order id` only.

Deferred to user:
- **Item 4** — frontend deploy is `autoscale` running `vite preview` (cold-start 500s). App is a frontend-only Vite SPA (Supabase backend) → switch the published deployment to **Replit Static Hosting** (build → `dist`, CDN-served, no cold starts).
  - **Staged in code (Jun 2026):** `.replit` `[deployment]` is now `deploymentTarget = "static"`, `build = npm run build`, `publicDir = "dist"`. SPA deep-link fallback is handled by a build-time Vite plugin (`spaFallback` in `vite.config.ts`) that emits `dist/404.html` as a copy of the built `index.html` — Replit Static auto-serves `404.html` for unmatched paths, so client-side routes (`/support`, `/orders`, `/admin/dashboard`) and hard refreshes load the SPA instead of a hard 404. (The cleaner `[[deployment.rewrites]]` `/* → /index.html` rule is not used because `.replit` cannot be edited by the agent and `deployConfig` has no rewrites option; the `404.html` fallback is Replit's documented alternative.)
  - **Still requires the user (UI action):** Replit locks deployment type for an existing deployment — switching to Static requires creating a **new** Static deployment from the main version (after this task merges) and re-pointing the `palopconnect.com` domain to it, then retiring the old Autoscale deployment. Not an in-place "Adjust settings" change.

### Backlog Status — validated against live code/DB (21 Jun 2026)
Re-validated the "hand to Replit next sprint" board; two items were already shipped:
- ✅ **CLOSE — Strip debug logging (GDPR)** — Done & live. No customer email / auth-token data in any edge-function log.
- ✅ **CLOSE — `referral_code` in Stripe PI metadata** — Done & live. `create-payment-intent` appends `metadata[referral_code]` (plus `order_id`, `user_id`, `plan_id`); referral attribution auditable from Stripe dashboard.
- 🟡 **KEEP — Abandoned checkout auto-cancel** — Partial. Event-driven `payment_intent.canceled` handler is live (cancels on any Stripe cancel/expiry, never overrides paid). STILL NEEDED: a scheduled sweep (e.g. `pg_cron`) to auto-cancel `pending` orders older than N hours that never got a Stripe event (true tab-close abandonment). Cleared manually so far. Not blocking sales.
- ❌ **KEEP — Validate Portugal/PALOP plans before selling** — Not started (follow-up #30). Codes `CKH1003`/`CKH1011` exist in `esim_packages` but were never test-provisioned.

Clarification on "don't open Portugal/country plans yet":
- Dedicated per-country SKUs (`portugal-*`, `europe-weekly/monthly/plus`, `CKH1003`/`CKH1011`) are **not exposed for sale** anywhere — DB rows only, already effectively closed. Storefront `planCards` only sells the 4 bundles, and the "Portugal" coverage tab falls back to those same 4.
- The 4 live bundles (Arrival/Essential/Comfort/Freedom) use **validated** codes (`PRC8B6GK2`, `PV0Q6PZ7G`, `P29FDU5TL`, `P6PBYX5G4`) with confirmed provisioning, and they advertise "Portugal + Europe coverage" — so Portugal *coverage* is already sold safely via these. The restriction applies only to the unvalidated `CKH`-based Portugal SKUs.

### July 2026 — Provisioning Failure Warning System
- Root cause of missing Jul 7 alert: Resend silently suppressed delivery — `NOTIFY_ADMIN_EMAIL` pointed to a palopconnect.com address that had hard-bounced. Now set (Supabase secret) to turyto@gmail.com; delivery verified.
- `orders.esim_failure_reason` column added (migration `20260707120000`); persisted by both stripe-webhook (`markProvisioningFailed`) and `notify-provisioning-failure`.
- `notify-provisioning-failure` (v21+) sends admin alert + bilingual PT/EN customer "small delay" email (WhatsApp + suporte@). **Hardened:** accepts only `order_id` (+ optional error_message); loads the order server-side with service role and only acts if payment succeeded + esim_status failed + not completed/cancelled; all emails/plan data derived from DB; error text HTML-escaped, 500-char cap, written only if reason not already set.
- Admin dashboard (`AdminOrdersTable.tsx`): "Needs Attention" banner + counter, filter option, red row highlight + badge for paid-but-failed orders; `OrderDetailsModal.tsx` shows the failure reason.

### Pre-Launch Blocker
- **GDPR cookie consent banner** — not yet implemented; required before EU public marketing push

## Required Environment Variables
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (from Stripe dashboard, set in Replit secrets)
- `STRIPE_SECRET_KEY` — must be set as a **Supabase project secret** for the `create-payment-intent` edge function
- `ESIM_ACCESS_SECRET_KEY` — must be set as a Supabase project secret for eSIM provisioning

## Supabase Edge Functions Deployed
All deployed to project `btallyhejhqfpqwaboee`:
- `create-payment-intent` — creates Stripe PaymentIntent, needs `STRIPE_SECRET_KEY`
- `get-esim-package` — fetches eSIM package mapping for a plan
- `esim-access` — creates eSIM orders with eSIM Access API, needs `ESIM_ACCESS_SECRET_KEY`
- `check-esim-status` — checks eSIM provisioning status

## Setting Supabase Secrets
```bash
curl -X POST "https://api.supabase.com/v1/projects/btallyhejhqfpqwaboee/secrets" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"name":"STRIPE_SECRET_KEY","value":"sk_test_..."}]'
```

## Recent Changes (Migration from Lovable - Nov 18, 2024)
1. **Project Structure Reorganization**
   - Moved all frontend code from `src/` to `client/src/`
   - Moved `index.html` and `public/` to `client/` directory
   - Updated all configuration files to reflect new structure

2. **Configuration Updates**
   - `vite.config.ts`: Updated to serve from `client/` directory and bind to port 5000
   - `tailwind.config.ts`: Updated content paths to scan `client/` directory
   - `tsconfig.json` and `tsconfig.app.json`: Updated path aliases for new structure
   - `package.json`: Updated project name and scripts

3. **Workflow Configuration**
   - Configured "Start application" workflow to run `npm run dev` on port 5000
   - Set output type to webview for proper frontend display

## Project Architecture

### Frontend (client/src/)
- **Framework:** React 18 with TypeScript
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS with custom PALOP color scheme
- **UI Components:** Shadcn/ui component library
- **State Management:** TanStack Query (React Query) for server state
- **Authentication:** Supabase Auth with role-based access control

### Backend & Database
- **Database:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth
- **Edge Functions:** Supabase Functions for eSIM provisioning
- **API Integration:** eSIM Access API for real eSIM provisioning

### Key Features
1. **Customer Features:**
   - Browse eSIM plans by country and data amount
   - Purchase eSIM plans
   - View order history and eSIM activations
   - Download QR codes for eSIM activation
   - Top-up existing eSIMs
   - Referral system

2. **Admin Features:**
   - Manage plans catalog with supplier rates
   - View and process orders
   - Monitor eSIM provisioning status
   - Manage inventory (plan-based and carrier-based)
   - View QR codes and activations
   - User management
   - Support ticket system

### Database Schema
The database includes these main tables:
- `profiles` - User profiles with role management (admin/customer)
- `orders` - eSIM purchase orders
- `esim_activations` - eSIM activation records with QR codes
- `plans` - Available eSIM plans catalog
- `supplier_rates` - Wholesale costs from suppliers
- `pricing_rules` - Dynamic pricing configuration
- `qr_codes` - QR code generation and tracking
- `topup_orders` - Top-up purchases
- `referral_codes` & `referral_rewards` - Referral program
- `support_tickets` - Customer support tickets

## User Preferences
- **Code Style:** TypeScript with React functional components
- **UI Library:** Shadcn/ui components
- **Styling:** Tailwind CSS with PALOP color scheme (green, yellow, red)
- **Database:** Supabase with RLS policies

## Development Workflow
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

## Environment Variables
The following Supabase secrets are already configured:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL (configured in client code)
- `SUPABASE_ANON_KEY` - Supabase anonymous key (configured in client code)
- `ESIM_ACCESS_SECRET_KEY` - eSIM Access API key (for edge functions)

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **UI:** Shadcn/ui, Radix UI primitives, Lucide icons
- **Data Fetching:** TanStack Query
- **Forms:** React Hook Form with Zod validation
- **Maps:** Mapbox GL
- **Charts:** Recharts
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions)
- **eSIM Provisioning:** eSIM Access API integration

## Important Notes
1. The project uses Supabase migrations located in `supabase/migrations/`
2. Edge functions are in `supabase/functions/` for eSIM API integration
3. The admin dashboard requires `admin` role in the profiles table
4. All sensitive API keys should be managed through Supabase secrets
5. The Tailwind config removes the deprecated `@tailwindcss/line-clamp` plugin warning

## Support Page (Rebuilt — Mar 2026)
- `/support` fully rebuilt: HomeHeader + HomeFooter, bilingual (PT/EN), issue-driven
- **Sections:** Hero → Quick Help (6 issue cards) → FAQ Accordion (6 groups) → Contact Form → Help Note
- **Form:** writes real tickets to Supabase `support_tickets` table; works for guests (user_id nullable) and logged-in users; fields: name, email, order_id, device, category, message
- **DB changes:** `support_tickets.user_id` made nullable; `email`, `name`, `category` columns added; INSERT RLS updated to allow anonymous submissions (`user_id IS NULL OR auth.uid() = user_id`)
- **AdminSupportTickets.tsx:** reads real Supabase tickets; admin can mark status as open → in_progress → resolved → closed; filter by status
- **Support CTAs with context:** Compatibility pages → `?topic=compatibility`; Orders processing → `?topic=no_esim`; Orders error → `?topic=activation`; expired → `?topic=plan_help`
- **HomeFooter.tsx:** "Suporte" now routes to `/support` via `<Link>` (previously dead `#support` anchor scroll)
- **Removed:** fake metrics (2.3h response, 98% satisfaction, 12 agents, 1847 tickets), fake phone numbers, fake live chat, fake emergency partner contact list
- **Old components** (SupportHero, SupportFAQ, EnhancedSupportContact, SupportContact) are now dead code — safe to delete as follow-up

## Supabase Auth (Fixed — Mar 2026)
- `site_url` updated from `http://localhost:3000` to Replit dev domain
- `uri_allow_list` now includes `https://*.replit.app/**` for production deployments
- Magic link emails now redirect correctly to the app instead of localhost

## Next Steps
The project is ready for development. You can:
1. Continue building new features
2. Test the eSIM provisioning flow with real API credentials
3. Deploy to production using Replit's deployment features
4. Set up environment variables for production Supabase instance
