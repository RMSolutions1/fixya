'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { getDashboardNav, resolveDashboardRole } from '@/lib/dashboard-nav';

function SidebarNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = resolveDashboardRole(user?.memberships?.[0]?.role);
  const navItems = getDashboardNav(role);

  const handleLogout = () => {
    logout();
    router.push('/login');
    onNavigate?.();
  };

  return (
    <aside className={cn('flex h-full flex-col border-r border-primary/10 bg-card', className)}>
      <div className="border-b border-primary/10 bg-secondary/30 px-6 py-5">
        <Logo showTagline showSun />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        {user && (
          <div className="mb-3 px-3">
            <p className="text-sm font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-primary">{role}</p>
          </div>
        )}
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}

export function AppSidebar() {
  return <SidebarNav className="hidden h-screen w-64 lg:flex" />;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <AppSidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] shadow-xl">
            <SidebarNav onNavigate={() => setMobileOpen(false)} className="h-full w-full" />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="safe-top flex items-center gap-3 border-b bg-card px-4 py-3 lg:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Abrir menú completo"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Logo />
        </header>
        <main className="flex-1 overflow-auto bg-gradient-to-br from-secondary/40 to-background pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
        <MobileBottomNav onOpenMenu={() => setMobileOpen(true)} />
      </div>
    </div>
  );
}
