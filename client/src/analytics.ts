import ReactGA from 'react-ga4';

let initialized = false;

/**
 * Initialise Google Analytics 4. Called only after the user accepts
 * non-essential cookies (see lib/consent.ts). No-op if no GA4 id is configured.
 */
export function initAnalytics(): void {
  if (initialized) return;
  const GA4_ID = import.meta.env.VITE_GA4_ID;
  if (!GA4_ID) return;
  initialized = true;
  ReactGA.initialize(GA4_ID, {
    gaOptions: { anonymizeIp: true },
  });
}

/**
 * Send a GA4 event. Safe no-op when analytics was never initialised
 * (consent declined or no GA4 id configured) — never throws, so
 * analytics can never break the app or the checkout.
 */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!initialized) return;
  try {
    ReactGA.event(name, params ?? {});
  } catch {
    /* analytics must never break the app */
  }
}
