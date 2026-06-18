let loaded = false;

/**
 * Injects the HubSpot tracking script (hs-script-loader). Called only after the
 * user accepts non-essential cookies — the script is not hardcoded in
 * index.html so nothing loads (and no HubSpot cookies are set) until consent is
 * given, keeping the site GDPR-compliant alongside GA4, Sentry and Tawk.to.
 *
 * EU data residency endpoint (js-eu1) — portal/account ID 148664632.
 */
export function loadHubspot(): void {
  if (loaded || typeof document === 'undefined') return;
  if (document.getElementById('hs-script-loader')) {
    loaded = true;
    return;
  }
  loaded = true;

  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.id = 'hs-script-loader';
  s.async = true;
  s.defer = true;
  s.src = 'https://js-eu1.hs-scripts.com/148664632.js';
  document.body.appendChild(s);
}
