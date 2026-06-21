'use client';

import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/components/providers/location-provider';
import { ARGENTINA_PROVINCES } from '@/lib/argentina-provinces';

interface LocationBarProps {
  variant?: 'light' | 'dark';
  showRadius?: boolean;
}

export function LocationBar({ variant = 'light', showRadius = true }: LocationBarProps) {
  const {
    location,
    radiusKm,
    setRadiusKm,
    isLocating,
    error,
    requestGps,
    setManualProvince,
    hasGps,
  } = useLocation();

  const isDark = variant === 'dark';

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl p-3 sm:gap-4 sm:p-4 ${
        isDark
          ? 'border border-white/15 bg-white/10 backdrop-blur-md'
          : 'border bg-card shadow-sm'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <MapPin className={`h-5 w-5 shrink-0 ${isDark ? 'text-sol' : 'text-primary'}`} />
        <div className="min-w-0">
          <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
            {hasGps ? 'Ubicación GPS activa' : 'Zona de búsqueda'}
          </p>
          <p className={`truncate text-sm font-semibold ${isDark ? 'text-white' : 'text-foreground'}`}>
            {location.label}
          </p>
        </div>
      </div>

      <select
        aria-label="Elegir provincia"
        className={`rounded-lg px-3 py-2 text-sm ${
          isDark
            ? 'border border-white/20 bg-white/10 text-white'
            : 'border bg-background'
        }`}
        onChange={(e) => setManualProvince(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>
          Cambiar provincia…
        </option>
        {ARGENTINA_PROVINCES.map((p) => (
          <option key={p.name} value={p.name} className="text-foreground">
            {p.name}
          </option>
        ))}
      </select>

      {showRadius && (
        <select
          aria-label="Radio de búsqueda"
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className={`rounded-lg px-3 py-2 text-sm ${
            isDark
              ? 'border border-white/20 bg-white/10 text-white'
              : 'border bg-background'
          }`}
        >
          <option value={25}>25 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
          <option value={200}>200 km</option>
        </select>
      )}

      <Button
        type="button"
        size="sm"
        variant={isDark ? 'secondary' : 'default'}
        onClick={requestGps}
        disabled={isLocating}
        className="shrink-0"
      >
        {isLocating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Navigation className="mr-1.5 h-4 w-4" />
            Cerca mío
          </>
        )}
      </Button>

      {error && (
        <p className={`w-full text-xs ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>{error}</p>
      )}
    </div>
  );
}
