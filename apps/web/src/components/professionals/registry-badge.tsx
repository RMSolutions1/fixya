import Link from 'next/link';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { RegistryLogo } from '@/components/professionals/registry-logo';
import { cn } from '@/lib/utils';

export interface RegistrySourceInfo {
  id: string;
  acronym: string;
  name: string;
  brandColor: string;
  logoPath: string;
  verificationUrl: string;
  directoryUrl?: string;
  regulates: string;
  directoryListing: boolean;
}

interface RegistryBadgeProps {
  registry: RegistrySourceInfo;
  size?: 'sm' | 'md';
  showLink?: boolean;
  className?: string;
}

export function RegistryBadge({
  registry,
  size = 'sm',
  showLink = false,
  className,
}: RegistryBadgeProps) {
  const logoSize = size === 'sm' ? 28 : 36;
  const inner = (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1',
        size === 'md' && 'px-3 py-1.5',
        className,
      )}
    >
      <RegistryLogo
        acronym={registry.acronym}
        brandColor={registry.brandColor}
        logoPath={registry.logoPath}
        size={logoSize}
      />
      <span className="flex flex-col leading-tight">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          <ShieldCheck className="h-3 w-3" aria-hidden />
          {registry.directoryListing ? 'Padrón oficial' : 'Matriculado'}
        </span>
        <span className={cn('font-medium text-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {registry.acronym}
        </span>
      </span>
    </span>
  );

  if (showLink) {
    return (
      <Link
        href={registry.verificationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex hover:opacity-90"
        title={`Verificar en ${registry.name}`}
      >
        {inner}
        <ExternalLink className="ml-1 h-3 w-3 self-center text-muted-foreground" />
      </Link>
    );
  }

  return inner;
}
