let loaded = false;

/**
 * Injects the Tawk.to live-chat widget. Called only after the user accepts
 * non-essential cookies — the script is no longer hardcoded in index.html so
 * nothing loads (and no cookies are set) until consent is given.
 */
export function loadTawk(): void {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;

  const w = window as unknown as { Tawk_API?: unknown; Tawk_LoadStart?: Date };
  w.Tawk_API = w.Tawk_API || {};
  w.Tawk_LoadStart = new Date();

  const s1 = document.createElement('script');
  const s0 = document.getElementsByTagName('script')[0];
  s1.async = true;
  s1.src = 'https://embed.tawk.to/6a18529e6034501c34c0b384/1jpng5feu';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0?.parentNode?.insertBefore(s1, s0);
}
