'use client';

import dynamic from 'next/dynamic';
import type { ProfessionalSummary } from '@/hooks/use-marketplace';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  verified?: boolean;
  distanceKm?: number | null;
}

export interface GeoMapProps {
  center: { lat: number; lng: number };
  markers: MapMarker[];
  radiusKm?: number;
  className?: string;
  zoom?: number;
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

export function professionalsToMarkers(pros: ProfessionalSummary[]): MapMarker[] {
  return pros
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({
      id: p.id,
      latitude: p.latitude!,
      longitude: p.longitude!,
      label: `${p.firstName} ${p.lastName}`,
      verified: p.verified,
      distanceKm: 'distanceKm' in p ? (p as ProfessionalSummary & { distanceKm?: number }).distanceKm : null,
    }));
}
