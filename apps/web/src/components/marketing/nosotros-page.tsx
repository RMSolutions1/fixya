import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  Eye,
  FileCheck,
  Globe,
  Handshake,
  Landmark,
  Mail,
  MapPin,
  Scale,
  Shield,
  Sparkles,
  Star,
  Users,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { ContactCtaSection } from '@/components/marketing/contact-cta-section';
import { ArgentinaStripes } from '@/components/brand/argentina-stripes';
import { COMPANY, corporateOwnershipLine, ecosystemSummary } from '@/lib/company-info';
import { GroupBusinessUnitsList } from '@/components/brand/group-business-units-list';

const heroStats = [
  { value: '24', label: 'Provincias' },
  { value: 'MP', label: 'Mercado Pago' },
  { value: 'Emitia', label: 'Fiscal (roadmap)' },
  { value: '100%', label: 'Expediente digital' },
];

const values = [
  {
    icon: Shield,
    title: 'Confianza',
    description:
      'Verificamos identidad, matrículas y antecedentes. Cada operación queda registrada con trazabilidad completa.',
  },
  {
    icon: Eye,
    title: 'Transparencia',
    description:
      'Presupuestos comparables, pagos con Mercado Pago y un expediente digital accesible para cliente y profesional.',
  },
  {
    icon: Scale,
    title: 'Cumplimiento',
    description:
      'Operamos conforme a la legislación argentina. La facturación fiscal ARCA, vía integración con Emitia, está en desarrollo dentro del ecosistema Grupo Emprenor.',
  },
  {
    icon: Star,
    title: 'Calidad',
    description:
      'Reseñas verificadas post-servicio, mediación en disputas y estándares claros en cada rubro.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    description:
      'Un ecosistema donde profesionales independientes crecen y hogares, PyMEs y empresas resuelven con respaldo.',
  },
];

const timeline = [
  {
    year: '2022',
    title: 'Fundación',
    description:
      'Nace RM International Group SAS en Argentina, con foco en tecnología aplicada a servicios y operaciones B2B.',
  },
  {
    year: '2023',
    title: 'Ecosistema Emprenor',
    description:
      'Desarrollo del ecosistema Emprenor: herramientas de gestión, wallet contable y bases para marketplaces verticales.',
  },
  {
    year: '2024',
    title: 'Validación FixYa',
    description:
      'Pruebas con profesionales piloto, definición de flujos de contratación, pagos y expediente digital.',
  },
  {
    year: '2025',
    title: 'Lanzamiento comercial',
    description:
      'Apertura de FixYa al público en Argentina: marketplace de servicios verificados con cobertura nacional.',
  },
  {
    year: '2026',
    title: 'Plataforma empresarial',
    description:
      'Wallet contable, CRM, documentación, integración fiscal y operaciones multi-tenant para empresas de servicios.',
  },
];

const platformCapabilities = [
  {
    icon: Globe,
    title: 'Marketplace geolocalizado',
    description: 'Búsqueda por zona, categoría y reputación en las 24 provincias.',
  },
  {
    icon: Wallet,
    title: 'Pagos con retención',
    description: 'Mercado Pago integrado. Fondos liberados al confirmar conformidad del trabajo.',
  },
  {
    icon: FileCheck,
    title: 'Expediente digital',
    description: 'Contratos, presupuestos, fotos y actas en un solo lugar por cada servicio.',
  },
  {
    icon: Landmark,
    title: 'Compliance fiscal',
    description: 'Comprobantes por operación hoy; facturación electrónica ARCA vía integración Emitia en desarrollo.',
  },
  {
    icon: Building2,
    title: 'Operación empresarial',
    description: 'Tenants, equipos de técnicos, supervisores y reportes para empresas de servicios.',
  },
  {
    icon: Handshake,
    title: 'Mediación y soporte',
    description: 'Canal de disputas, historial verificable y acompañamiento en cada etapa del servicio.',
  },
];

