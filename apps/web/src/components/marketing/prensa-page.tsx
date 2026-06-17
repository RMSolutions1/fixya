import Link from 'next/link';
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileText,
  Mail,
  Newspaper,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { COMPANY } from '@/lib/company-info';

const releases = [
  {
    date: 'Marzo 2026',
    title: 'FixYa presenta plataforma empresarial con wallet contable',
    summary:
      'Lanzamiento de capacidades multi-tenant, expediente digital completo e integración con Mercado Pago para empresas de servicios en Argentina.',
    tag: 'Producto',
  },
  {
    date: 'Enero 2026',
    title: 'FixYa abre registro de profesionales a nivel nacional',
    summary:
      'Apertura del marketplace con verificación de identidad, matrículas por rubro y cobertura en las 24 provincias.',
    tag: 'Lanzamiento',
  },
  {
    date: '2025',
    title: 'Validación con profesionales piloto en el NOA',
    summary:
      `Pruebas de campo en ${COMPANY.noaProvinces.join(', ')} con respaldo operativo de ${COMPANY.emprenorBrand}, empresa con trayectoria desde ${COMPANY.foundedYear}.`,
    tag: 'Hitos',
  },
];

const mediaKit = [
  { icon: FileText, label: 'Descripción corporativa FixYa + Emprenor', format: 'PDF bajo solicitud' },
  { icon: Download, label: 'Logo FixYa alta resolución', format: 'PNG / SVG' },
  { icon: Newspaper, label: 'Ficha técnica de la plataforma', format: 'PDF bajo solicitud' },
];

const facts = [
  { label: 'Operador legal', value: COMPANY.legalName },
  { label: 'Marca de servicios', value: `${COMPANY.emprenorBrand} — ${COMPANY.emprenorTagline}` },
  { label: 'Producto digital', value: COMPANY.fixyaBrand },
  { label: 'Experiencia en obra', value: `Desde ${COMPANY.foundedYear} en el NOA` },
  { label: 'Sede', value: COMPANY.address.short },
  { label: 'Cobertura FixYa', value: '24 provincias · Argentina' },
  { label: 'Pagos', value: 'Mercado Pago integrado' },
  { label: 'Fiscal', value: 'Integración Emitia (en desarrollo)' },
];

export function PrensaPage() {
  return (
    <div>
      <MarketingPageHero
        title="Sala de prensa"
        subtitle={`Comunicados, datos corporativos y contacto para medios. FixYa · ${COMPANY.legalName}`}
        narrow
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Comunicados"
          title="Últimas novedades"
          description="Para consultas sobre hitos comerciales, métricas oficiales o entrevistas, contactá al equipo de prensa."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {releases.map((r) => (
            <article key={r.title} className="card-argentina flex flex-col p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  {r.date}
                </span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
                  {r.tag}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{r.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {r.summary}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Contacto prensa"
                title="Consultas de medios"
                description="Respondemos solicitudes de entrevistas, material gráfico y datos verificados para publicaciones."
              />
              <div className="mt-8 space-y-4">
                <a
                  href={`mailto:${COMPANY.emails.press}`}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{COMPANY.emails.press}</p>
                    <p className="text-sm text-muted-foreground">Equipo de prensa FixYa</p>
                  </div>
                </a>
                <a
                  href={COMPANY.phoneHref}
                  className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{COMPANY.phone}</p>
                    <p className="text-sm text-muted-foreground">Lun - Vie · 8:00 - 20:00</p>
                  </div>
                </a>
              </div>
            </div>

            <div>
              <SectionHeading eyebrow="Kit de medios" title="Recursos disponibles" />
              <ul className="mt-8 space-y-3">
                {mediaKit.map(({ icon: Icon, label, format }) => (
                  <li
                    key={label}
                    className="flex items-center gap-4 rounded-xl border bg-card p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{format}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Solicitá material escribiendo a{' '}
                <a href={`mailto:${COMPANY.emails.press}`} className="text-primary hover:underline">
                  {COMPANY.emails.press}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Datos verificados"
          title="Ficha corporativa"
          description="Información oficial para redacciones y partners."
        />
        <dl className="mt-10 grid gap-4 sm:grid-cols-2">
          {facts.map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/nosotros">
              Sobre FixYa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="border-primary/30" asChild>
            <a href={COMPANY.website} target="_blank" rel="noopener noreferrer">
              Ver {COMPANY.emprenorBrand}
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </section>

      <MarketingPageCloser />
    </div>
  );
}
