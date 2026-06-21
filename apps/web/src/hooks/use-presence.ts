'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { apiRequest } from '@/lib/api';

const PRESENCE_INTERVAL_MS = 5 * 60 * 1000;

/** Mantiene lastLoginAt actualizado mientras el usuario usa la app (estado en línea). */
export function usePresencePing() {
  const token = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!token) return;

    const ping = () => {
      apiRequest<{ lastSeenAt: string }>('/auth/presence', {
        method: 'POST',
        token,
      }).catch(() => undefined);
    };

    ping();
    const id = window.setInterval(ping, PRESENCE_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token]);
}
