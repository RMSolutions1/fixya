'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProfessionalCard, EmptyState } from '@/components/marketing/marketing-blocks';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { SectionHeading } from '@/components/marketing/section-heading';
import { LocationBar } from '@/components/geo/location-bar';
import { GeoMap, professionalsToMarkers } from '@/components/geo/geo-map';
import { useLocation } from '@/components/providers/location-provider';
import { useNearbyProfessionals, useCategories } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { RegistryLogo } from '@/components/professionals/registry-logo';
import { getRegistryById } from '@/lib/professional-registries';
import { cn } from '@/lib/utils';

/** Padrones ya sincronizados en FixYa (filtro rápido en directorio) */
const DIRECTORY_REGISTRY_IDS = ['copaipa', 'gasnor'] as const;

export default function ProfesionalesPageClient() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const catSlug = searchParams.get('cat') ?? undefined;
  const registryParam = searchParams.get('registry') ?? undefined;
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [search, setSearch] = useState(initialQ);
  const [showFilters, setShowFilters] = useState(false);
  const [registryId, setRegistryId] = useState<string | undefined>(registryParam);

  const { location, radiusKm } = useLocation();
  const { data: categories } = useCategories(mounted);
  const activeCategory = categories?.find((c) => c.slug === catSlug);
  const activeRegistry = registryId ? getRegistryById(registryId) : undefined;

  const geoParams = {
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm,
    categorySlug: catSlug,
    registryId,
    q: search || undefined,
  };

  const { data, isLoading, isError } = useNearbyProfessionals(geoParams, mounted);
  const professionals = data?.items ?? [];

  return (
    <>
      <MarketingPageShell
        showCloser={false}
        title={
          <>
            Profesionales <span className="text-sol">cerca tuyo</span>
          </>
        }
        subtitle={`Mapa por proximidad${activeCategory ? ` · ${activeCategory.name}` : ''} · De La Quiaca a Tierra del Fuego`}
        heroExtra={
          <div className="mt-6 space-y-4">
            <LocationBar variant="dark" />
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-1 gap-2 rounded-full bg-white p-1.5 sm:max-w-xl">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="border-0 bg-transparent pl-4 text-foreground shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => e.key === 'Enter' && setSearch(q)}
                />
                <Button variant="emprenor" className="rounded-full" onClick={() => setSearch(q)} aria-label="Buscar">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outlineOnDark" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>
            {showFilters && catSlug && (
              <Button variant="secondary" size="sm" asChild>
                <Link href="/profesionales">Quitar filtro categoría</Link>
              </Button>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-white/80">Fuente habilitante:</span>
              <Button
                type="button"
                variant={registryId ? 'outlineOnDark' : 'emprenor'}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setRegistryId(undefined)}
              >
                Todos
              </Button>
              {DIRECTORY_REGISTRY_IDS.map((id) => {
                const reg = getRegistryById(id);
                if (!reg) return null;
                const active = registryId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRegistryId(active ? undefined : id)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-white bg-white text-primary shadow-sm'
                        : 'border-white/30 bg-white/10 text-white hover:bg-white/20',
                    )}
                  >
                    <RegistryLogo
                      acronym={reg.acronym}
                      brandColor={reg.brandColor ?? '#1e3a5f'}
                      logoPath={reg.logoPath ?? `/images/registries/${reg.id}.svg`}
                      size={22}
                    />
                    {reg.acronym}
                  </button>
                );
              })}
            </div>
            {activeRegistry && (
              <p className="text-xs text-white/75">
                Mostrando matriculados según padrón oficial de {activeRegistry.name}.
              </p>
            )}
          </div>
        }
      >
        <SectionHeading
          eyebrow="Mapa interactivo"
          title={`${data?.meta.total ?? 0} profesionales en ${radiusKm} km`}
          description="OpenStreetMap · Click en un marcador para ver el perfil · Radio ajustable arriba"
        />

        <div className="mb-10 h-96">
          <GeoMap
            center={{ lat: location.latitude, lng: location.longitude }}
            markers={professionalsToMarkers(professionals)}
            radiusKm={radiusKm}
            zoom={10}
            onMarkerClick={(id) => router.push(`/profesionales/${id}`)}
          />
        </div>

        <SectionHeading
          eyebrow="Directorio"
          title="Perfiles con reseñas y precios en pesos"
          description="Compará profesionales, revisá calificaciones y contactá con respaldo FixYa."
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : isError || professionals.length === 0 ? (
          <EmptyState
            title="No hay profesionales en este radio"
            description="Ampliá el radio de búsqueda, elegí otra provincia o explorá por rubro."
            action={
              <Button variant="emprenor" asChild>
                <Link href="/servicios">Ver categorías</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        )}
      </MarketingPageShell>
      <MarketingPageCloser />
    </>
  );
}
