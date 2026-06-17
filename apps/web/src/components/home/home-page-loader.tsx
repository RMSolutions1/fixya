'use client';

import dynamic from 'next/dynamic';
import { HomePageSkeleton } from '@/components/home/home-page-skeleton';

const HomePage = dynamic(
  () => import('@/components/home/home-page').then((m) => m.HomePage),
  { ssr: false, loading: () => <HomePageSkeleton /> },
);

export default function HomePageLoader() {
  return <HomePage />;
}
