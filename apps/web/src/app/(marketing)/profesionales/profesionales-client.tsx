'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProfessionalCard, EmptyState } from '@/components/marketing/marketing-blocks';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { SectionHeading } from '@/components/marketing/section-heading';
import { LocationBar } from '@/components/geo/location-bar';
import { GeoMap, professionalsToMarkers } from '@/components/geo/geo-map';
import { NearbyEmptyHint } from '@/components/geo/nearby-empty-hint';
import { useLocation } from '@/components/providers/location-provider';
import {
  useInfiniteNearbyProfessionals,
  useNearbyMapMarkers,
  useCategories,
  type ProfessionalSummary,
} from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import { getRegistryById } from '@/lib/professional-registries';

/** Padrones ya sincronizados en FixYa (filtro rápido en directorio) */
const DIRECTORY_REGISTRY_IDS = ['copaipa', 'gasnor', 'aguas-del-norte'] as const;

function dedupeProfessionals(items: ProfessionalSummary[]): ProfessionalSummary[] {
  const seen = new Set<string>();
  return items.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

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

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNearbyProfessionals(geoParams, mounted);

  const { data: mapData, isLoading: mapLoading } = useNearbyMapMarkers(geoParams, mounted);

  const professionals = useMemo(
    () => dedupeProfessionals(data?.pages.flatMap((p) => p.items) ?? []),
    [data],
  );

  const total = data?.pages[0]?.meta.total ?? 0;
  const mapTotal = mapData?.meta.total ?? total;
  const mapMarkers = professionalsToMarkers(mapData?.items ?? []);

  const runSearch = () => setSearch(q.trim());

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
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                />
                <Button variant="emprenor" className="rounded-full" onClick={runSearch} aria-label="Buscar">
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
              <span className="text-xs font-medium text-white/80">Padrón:</span>
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
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-white bg-white text-primary shadow-sm'
                        : 'border-white/30 bg-white/10 text-white hover:bg-white/20',
                    )}
                  >
                    {reg.acronym}
                  </button>
                );
              })}
            </div>
            {activeRegistry && (
              <p className="text-xs text-white/75">
                Filtrando por {activeRegistry.acronym}.
              </p>
            )}
          </div>
        }
      >
        <SectionHeading
          eyebrow="Mapa interactivo"
          title={
            isLoading && total === 0
              ? `Cargando profesionales en ${radiusKm} km…`
              : `${total} profesionales en ${radiusKm} km`
          }
          description={
            mapLoading
              ? 'Cargando marcadores en el mapa…'
              : mapTotal > 0
                ? `${mapMarkers.length} de ${mapTotal} en el mapa · OpenStreetMap · Click en un marcador para ver el perfil`
                : 'OpenStreetMap · Elegí provincia o ampliá el radio para ver profesionales'
          }
        />

        <NearbyEmptyHint
          professionalsCount={!isLoading ? total : null}
          className="mb-6"
        />

        <div className="relative mb-10 h-96">
          <GeoMap
            center={{ lat: location.latitude, lng: location.longitude }}
            markers={mapMarkers}
            radiusKm={radiusKm}
            zoom={10}
            clusterMarkers
            onMarkerClick={(id) => router.push(`/profesionales/${id}`)}
          />
          {mapLoading && (
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center rounded-2xl bg-gradient-to-t from-background/60 to-transparent pb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Cargando mapa…
              </span>
            </div>
          )}
        </div>

        <SectionHeading
          eyebrow="Directorio"
          title="Perfiles con reseñas y precios en pesos"
          description={
            total > 0
              ? `Mostrando ${professionals.length} de ${total} · Compará profesionales y contactá con respaldo FixYa.`
              : 'Compará profesionales, revisá calificaciones y contactá con respaldo FixYa.'
          }
        />

        {isLoading && professionals.length === 0 ? (
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
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map((pro) => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-10 flex flex-col items-center gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando…
                    </>
                  ) : (
                    `Cargar más (${professionals.length} de ${total})`
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {total - professionals.length} profesionales más en este radio
                </p>
              </div>
            )}
          </>
        )}
      </MarketingPageShell>
      <MarketingPageCloser />
    </>
  );
}
