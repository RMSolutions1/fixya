'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useMounted } from '@/hooks/use-mounted';

const navLinks = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/profesionales', label: 'Profesionales' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/para-quienes', label: '¿Para quiénes?' },
];

interface SiteHeaderProps {
  variant?: 'default' | 'transparent';
  className?: string;
  overlay?: boolean;
}

export function SiteHeader({
  variant = 'default',
  className,
  overlay = false,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const storeAuthed = useAuthStore((s) => s.isAuthenticated());
  const isAuthenticated = mounted && storeAuthed;
  const isTransparent = variant === 'transparent';

  return (
    <header
      className={cn(
        'z-50 border-b transition-colors',
        overlay ? 'absolute inset-x-0 top-0 border-white/10 bg-transparent' : 'sticky top-0',
        !overlay &&
          (isTransparent
            ? 'border-white/10 bg-[hsl(var(--celeste-dark)/0.85)] backdrop-blur-md'
            : 'border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90'),
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Logo showTagline variant={isTransparent || overlay ? 'light' : 'dark'} />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isTransparent || overlay
                  ? pathname === href
                    ? 'bg-white/15 text-white'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                  : pathname === href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <Button size="sm" className="shadow-celeste" asChild>
              <Link href="/dashboard">Mi panel</Link>
            </Button>
          ) : (
            <>
              <Button
                variant={isTransparent || overlay ? 'ghostOnDark' : 'ghost'}
                size="sm"
                asChild
              >
                <Link href="/login">Ingresar</Link>
              </Button>
              <Button
                size="sm"
                variant={isTransparent || overlay ? 'outlineOnDark' : 'outline'}
                className={isTransparent || overlay ? undefined : 'border-primary/30'}
                asChild
              >
                <Link href="/register">Registrarse</Link>
              </Button>
              <Button size="sm" className="bg-sol text-foreground shadow-sol hover:bg-sol/90" asChild>
                <Link href="/register">Solicitar servicio</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn(
            'rounded-md p-2 lg:hidden',
            isTransparent || overlay ? 'text-white' : 'text-foreground',
          )}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {label}
              </Link>
            ))}
            <hr className="my-2" />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-primary"
              >
                Mi panel
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm">
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-primary"
                >
                  Solicitar servicio
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
