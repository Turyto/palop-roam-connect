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
