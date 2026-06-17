import type { ReactNode } from 'react';
import { SolDeMayo } from '@/components/brand/sol-de-mayo';

interface MarketingPageHeroProps {
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  narrow?: boolean;
}

export function MarketingPageHero({
  title,
  subtitle,
  children,
  narrow = false,
}: MarketingPageHeroProps) {
  return (
    <section className="hero-gradient relative overflow-hidden px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute -right-20 -top-20 opacity-[0.08]">
        <SolDeMayo size={280} />
      </div>
      <div className={narrow ? 'relative mx-auto max-w-4xl' : 'relative mx-auto max-w-7xl'}>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
