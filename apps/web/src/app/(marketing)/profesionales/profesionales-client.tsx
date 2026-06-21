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

export default function ProfesionalesPageClient() {
  const mounted = useMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const catSlug = searchParams.get('cat') ?? undefined;
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [search, setSearch] = useState(initialQ);
  const [showFilters, setShowFilters] = useState(false);

  const { location, radiusKm } = useLocation();
  const { data: categories } = useCategories(mounted);
  const activeCategory = categories?.find((c) => c.slug === catSlug);

  const geoParams = {
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm,
    categorySlug: catSlug,
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
