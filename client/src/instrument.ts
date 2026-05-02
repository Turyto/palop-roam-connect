import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  sendDefaultPii: false,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.2,
  beforeSend(event) {
    const host = window.location.hostname;
    if (host === "localhost" || host.endsWith(".replit.dev")) return null;
    return event;
  },
});

export { Sentry };
