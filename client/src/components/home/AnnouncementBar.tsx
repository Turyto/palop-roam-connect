import { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/language';

const DISMISS_KEY = 'palop-wc2026-bar-dismissed';
const SHOW_START = new Date('2026-06-11T00:00:00');
const SHOW_END = new Date('2026-07-20T00:00:00');

export default function AnnouncementBar() {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return false; }
  });

  const now = new Date();
  if (now < SHOW_START || now >= SHOW_END || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
  };

  const handleCta = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('worldcup-2026');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const bar = t.announcementBar;

  return (
    <div
      style={{ backgroundColor: '#1A1A1A', padding: '9px 20px' }}
      className="w-full flex items-center gap-3"
      data-testid="banner-announcement-wc"
    >
      <p className="flex-1 min-w-0 text-[13px] leading-snug flex items-center flex-wrap gap-x-2 gap-y-1" style={{ color: '#F5F5F0' }}>
        <span className="line-clamp-2 sm:line-clamp-1">{bar.text}</span>
        <a
          href="#worldcup-2026"
          onClick={handleCta}
          className="font-semibold whitespace-nowrap hover:underline shrink-0"
          style={{ color: '#2DB84B' }}
          data-testid="link-announcement-wc-cta"
        >
          {bar.cta}
        </a>
      </p>
      <button
        onClick={handleDismiss}
        aria-label="Fechar"
        className="shrink-0 hover:text-white transition-colors ml-1"
        style={{ color: '#888888' }}
        data-testid="button-dismiss-announcement-wc"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
