import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building,
  Building2,
  Home,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { COMPANY } from '@/lib/company-info';

const audiences = [
  {
    icon: Home,
    title: 'Hogares y familias',
    description:
      'Gasistas, plomeros, electricistas y cuidadores en tu barrio. Pagá con Mercado Pago, recibí factura y seguí cada etapa en el expediente digital.',
    benefits: [
      'Profesionales verificados con reseñas reales',
      'Presupuestos comparables antes de contratar',
      'Pago retenido hasta tu conformidad',
      'Factura fiscal en cada servicio',
    ],
    cta: { href: '/servicios', label: 'Buscar servicios' },
    accent: 'celeste' as const,
  },
  {
    icon: Wrench,
    title: 'Profesionales del oficio',
    description:
      'Del campo a la capital: más clientes, cotizaciones online, cobros en pesos con MP y reputación que crece con cada trabajo bien hecho.',
    benefits: [
      'Solicitudes geolocalizadas en tu zona',
      'Perfil profesional con servicios y precios',
      'Cobro seguro vía Mercado Pago',
      'Expediente y historial por cada trabajo',
    ],
    cta: { href: '/register?role=PROFESIONAL', label: 'Registrarme como profesional' },
    accent: 'sol' as const,
  },
  {
    icon: Building2,
    title: 'Empresas de servicios',
    description:
      'Gestioná técnicos, supervisores y back-office en un solo tenant. Wallet contable, CRM, documentación y compliance para operar a escala.',
    benefits: [
      'Multi-tenant con roles y permisos',
      'Wallet contable integrada',
      'CRM y seguimiento de equipos',
      'Reportes y trazabilidad por obra o cliente',
    ],
    cta: { href: '/register?role=EMPRESA', label: 'Registrar mi empresa' },
    accent: 'celeste' as const,
  },
  {
    icon: Building,
    title: 'Edificios y consorcios',
    description:
      'Centralizá mantenimiento preventivo, proveedores recurrentes e historial por unidad funcional con documentación completa.',
    benefits: [
      'Proveedores recurrentes verificados',
      'Historial por unidad o espacio común',
      'Presupuestos y actas digitalizadas',
      'Control de gastos y facturación',
    ],
    cta: { href: '/register', label: 'Registrar consorcio' },
    accent: 'pampa' as const,
  },
  {
    icon: Store,
    title: 'PyMEs y comercios',
    description:
      'Contratá servicios para tu local con factura fiscal, plazos definidos y un único punto de contacto para todas tus necesidades operativas.',
    benefits: [
      'Un solo panel para múltiples rubros',
      'Factura y comprobantes centralizados',
      'Profesionales con experiencia comercial',
      'Soporte y mediación FixYa',
    ],
    cta: { href: '/servicios', label: 'Ver rubros disponibles' },
    accent: 'celeste' as const,
  },
];

const accentClass = {
  celeste: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground',
  sol: 'bg-sol/15 text-[hsl(var(--sol))] group-hover:bg-sol group-hover:text-foreground',
  pampa: 'bg-pampa/10 text-pampa group-hover:bg-pampa group-hover:text-white',
};

export function ParaQuienesPage() {
  return (
    <div>
      <MarketingPageHero
        title={
          <>
            Una plataforma para{' '}
            <span className="text-sol">cada actor</span> del ecosistema de servicios
          </>
        }
        subtitle={`FixYa conecta hogares, profesionales, empresas y consorcios con la infraestructura de confianza de ${COMPANY.groupBrand} — respaldada por ${COMPANY.emprenorBrand} en el NOA desde ${COMPANY.emprenorFoundedYear}.`}
      >
        <div className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { value: '5', label: 'Segmentos' },
            { value: '24', label: 'Provincias' },
            { value: String(COMPANY.emprenorFoundedYear), label: 'Experiencia NOA' },
            { value: 'MP', label: 'Mercado Pago' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center backdrop-blur-sm"
            >
              <p className="text-2xl font-bold tabular-nums text-sol">{value}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">
                {label}
              </p>
            </div>
          ))}
        </div>
      </MarketingPageHero>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Audiencias"
          title="Diseñado para quien contrata y para quien trabaja"
          description="Cada perfil tiene herramientas específicas, pero todos comparten pagos seguros, expediente digital y cumplimiento fiscal."
        />
        <div className="mt-14 space-y-8">
          {audiences.map(({ icon: Icon, title, description, benefits, cta, accent }) => (
            <div
              key={title}
              className="group card-argentina grid gap-8 p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center"
            >
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl transition-colors ${accentClass[accent]}`}
              >
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{description}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="shrink-0 bg-sol text-foreground shadow-sol hover:bg-sol/90" asChild>
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y bg-secondary/40 py-20 pattern-grid-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl shadow-celeste">
              <Image
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80"
                alt="Equipo de construcción y servicios en obra"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Respaldo Emprenor"
                title="Experiencia real en construcción y servicios del NOA"
                description={`${COMPANY.emprenorBrand} opera desde ${COMPANY.foundedYear} en Salta, Jujuy, Tucumán y Formosa con obras documentadas, presupuestos por escrito y cumplimiento de plazos.`}
              />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                FixYa es la evolución digital de esa experiencia: la misma exigencia en calidad y
                transparencia, aplicada a un marketplace nacional con tecnología, Mercado Pago y
                expediente digital. Conocé el grupo en{' '}
                <a
                  href={COMPANY.groupWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  grupo.emprenor.com
                </a>{' '}
                y la obra en{' '}
                <a
                  href={COMPANY.emprenorWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  emprenor.com
                </a>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {COMPANY.segments.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <Users className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-3xl font-bold">¿No encontrás tu perfil?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Escribinos y te orientamos sobre la mejor forma de usar FixYa según tu necesidad.
          </p>
          <Button className="mt-8" size="lg" asChild>
            <a href={`mailto:${COMPANY.emails.general}`}>Contactar al equipo</a>
          </Button>
        </div>
      </section>

      <MarketingPageCloser />
    </div>
  );
}
