'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Shield, Zap } from 'lucide-react';
import type { CategoryCatalogEntry } from '@/lib/category-catalog';
import { getCategoryFaqs } from '@/lib/category-catalog';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { ProfessionalCard } from '@/components/marketing/marketing-blocks';
import { LocationBar } from '@/components/geo/location-bar';
import { GeoMap, professionalsToMarkers } from '@/components/geo/geo-map';
import { useLocation } from '@/components/providers/location-provider';
import { useNearbyProfessionals, useNearbyStats } from '@/hooks/use-marketplace';
import { getCategoryIcon } from '@/lib/category-icons';
import { Button } from '@/components/ui/button';
import { RegistryVerificationPanel } from '@/components/marketing/registry-verification-panel';

export default function CategoryLandingClient({ catalog }: { catalog: CategoryCatalogEntry }) {
  const router = useRouter();
  const { location, radiusKm } = useLocation();
  const geoParams = {
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm,
    categorySlug: catalog.slug,
  };

  const { data: stats } = useNearbyStats(geoParams);
  const { data: prosData, isLoading } = useNearbyProfessionals(geoParams);
  const professionals = prosData?.items ?? [];
  const count = stats?.professionalsCount ?? prosData?.meta.total ?? 0;

  const faqs = getCategoryFaqs(catalog);

  return (
    <>
      <MarketingPageShell
        showCloser={false}
        title={
          <>
            {getCategoryIcon(catalog.slug)} {catalog.name}{' '}
            <span className="text-sol">cerca tuyo</span>
          </>
        }
        subtitle={catalog.tagline}
        heroExtra={
          <div className="mt-6 space-y-4">
            <LocationBar variant="dark" />
            <p className="text-lg text-white/90">
              {count > 0 ? (
                <>
                  <strong className="text-sol">{count}</strong> profesional{count !== 1 ? 'es' : ''}{' '}
                  de {catalog.name.toLowerCase()} en un radio de {radiusKm} km
                </>
              ) : (
                <>Buscá {catalog.name.toLowerCase()} en las 24 provincias — ampliá el radio o cambiá de zona</>
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="emprenor" asChild>
                <Link href={`/register?role=CLIENTE`}>Solicitar {catalog.name.toLowerCase()}</Link>
              </Button>
              <Button size="lg" variant="outlineOnDark" asChild>
                <Link href="/profesionales">Ver todos en mapa</Link>
              </Button>
            </div>
          </div>
        }
      >
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Sobre este servicio</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">{catalog.longDescription}</p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-medium text-primary">
                Desde ${catalog.priceFrom.toLocaleString('es-AR')} / {catalog.priceUnit}
              </span>
              {catalog.requiresLicense && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" /> Matrícula revisada
                </span>
              )}
              {catalog.urgentAvailable && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4" /> Urgencias disponibles
                </span>
              )}
            </div>
            <ul className="mt-8 space-y-3">
              {catalog.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-pampa" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div className="h-80 lg:h-full min-h-[320px]">
            <GeoMap
              center={{ lat: location.latitude, lng: location.longitude }}
              markers={professionalsToMarkers(professionals)}
              radiusKm={radiusKm}
              onMarkerClick={(id) => router.push(`/profesionales/${id}`)}
            />
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold">
          Profesionales de {catalog.name} en tu zona
        </h2>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        ) : (
          <div className="card-argentina border-dashed p-10 text-center">
            <p className="font-semibold">Próximamente en {location.label}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿Sos {catalog.name.toLowerCase()}? Sé el primero en tu zona.
            </p>
            <Button className="mt-4" variant="emprenor" asChild>
              <Link href={`/register?role=PROFESIONAL`}>Registrarme como profesional</Link>
            </Button>
          </div>
        )}

        {faqs.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="card-argentina p-5">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <RegistryVerificationPanel
          categorySlug={catalog.slug}
          province={location.label.split(',')[0]?.trim()}
        />
      </MarketingPageShell>
      <MarketingPageCloser />
    </>
  );
}
