import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SolDeMayo } from '@/components/brand/sol-de-mayo';
import { COMPANY } from '@/lib/company-info';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  variant?: 'light' | 'dark';
  showSun?: boolean;
}

export function Logo({
  className,
  showTagline = false,
  variant = 'dark',
  showSun = true,
}: LogoProps) {
  const isLight = variant === 'light';

  return (
    <Link href="/" className={cn('inline-flex items-center gap-2.5', className)}>
      {showSun && (
        <SolDeMayo
          size={32}
          className={cn('shrink-0', isLight ? 'drop-shadow-sol' : '')}
        />
      )}
      <span className="inline-flex flex-col">
        <span className="text-xl font-bold tracking-tight leading-none sm:text-2xl">
          <span className={isLight ? 'text-white' : 'text-foreground'}>Fix</span>
          <span className={isLight ? 'text-sol' : 'text-primary'}>Ya</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              'mt-0.5 text-[10px] font-medium tracking-wider',
              isLight ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            Argentina · Un producto {COMPANY.groupBrand}
          </span>
        )}
      </span>
    </Link>
  );
}
