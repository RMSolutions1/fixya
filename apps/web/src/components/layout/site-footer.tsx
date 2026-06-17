import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { ArgentinaStripes } from '@/components/brand/argentina-stripes';
import { COMPANY, corporateOwnershipLine } from '@/lib/company-info';
import { GroupBusinessUnitsList } from '@/components/brand/group-business-units-list';

const platformLinks = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/profesionales', label: 'Profesionales' },
  { href: '/para-quienes', label: '¿Para quiénes?' },
];

const legalLinks = [
  { href: '/terminos', label: 'Términos y Condiciones' },
  { href: '/privacidad', label: 'Política de Privacidad' },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t bg-card">
      <ArgentinaStripes />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1">
            <Logo showTagline showSun />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {COMPANY.fixyaTagline}. Plataforma digital del {COMPANY.groupBrand} — celeste,
              confianza y tecnología para conectar a todo el país.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{COMPANY.address.short} · {COMPANY.legalName}</span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Plataforma</h4>
            <ul className="space-y-2">
              {platformLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">FixYa</h4>
            <ul className="space-y-2">
              {[
                { href: '/nosotros', label: 'Nosotros' },
                { href: '/prensa', label: 'Sala de prensa' },
                { href: '/faq', label: 'Preguntas frecuentes' },
                { href: '/register?role=PROFESIONAL', label: 'Ser profesional' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Grupo Emprenor</h4>
            <GroupBusinessUnitsList compact />
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <a href={`mailto:${COMPANY.emails.legal}`} className="hover:text-primary">
                {COMPANY.emails.legal}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t pt-8 text-center">
          <p className="text-xs font-medium tracking-widest text-primary/80">
            CELESTE Y BLANCO · ORGULLO ARGENTINO
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {COMPANY.fixyaBrand} · {COMPANY.groupBrand} · Todos los
            derechos reservados
          </p>
          <p className="max-w-2xl text-[11px] leading-relaxed text-muted-foreground/80">
            {corporateOwnershipLine()}
          </p>
        </div>
      </div>
    </footer>
  );
}
