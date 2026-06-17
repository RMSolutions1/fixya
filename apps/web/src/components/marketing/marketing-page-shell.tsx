import type { ReactNode } from 'react';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';

interface MarketingPageShellProps {
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  heroExtra?: ReactNode;
  showCloser?: boolean;
}

export function MarketingPageShell({
  title,
  subtitle,
  children,
  heroExtra,
  showCloser = true,
}: MarketingPageShellProps) {
  return (
    <div>
      <MarketingPageHero title={title} subtitle={subtitle}>
        {heroExtra}
      </MarketingPageHero>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">{children}</section>
      {showCloser && <MarketingPageCloser />}
    </div>
  );
}
