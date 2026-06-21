import Link from 'next/link';
import { ArgentinaStripes } from '@/components/brand/argentina-stripes';
import { Logo } from '@/components/layout/logo';
import { COMPANY } from '@/lib/company-info';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t bg-card">
      <ArgentinaStripes />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo showSun />
          <p className="max-w-xl text-sm text-muted-foreground">
            © {year} {COMPANY.fixyaBrand}. Todos los derechos reservados.
          </p>
          <p className="max-w-xl text-sm text-muted-foreground">
            {COMPANY.fixyaBrand} es un producto digital de{' '}
            <Link
              href={COMPANY.groupWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {COMPANY.groupBrand}
            </Link>
            {' '}— marketplace de servicios profesionales en Argentina.
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Operado por {COMPANY.legalName}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <Link href="/terminos" className="hover:text-primary hover:underline">
              Términos
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacidad" className="hover:text-primary hover:underline">
              Privacidad
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/cookies" className="hover:text-primary hover:underline">
              Cookies
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/arrepentimiento" className="hover:text-primary hover:underline">
              Botón de arrepentimiento
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
