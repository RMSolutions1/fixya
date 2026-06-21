import type { ReactNode } from 'react';
import { SiteTopBar } from '@/components/layout/site-top-bar';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

interface PublicLayoutProps {
  children: ReactNode;
  headerVariant?: 'default' | 'transparent';
  showTopBar?: boolean;
  /** Hero a pantalla completa con header superpuesto (home) */
  hero?: ReactNode;
}

export function PublicLayout({
  children,
  headerVariant = 'default',
  showTopBar = true,
  hero,
}: PublicLayoutProps) {
  if (hero) {
    return (
      <div className="flex min-h-screen flex-col">
        {showTopBar && <SiteTopBar />}
        <div className="relative">
          <SiteHeader variant="transparent" overlay />
          {hero}
        </div>
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showTopBar && <SiteTopBar />}
      <SiteHeader variant={headerVariant} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
