import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget: () => void;
      showWidget: () => void;
      setAttributes: (attrs: Record<string, string>, cb?: (err: unknown) => void) => void;
      onLoad?: () => void;
    };
  }
}

export function useTawk() {
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const api = window.Tawk_API;
    if (!api) return;

    if (isAdmin) {
      api.hideWidget?.();
    } else {
      api.showWidget?.();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin || !user?.email) return;

    const apply = () => {
      window.Tawk_API?.setAttributes?.(
        {
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? user.email ?? '',
        },
        (err) => { if (err) console.warn('[Tawk] setAttributes error:', err); }
      );
    };

    if (window.Tawk_API?.setAttributes) {
      apply();
    } else {
      const prev = window.Tawk_API?.onLoad;
      if (window.Tawk_API) {
        window.Tawk_API.onLoad = () => {
          prev?.();
          apply();
        };
      }
    }
  }, [user, isAdmin]);
}
