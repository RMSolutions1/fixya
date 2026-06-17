import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { GroupBrandMark } from '@/components/brand/group-brand-mark';

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-primary/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Logo showSun showTagline />
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            Volver al inicio
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-primary/10 px-4 py-4 sm:px-6">
        <div className="flex justify-center">
          <GroupBrandMark showEmprenor />
        </div>
      </footer>
    </div>
  );
}
