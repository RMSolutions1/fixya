import Link from 'next/link';
import { ExternalLink, Info } from 'lucide-react';
import { RegistryLogo } from '@/components/professionals/registry-logo';
import type { RegistrySourceInfo } from '@/components/professionals/registry-badge';
import { getRegistryById } from '@/lib/professional-registries';

interface RegistrySourceCardProps {
  registry: RegistrySourceInfo;
  licenseNumber?: string | null;
  variant?: 'compact' | 'full';
}

export function RegistrySourceCard({
  registry,
  licenseNumber,
  variant = 'full',
}: RegistrySourceCardProps) {
  const full = getRegistryById(registry.id);

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
      <div className="flex items-start gap-3">
        <RegistryLogo
          acronym={registry.acronym}
          brandColor={registry.brandColor}
          logoPath={registry.logoPath}
          size={variant === 'compact' ? 40 : 48}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Fuente habilitante
          </p>
          <h3 className="font-semibold leading-snug">{registry.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{registry.regulates}</p>
          {full?.shortTagline && variant === 'full' && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {full.shortTagline}
            </p>
          )}
          {licenseNumber && (
            <p className="mt-2 text-sm">
              Matrícula: <span className="font-mono font-medium">{licenseNumber}</span>
            </p>
          )}
          {registry.directoryListing && (
            <p className="mt-1 text-xs text-primary">
              Datos sincronizados desde el padrón público oficial de {registry.acronym}.
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <Link
          href={registry.verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Verificar en {registry.acronym}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        {registry.directoryUrl && registry.directoryUrl !== registry.verificationUrl && (
          <Link
            href={registry.directoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline"
          >
            Ver padrón completo
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
