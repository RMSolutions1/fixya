'use client';

import dynamic from 'next/dynamic';
import { MarketplaceSkeleton } from '@/components/marketplace/marketplace-shell';

const MarketplaceClient = dynamic(
  () => import('@/components/marketplace/marketplace-client'),
  { ssr: false, loading: () => <MarketplaceSkeleton /> },
);

export default function MarketplaceLoader() {
  return <MarketplaceClient />;
}
