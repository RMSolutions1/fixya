'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocationBar } from '@/components/geo/location-bar';
import { GeoMap, professionalsToMarkers } from '@/components/geo/geo-map';
import { ProfessionalCard } from '@/components/marketing/marketing-blocks';
import { SectionHeading } from '@/components/marketing/section-heading';
import { useLocation } from '@/components/providers/location-provider';
import { useNearbyProfessionals, useNearbyStats } from '@/hooks/use-marketplace';
import { getCategoryIcon } from '@/lib/category-icons';

export function NearbyDiscoverySection() {
  const router = useRouter();
  const { location, radiusKm } = useLocation();
  const geoParams = {
    latitude: location.latitude,
    longitude: location.longitude,
    radiusKm,
  };

  const { data: stats } = useNearbyStats(geoParams);
  const { data: prosData, isLoading } = useNearbyProfessionals(geoParams);
  const professionals = prosData?.items ?? [];

  return (
    <section className="relative overflow-hidden border-y bg-gradient-to-b from-secondary/40 via-background to-background py-20">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-sol/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 grid gap-8 lg:grid-cols-2 lg:items-end">
          <SectionHeading
            eyebrow="En tu zona · Por proximidad"
            title={
              stats && stats.professionalsCount > 0
                ? `${stats.professionalsCount} profesional${stats.professionalsCount !== 1 ? 'es' : ''} en ${radiusKm} km`
                : 'Profesionales cerca tuyo'
            }
            description="De La Quiaca a Tierra del Fuego — activá tu ubicación y descubrí oficios con identidad revisada cerca tuyo."
          />
          <LocationBar />
        </div>

        {stats && stats.categoriesNearby.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {stats.categoriesNearby.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/servicios/${cat.slug}`}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary hover:text-primary"
              >
                <span>{getCategoryIcon(cat.slug)}</span>
                {cat.name}
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mb-10 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="card-argentina p-5 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="text-3xl font-bold tabular-nums">
                  {stats?.professionalsCount ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">Profesionales cerca</p>
              </div>
              <div className="card-argentina p-5 text-center">
                <p className="text-3xl font-bold tabular-nums">{radiusKm}</p>
                <p className="text-xs text-muted-foreground">km de radio</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Pagos con Mercado Pago · Presupuestos comparables · Expediente digital por servicio
            </p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/profesionales">
                Ver mapa completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="h-80 lg:col-span-3 lg:h-96">
            <GeoMap
              center={{ lat: location.latitude, lng: location.longitude }}
              markers={professionalsToMarkers(professionals)}
              radiusKm={radiusKm}
              zoom={10}
              onMarkerClick={(id) => router.push(`/profesionales/${id}`)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.slice(0, 6).map((pro) => (
              <ProfessionalCard key={pro.id} professional={pro} />
            ))}
          </div>
        ) : (
          <div className="card-argentina border-dashed p-12 text-center">
            <p className="text-lg font-semibold">Aún no hay profesionales en este radio</p>
            <p className="mt-2 text-muted-foreground">
              Ampliá el radio o elegí otra provincia. ¿Sos profesional? Registrate gratis.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/register?role=PROFESIONAL">Sumarme como profesional</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
