'use client';

import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/components/providers/location-provider';

interface NearbyEmptyHintProps {
  /** null = aún cargando, no mostrar */
  professionalsCount: number | null;
  className?: string;
}

/** Guía cuando el GPS o el radio no tienen profesionales (beta concentrada en NOA). */
export function NearbyEmptyHint({ professionalsCount, className = '' }: NearbyEmptyHintProps) {
  const { location, hasGps, setManualProvince } = useLocation();

  if (professionalsCount == null || professionalsCount > 0) return null;

  return (
    <div
      className={`rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 ${className}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-semibold">No hay profesionales en este radio</p>
          <p className="text-amber-900/90 dark:text-amber-100/90">
            {hasGps
              ? 'Tu GPS puede estar lejos de la cobertura actual del directorio (concentrada en NOA / Salta en esta beta).'
              : `No encontramos oficios cerca de ${location.label}.`}
            {' '}Probá ampliar el radio a 100–200 km o elegí una provincia con más registros.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setManualProvince('Salta')}>
              Ver Salta (NOA)
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setManualProvince('Jujuy')}>
              Ver Jujuy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
