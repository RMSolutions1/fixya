'use client';

import type { ProfessionalSummary } from '@/hooks/use-marketplace';

interface ProfessionalsMapProps {
  professionals: ProfessionalSummary[];
}

export function ProfessionalsMap({ professionals }: ProfessionalsMapProps) {
  const withCoords = professionals.filter(
    (p) => p.latitude != null && p.longitude != null,
  );

  if (withCoords.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
        Aún no hay profesionales con ubicación en el mapa.
      </div>
    );
  }

  const lats = withCoords.map((p) => p.latitude!);
  const lngs = withCoords.map((p) => p.longitude!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const pad = 0.08;
  const latSpan = Math.max(maxLat - minLat, 0.5) + pad;
  const lngSpan = Math.max(maxLng - minLng, 0.5) + pad;

  return (
    <div className="relative h-72 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-secondary/30 to-background sm:h-96">
      <div className="absolute inset-0 opacity-20">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-primary" />
        </svg>
      </div>
      {withCoords.map((pro) => {
        const x = ((pro.longitude! - minLng + pad / 2) / lngSpan) * 100;
        const y = (1 - (pro.latitude! - minLat + pad / 2) / latSpan) * 100;
        return (
          <div
            key={pro.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`${pro.firstName} ${pro.lastName} — ${pro.city ?? pro.province ?? ''}`}
          >
            <span
              className={`block h-3 w-3 rounded-full ring-2 ring-white ${
                pro.pendingApproval ? 'bg-amber-500' : 'bg-primary'
              }`}
            />
          </div>
        );
      })}
      <div className="absolute bottom-3 left-3 flex gap-3 rounded-lg bg-background/90 px-3 py-2 text-xs shadow">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary" /> Verificado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> En verificación
        </span>
      </div>
    </div>
  );
}
