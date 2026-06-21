'use client';

import { PublicLayout } from '@/components/layout/public-layout';
import { LocationProvider } from '@/components/providers/location-provider';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <PublicLayout>{children}</PublicLayout>
    </LocationProvider>
  );
}
