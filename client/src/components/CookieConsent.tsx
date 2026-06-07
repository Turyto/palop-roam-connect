import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language';
import { getConsent, setConsent, loadConsentedServices } from '@/lib/consent';

export default function CookieConsent() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const c = t.cookieConsent;

  const handleAccept = () => {
    setConsent('accepted');
    loadConsentedServices();
    setVisible(false);
  };

  const handleReject = () => {
    setConsent('rejected');
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={c.title}
      data-testid="banner-cookie-consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground" data-testid="text-cookie-title">
            {c.title}
          </p>
          <p className="text-sm text-muted-foreground" data-testid="text-cookie-message">
            {c.message}{' '}
            <a
              href="/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-foreground"
              data-testid="link-cookie-privacy"
            >
              {c.privacyLink}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleReject}
            data-testid="button-reject-cookies"
          >
            {c.reject}
          </Button>
          <Button onClick={handleAccept} data-testid="button-accept-cookies">
            {c.accept}
          </Button>
        </div>
      </div>
    </div>
  );
}
