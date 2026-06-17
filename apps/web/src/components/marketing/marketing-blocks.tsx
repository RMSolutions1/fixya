'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Star, MapPin } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/category-icons';
import type { ProfessionalSummary } from '@/hooks/use-marketplace';

interface ProfessionalCardProps {
  professional: ProfessionalSummary;
}

export function ProfessionalCard({ professional }: ProfessionalCardProps) {
  const fullName = `${professional.firstName} ${professional.lastName}`;

  return (
    <Card className="card-argentina group overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/profesionales/${professional.id}`} className="block p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary ring-2 ring-primary/10">
              {professional.firstName[0]}
              {professional.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold group-hover:text-primary">{fullName}</h3>
                {professional.verified && (
                  <Badge variant="success" className="text-[10px]">
                    Verificado
                  </Badge>
                )}
                {professional.pendingApproval && !professional.verified && (
                  <Badge variant="secondary" className="text-[10px]">
                    En verificación
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{professional.specialty}</p>
              {(professional.city || professional.province) && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {[professional.city, professional.province].filter(Boolean).join(', ')}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-sol text-sol" />
                  {Number(professional.ratingAvg).toFixed(1)} ({professional.ratingCount})
                </span>
                {professional.available && (
                  <span className="text-pampa">● Disponible</span>
                )}
              </div>
            </div>
          </div>
          {professional.minPrice !== null && (
            <div className="mt-4 flex items-end justify-between border-t pt-4">
              <div>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(professional.minPrice)}
                </p>
                <p className="text-xs text-muted-foreground">desde / servicio</p>
              </div>
              <span className={buttonVariants({ size: 'sm' })}>Contratar</span>
            </div>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}

export function HeroSearch() {
  const router = useRouter();

  return (
    <form
      className="mx-auto flex max-w-2xl gap-2 rounded-2xl bg-white p-2 shadow-celeste ring-1 ring-white/50"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q') as string;
        router.push(q ? `/profesionales?q=${encodeURIComponent(q)}` : '/profesionales');
      }}
    >
      <Input
        name="q"
        placeholder="¿Qué servicio necesitás? Ej: plomero, gasista, electricista..."
        className="border-0 bg-transparent pl-4 text-foreground shadow-none focus-visible:ring-0"
      />
      <Button type="submit" className="rounded-xl px-6 shadow-celeste">
        <Search className="mr-2 h-4 w-4" />
        Buscar
      </Button>
    </form>
  );
}

export function CategoryPill({
  slug,
  name,
  count,
}: {
  slug: string;
  name: string;
  count?: number;
}) {
  return (
    <Link
      href={`/profesionales?cat=${slug}`}
      className="flex flex-col items-center gap-2 rounded-2xl border bg-card p-4 text-center transition-all hover:border-primary/40 hover:shadow-celeste"
    >
      <span className="text-3xl">{getCategoryIcon(slug)}</span>
      <span className="text-sm font-medium">{name}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-primary">{count} disp.</span>
      )}
    </Link>
  );
}

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Consulta inicial',
      description: 'Describí tu necesidad, zona y urgencia. Publicá o buscá directamente un profesional.',
    },
    {
      step: '02',
      title: 'Compará presupuestos',
      description: 'Recibí cotizaciones, compará precios y elegí con información clara en pesos.',
    },
    {
      step: '03',
      title: 'Contratá con confianza',
      description: 'Aceptá el presupuesto, firmá digitalmente y abrí tu expediente FixYa.',
    },
    {
      step: '04',
      title: 'Pagá con Mercado Pago',
      description: 'Fondos retenidos de forma segura hasta que confirmes la conformidad del trabajo.',
    },
    {
      step: '05',
      title: 'Entrega y garantía',
      description: 'Liberación de fondos, comprobante de la operación y reseña verificada. Trazabilidad completa.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[hsl(var(--celeste-dark))] py-24 text-white">
      <div className="pointer-events-none absolute inset-0 pattern-grid-subtle opacity-10" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-sol">
            Nuestro proceso
          </span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Metodología probada</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/70">
            Cinco pasos que garantizan resultados excepcionales — inspirado en las mejores empresas
            de servicios del país
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-colors hover:border-sol/40 hover:bg-white/10"
            >
              <span className="text-4xl font-bold text-sol/90">{step.step}</span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProCta() {
  return (
    <section className="hero-gradient relative overflow-hidden py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold">¿Sos del oficio? Sumate a FixYa</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/75">
          Plomeros, gasistas, mecánicos, docentes — todo el talento argentino merece más clientes,
          cobros seguros y herramientas profesionales.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="emprenor" asChild>
            <Link href="/register?role=PROFESIONAL">Registrarme como profesional</Link>
          </Button>
          <Button size="lg" variant="outlineOnDark" asChild>
            <Link href="/para-quienes">Conocé los beneficios</Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { title: 'Clientes reales', desc: 'Solicitudes de todo el país, todos los días' },
            { title: 'Cobrá con MP', desc: 'Mercado Pago integrado, en pesos argentinos' },
            { title: 'Tu reputación', desc: 'Reseñas verificadas que impulsan tu negocio' },
          ].map((item) => (
            <div key={item.title} className="card-glass rounded-2xl p-6">
              <h4 className="font-semibold">{item.title}</h4>
              <p className="mt-2 text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <MapPin className="mb-4 h-12 w-12 text-muted-foreground/40" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