export function NosotrosPage() {
  return (
    <div>
      <MarketingPageHero
        title={
          <>
            Construimos la infraestructura de{' '}
            <span className="text-sol">confianza</span> para servicios en Argentina
          </>
        }
        subtitle={`FixYa es la unidad de negocio digital de ${COMPANY.groupBrand}: marketplace de servicios verificados operado por ${COMPANY.legalName}, con la experiencia en obra de ${COMPANY.emprenorBrand} desde ${COMPANY.emprenorFoundedYear}.`}
      >
        <div className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {heroStats.map(({ value, label }) => (
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

      {/* Intro + imagen */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-celeste">
            <Image
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80"
              alt="Edificios corporativos y skyline urbano en Argentina"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--celeste-dark)/0.85)] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-sol">
                Hecho en Argentina
              </p>
              <p className="mt-2 text-lg font-semibold">
                Del NOA al sur, conectamos talento con quienes necesitan resolver
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Quiénes somos"
              title="Más que un directorio: una plataforma operativa"
              description={`FixYa es la unidad digital de ${COMPANY.groupBrand}: resolver contratar servicios en Argentina con la misma seriedad que una obra industrial o un consorcio — accesible para cualquier hogar o PyME.`}
            />
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {ecosystemSummary()} Desarrollamos software propio para matching de profesionales,
              pagos seguros, documentación legal y seguimiento de cada trabajo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="bg-sol text-foreground shadow-sol hover:bg-sol/90" asChild>
                <Link href="/servicios">
                  Explorar servicios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="border-primary/30" asChild>
                <Link href="/para-quienes">¿Para quiénes es FixYa?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y visión */}
      <section className="border-y bg-secondary/40 py-20 pattern-grid-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card-argentina relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-primary/10" />
              <Sparkles className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-2xl font-bold">Misión</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Conectar a personas y empresas con profesionales verificados, con pagos seguros,
                trazabilidad completa y garantía en cada contratación — desde el primer mensaje
                hasta la factura final.
              </p>
            </div>
            <div className="card-argentina relative overflow-hidden p-8">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-sol/15" />
              <Globe className="h-8 w-8 text-[hsl(var(--sol))]" />
              <h2 className="mt-4 text-2xl font-bold">Visión</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Ser la plataforma de referencia para contratar servicios profesionales en Argentina,
                con operaciones transparentes, cumplimiento fiscal impecable y confianza en cada
                transacción — para hogares, oficios independientes y empresas de servicios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading
              eyebrow="Nuestros valores"
              title="Los principios que guían cada decisión"
              description="Desde el diseño del producto hasta el soporte al cliente, estos valores definen cómo operamos."
              align="center"
            />
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group card-argentina flex gap-4 p-6 hover:shadow-celeste">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plataforma / desarrollo */}
      <section className="relative overflow-hidden celeste-gradient py-20 text-white">
        <div className="pointer-events-none absolute inset-0 pattern-grid-subtle opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sol">
              Tecnología y desarrollo
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Plataforma propia, pensada para el mercado argentino
            </h2>
            <p className="mt-4 text-lg text-white/80">
              FixYa no es un template genérico: es software desarrollado por RM International Group
              SAS, con arquitectura moderna, geolocalización, pagos locales y cumplimiento fiscal
              integrado desde el diseño.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {platformCapabilities.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-sol/40 hover:bg-white/10"
              >
                <Icon className="h-7 w-7 text-sol" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Nuestra historia"
            title="Un camino de desarrollo continuo"
            description="Cada hito representa inversión en producto, validación con usuarios reales y expansión de capacidades."
          />
          <div className="relative mt-14">
            <div className="absolute left-[19px] top-2 hidden h-[calc(100%-1rem)] w-px bg-border md:left-1/2 md:block md:-translate-x-px" />
            <div className="space-y-10">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className={`relative flex flex-col gap-4 md:flex-row md:items-center ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  <div className="hidden flex-1 md:block" />
                  <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-card text-xs font-bold text-primary md:left-1/2 md:-translate-x-1/2">
                    {item.year.slice(2)}
                  </div>
                  <div className="card-argentina ml-14 flex-1 p-6 md:ml-0">
                    <span className="text-sm font-bold text-primary">{item.year}</span>
                    <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Empresa legal */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Grupo Emprenor"
                title={COMPANY.groupBrand}
                description={corporateOwnershipLine()}
              />
              <ul className="mt-8 space-y-4">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{COMPANY.address.full} · Cobertura FixYa en las 24 provincias</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    <a
                      href={COMPANY.groupWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {COMPANY.groupWebsite.replace('https://', '')}
                    </a>{' '}
                    · {COMPANY.emprenorBrand} ({COMPANY.emprenorTagline.toLowerCase()} desde{' '}
                    {COMPANY.emprenorFoundedYear})
                  </span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>
                    Consultas corporativas:{' '}
                    <a href={`mailto:${COMPANY.emails.general}`} className="text-primary hover:underline">
                      {COMPANY.emails.general}
                    </a>
                  </span>
                </li>
              </ul>
            </div>
            <div className="card-argentina p-8">
              <h3 className="text-lg font-semibold">Ecosistema {COMPANY.groupBrand}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {ecosystemSummary()}
              </p>
              <div className="mt-6 border-t border-primary/10 pt-6">
                <GroupBusinessUnitsList excludeCurrent={false} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="sm" asChild>
                  <Link href="/prensa">Sala de prensa</Link>
                </Button>
                <Button size="sm" variant="outline" className="border-primary/30" asChild>
                  <Link href="/faq">Preguntas frecuentes</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative">
        <ArgentinaStripes />
      </div>
      <ContactCtaSection />
    </div>
  );
}
