'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { GroupBrandMark } from '@/components/brand/group-brand-mark';
import { GroupBrandBar } from '@/components/brand/group-brand-mark';
import { getDashboardNav, resolveDashboardRole } from '@/lib/dashboard-nav';
import { Home, LogOut } from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const role = resolveDashboardRole(user?.memberships?.[0]?.role);
  const navItems = getDashboardNav(role);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-primary/10 bg-card">
      <div className="border-b border-primary/10 bg-secondary/30 px-6 py-5">
        <Logo showTagline showSun />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
          <Link
            key={href}
            href={href}
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
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
        >
          <Home className="h-4 w-4" />
          Sitio público
        </Link>
      </nav>

      <div className="border-t p-4">
        <div className="mb-4 px-1">
          <GroupBrandMark showEmprenor />
        </div>
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

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <GroupBrandBar />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-secondary/40 to-background">
          <div className="mx-auto max-w-6xl p-6 sm:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
