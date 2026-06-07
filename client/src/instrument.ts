import * as Sentry from "@sentry/react";

let initialized = false;

/**
 * Initialise Sentry (incl. browser tracing). Called only after the user accepts
 * non-essential cookies (see lib/consent.ts) — browser tracing injects
 * sentry-trace/baggage headers, so it must stay off until consent is given.
 */
export function initSentry(): void {
  if (initialized) return;
  initialized = true;
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.2,
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/palopconnect\.com/,
      /^https:\/\/[a-z]+\.supabase\.co/,
    ],
    beforeSend(event) {
      const host = window.location.hostname;
      if (host === "localhost" || host.endsWith(".replit.dev")) return null;
      return event;
    },
  });
}

export { Sentry };
