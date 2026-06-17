import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GROUP_BUSINESS_UNITS,
  getSiblingBusinessUnits,
  formatWebsiteHost,
} from '@/lib/company-info';

interface GroupBusinessUnitsListProps {
  /** Excluir FixYa (default en footers externos) */
  excludeCurrent?: boolean;
  className?: string;
  compact?: boolean;
}

/** Listado de unidades de negocio del Grupo Emprenor */
export function GroupBusinessUnitsList({
  excludeCurrent = true,
  className,
  compact = false,
}: GroupBusinessUnitsListProps) {
  const units = excludeCurrent ? getSiblingBusinessUnits() : GROUP_BUSINESS_UNITS;

  return (
    <ul className={cn('space-y-2', className)}>
      {units.map(({ id, brand, tagline, website, isCurrent }) => (
        <li key={id}>
          {isCurrent ? (
            <span className="block text-sm">
              <span className="font-medium text-foreground">{brand}</span>
              {!compact && (
                <span className="mt-0.5 block text-xs text-muted-foreground">{tagline}</span>
              )}
            </span>
          ) : (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="group block text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="inline-flex items-center gap-1 font-medium group-hover:text-primary">
                {brand}
                <ExternalLink className="h-3 w-3 opacity-60" aria-hidden />
              </span>
              {!compact && (
                <span className="mt-0.5 block text-xs opacity-80">{tagline}</span>
              )}
              {compact && (
                <span className="text-xs opacity-70"> · {formatWebsiteHost(website)}</span>
              )}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
