import { initAnalytics } from '@/analytics';
import { initSentry } from '@/instrument';
import { loadTawk } from '@/lib/tawk';

export type ConsentValue = 'accepted' | 'rejected';

const STORAGE_KEY = 'palop-cookie-consent';

// Runtime fallback so the user's choice is honoured within the session even
// when localStorage is unavailable (private mode, blocked cookies). It just
// won't survive a page reload in that case.
let runtimeConsent: ConsentValue | null = null;

export function getConsent(): ConsentValue | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'accepted' || v === 'rejected') return v;
  } catch {
    /* fall through to runtime value */
  }
  return runtimeConsent;
}

export function setConsent(value: ConsentValue): void {
  runtimeConsent = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* localStorage unavailable — runtimeConsent keeps it for this session */
  }
}

let servicesLoaded = false;

/**
 * Initialise non-essential third-party services (Sentry browser tracing, GA4,
 * Tawk.to live chat) — but ONLY if the user has actively accepted cookies.
 * Idempotent: safe to call on app start and again the moment the user accepts.
 * Essential services (Stripe, Supabase) are never gated, so checkout works
 * regardless of the consent choice.
 */
export function loadConsentedServices(): void {
  if (servicesLoaded) return;
  if (getConsent() !== 'accepted') return;
  servicesLoaded = true;
  initSentry();
  initAnalytics();
  loadTawk();
}
