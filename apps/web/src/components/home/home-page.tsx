'use client';

import Link from 'next/link';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteTopBar } from '@/components/layout/site-top-bar';
import { HeroBannerSlider } from '@/components/marketing/hero-banner-slider';
import { ArgentinaPillars } from '@/components/brand/argentina-pillars';
import { TrustBadges } from '@/components/brand/trust-badges';
import { WhyFixYaSection } from '@/components/marketing/why-fixya-section';
import { ContactCtaSection } from '@/components/marketing/contact-cta-section';
import { SectionHeading } from '@/components/marketing/section-heading';
import {
  CategoryPill,
  ProfessionalCard,
  HowItWorks,
} from '@/components/marketing/marketing-blocks';
import {
  useCategories,
  useProfessionals,
  useMarketplaceStats,
} from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { SolDeMayo } from '@/components/brand/sol-de-mayo';

export function HomePage() {
  const mounted = useMounted();
  const { data: categories } = useCategories(mounted);
  const { data: professionalsData } = useProfessionals(undefined, mounted);
  const { data: stats } = useMarketplaceStats(mounted);

  const professionals = (professionalsData?.items ?? []).slice(0, 6);
  const topCategories = (categories ?? []).slice(0, 16);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteTopBar />
      <div className="relative">
        <SiteHeader variant="transparent" overlay />
        <HeroBannerSlider
          stats={
            stats
              ? {
                  professionalsCount: stats.professionalsCount,
                  categoriesCount: stats.categoriesCount,
                  verifiedProfessionalsCount: stats.verifiedProfessionalsCount,
                  completedRequests: stats.completedRequests,
                }
              : undefined
          }
        />
      </div>

      <div id="contenido">
        <TrustBadges />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Nuestros servicios"
            title="Soluciones integrales para cada necesidad"
            description="Desde el diseño hasta la entrega — profesionales especializados en cada área, como las empresas líderes del NOA."
          />
          <Link href="/servicios" className="text-sm font-semibold text-primary hover:underline">
            Explorar todos los servicios →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {topCategories.map((cat) => (
            <CategoryPill key={cat.id} slug={cat.slug} name={cat.name} count={cat.serviceCount} />
          ))}
        </div>
      </section>

      <ArgentinaPillars />
      <WhyFixYaSection />

      <section className="border-y bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Profesionales"
              title="Disponibles cerca tuyo"
              description="Perfiles verificados con reseñas reales y precios en pesos argentinos."
            />
            <Link href="/profesionales" className="text-sm font-semibold text-primary hover:underline">
              Ver directorio completo →
            </Link>
          </div>
          {professionals.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((pro) => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))}
            </div>
          ) : (
            <div className="card-argentina border-dashed p-16 text-center">
              <SolDeMayo size={64} className="mx-auto opacity-70" />
              <p className="mt-6 text-xl font-semibold">Tu provincia, tu profesional</p>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Estamos sumando talento en las 24 provincias. ¿Ofrecés un servicio? Registrate y
                empezá a recibir solicitudes.
              </p>
              <Link href="/login" className="mt-6 inline-block font-semibold text-primary hover:underline">
                Ingresar y registrarme →
              </Link>
            </div>
          )}
        </div>
      </section>

      <HowItWorks />
      <ContactCtaSection />
      <SiteFooter />
    </div>
  );
}
