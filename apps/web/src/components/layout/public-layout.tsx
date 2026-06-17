import { SiteTopBar } from '@/components/layout/site-top-bar';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

export function PublicLayout({
  children,
  headerVariant = 'default',
  showTopBar = true,
}: {
  children: React.ReactNode;
  headerVariant?: 'default' | 'transparent';
  showTopBar?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {showTopBar && <SiteTopBar />}
      <SiteHeader variant={headerVariant} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
