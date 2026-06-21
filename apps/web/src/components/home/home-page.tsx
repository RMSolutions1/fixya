'use client';

import Link from 'next/link';
import { PublicLayout } from '@/components/layout/public-layout';
import { HeroBannerSlider } from '@/components/marketing/hero-banner-slider';
import { ArgentinaPillars } from '@/components/brand/argentina-pillars';
import { WhyFixYaSection } from '@/components/marketing/why-fixya-section';
import { ContactCtaSection } from '@/components/marketing/contact-cta-section';
import { SectionHeading } from '@/components/marketing/section-heading';
import { CategoryPill, HowItWorks } from '@/components/marketing/marketing-blocks';
import { NearbyDiscoverySection } from '@/components/geo/nearby-discovery-section';
import { HomeAuthRedirect } from '@/components/home/home-auth-redirect';
import { useCategories, useMarketplaceStats } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';

export function HomePage() {
  const mounted = useMounted();
  const { data: categories } = useCategories(mounted);
  const { data: stats } = useMarketplaceStats(mounted);
  const topCategories = (categories ?? []).slice(0, 16);

  return (
    <>
      <HomeAuthRedirect />
      <PublicLayout
        hero={
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
        }
      >
        <div id="contenido">
          <NearbyDiscoverySection />
        </div>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="20 rubros"
              title="Todos los servicios de Argentina"
              description="Cada rubro con landing dedicada, profesionales con identidad revisada y precios en pesos."
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
        <HowItWorks />
        <ContactCtaSection />
      </PublicLayout>
    </>
  );
}
