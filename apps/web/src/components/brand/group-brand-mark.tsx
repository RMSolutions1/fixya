import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  COMPANY,
  GROUP_BUSINESS_UNITS,
  formatWebsiteHost,
} from '@/lib/company-info';

interface GroupBrandMarkProps {
  className?: string;
  variant?: 'light' | 'muted' | 'inline';
  /** @deprecated Usar showEcosystem */
  showEmprenor?: boolean;
  /** Muestra links compactos a otras unidades del grupo */
  showEcosystem?: boolean;
}

/** Marca corporativa Grupo Emprenor — login, dashboard y footers */
export function GroupBrandMark({
  className,
  variant = 'muted',
  showEmprenor = false,
  showEcosystem = false,
}: GroupBrandMarkProps) {
  const linkClass = cn(
    'inline-flex items-center gap-1 font-medium transition-colors',
    variant === 'light' && 'text-white/70 hover:text-sol',
    variant === 'muted' && 'text-muted-foreground hover:text-primary',
    variant === 'inline' && 'text-primary hover:underline',
  );

  return (
    <p className={cn('text-xs leading-relaxed', className)}>
      Un producto{' '}
      <a
        href={COMPANY.groupWebsite}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {COMPANY.groupBrand}
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
      {showEmprenor && (
        <>
          {' '}
          ·{' '}
          <a
            href={COMPANY.emprenorWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {COMPANY.emprenorBrand}
          </a>
        </>
      )}
      {showEcosystem && (
        <span className="mt-1 block text-[10px] leading-relaxed opacity-80">
          {GROUP_BUSINESS_UNITS.filter((u) => !u.isCurrent)
            .map((u) => formatWebsiteHost(u.website))
            .join(' · ')}
        </span>
      )}
    </p>
  );
}

export function GroupBrandBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 bg-secondary/30 px-4 py-2 text-xs sm:px-6',
        className,
      )}
    >
      <GroupBrandMark variant="muted" />
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          Sitio público
        </Link>
        <a
          href={COMPANY.groupWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          {COMPANY.groupWebsite.replace('https://', '')}
        </a>
      </div>
    </div>
  );
}
