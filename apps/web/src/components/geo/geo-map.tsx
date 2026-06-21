'use client';

import dynamic from 'next/dynamic';
import type { ProfessionalSummary } from '@/hooks/use-marketplace';
import { resolveCategorySlug } from '@/lib/category-colors';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  verified?: boolean;
  distanceKm?: number | null;
  categorySlug?: string;
  specialty?: string | null;
}

export interface GeoMapProps {
  center: { lat: number; lng: number };
  markers: MapMarker[];
  radiusKm?: number;
  className?: string;
  zoom?: number;
  /** Agrupa marcadores cuando hay muchos (directorio/padrones). */
  clusterMarkers?: boolean;
  onMarkerClick?: (id: string) => void;
}

const GeoMapInner = dynamic(() => import('./geo-map-inner').then((m) => m.GeoMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

export function GeoMap(props: GeoMapProps) {
  return <GeoMapInner {...props} />;
}

export function professionalsToMarkers(
  pros: Array<
    Pick<ProfessionalSummary, 'id' | 'firstName' | 'lastName' | 'latitude' | 'longitude' | 'specialty'> & {
      distanceKm?: number | null;
      verified?: boolean;
      categorySlug?: string | null;
    }
  >,
): MapMarker[] {
  return pros
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      id: p.id,
      latitude: p.latitude!,
      longitude: p.longitude!,
      label: `${p.firstName} ${p.lastName}`,
      verified: p.verified,
      specialty: p.specialty,
      categorySlug: resolveCategorySlug(p.specialty, p.categorySlug),
      distanceKm: 'distanceKm' in p ? (p as ProfessionalSummary & { distanceKm?: number }).distanceKm : null,
    }));
}
