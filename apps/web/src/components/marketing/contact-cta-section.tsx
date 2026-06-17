import Link from 'next/link';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolDeMayo } from '@/components/brand/sol-de-mayo';
import { COMPANY } from '@/lib/company-info';
export function ContactCtaSection() {
  return (
    <section className="relative overflow-hidden celeste-gradient py-24 text-white">
      <div className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 opacity-10">
        <SolDeMayo size={320} />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-sol">
              Contáctenos
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Hagamos realidad tu próximo servicio
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Registrate, publicá tu necesidad o unite como profesional. Nuestro equipo te acompaña
              en cada paso — de punta a punta.
            </p>
            <div className="mt-8 space-y-4">
              <a
                href={COMPANY.phoneHref}
                className="flex items-center gap-3 text-white/90 transition-colors hover:text-sol"
              >
                <Phone className="h-5 w-5 shrink-0" />
                {COMPANY.phone}
              </a>
              <a
                href={`mailto:${COMPANY.emails.general}`}
                className="flex items-center gap-3 text-white/90 transition-colors hover:text-sol"
              >
                <Mail className="h-5 w-5 shrink-0" />
                {COMPANY.emails.general}
              </a>
              <p className="flex items-center gap-3 text-white/70">
                <MapPin className="h-5 w-5 shrink-0" />
                {COMPANY.address.short} · Cobertura nacional
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
            <h3 className="text-xl font-semibold">Empezá hoy</h3>
            <p className="mt-2 text-sm text-white/75">
              Creá tu cuenta en minutos. Sin costo de registro para clientes y profesionales.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-sol text-foreground hover:bg-sol/90" asChild>
                <Link href="/register">
                  Crear cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outlineOnDark"
                asChild
              >
                <Link href="/register">Solicitar cotización</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-white/50">
              Al registrarte aceptás nuestros{' '}
              <Link href="/terminos" className="underline hover:text-white">
                términos
              </Link>{' '}
              y{' '}
              <Link href="/privacidad" className="underline hover:text-white">
                privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
