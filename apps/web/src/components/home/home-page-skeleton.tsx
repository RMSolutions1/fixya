import { SiteTopBar } from '@/components/layout/site-top-bar';
import { SiteFooter } from '@/components/layout/site-footer';

export function HomePageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteTopBar />
      <div className="min-h-[88vh] animate-pulse celeste-gradient" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-16 sm:px-6">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
