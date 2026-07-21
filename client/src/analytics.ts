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
 * Resolve the GA4 client_id for server-side purchase attribution.
 * Resolves to "" (empty string) when analytics never initialised (no consent),
 * gtag is unavailable, errors, or after an 800ms timeout — it must NEVER
 * block or fail the checkout flow.
 */
export function getGaClientId(): Promise<string> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (id: string) => {
      if (settled) return;
      settled = true;
      resolve(id || '');
    };
    setTimeout(() => done(''), 800);
    try {
      if (!initialized) return done('');
      const GA4_ID = import.meta.env.VITE_GA4_ID;
      const g = (ReactGA as any).gtag ?? (window as any).gtag;
      if (!GA4_ID || typeof g !== 'function') return done('');
      g('get', GA4_ID, 'client_id', (id: unknown) => done(typeof id === 'string' ? id : ''));
    } catch {
      done('');
    }
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
