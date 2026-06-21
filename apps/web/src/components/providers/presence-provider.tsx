'use client';

import { usePresencePing } from '@/hooks/use-presence';

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  usePresencePing();
  return <>{children}</>;
}
