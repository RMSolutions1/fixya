'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { getMobileBottomNav, type MobileNavItem } from '@/lib/dashboard-nav';

function isActive(pathname: string, item: MobileNavItem) {
  if (!item.href) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.memberships?.[0]?.role;
  const items = getMobileBottomNav(role);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/10 bg-card/95 backdrop-blur-md lg:hidden safe-bottom"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);

          if (item.action === 'menu') {
            return (
              <li key="menu" className="flex-1">
                <button
                  type="button"
                  onClick={onOpenMenu}
                  className="flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          }

          if (item.action === 'create' && item.href) {
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className="flex w-full flex-col items-center gap-0.5 px-1 py-1"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <Plus className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-semibold text-primary">{item.label}</span>
                </Link>
              </li>
            );
          }

          if (!item.href) return null;

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-primary',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
