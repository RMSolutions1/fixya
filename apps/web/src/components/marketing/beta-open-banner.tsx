import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { COMPANY } from '@/lib/company-info';

/** Barra de campaña beta — visible en todo el sitio público */
export function BetaOpenBanner() {
  const { campaign } = COMPANY;

  return (
    <div className="border-b border-sol/30 bg-[hsl(var(--brand-indigo))] text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs sm:justify-between sm:text-left sm:px-6 sm:text-sm">
        <p className="flex items-center justify-center gap-2 font-medium sm:justify-start">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-sol" aria-hidden />
          <span className="font-semibold text-sol">{campaign.label}</span>
          <span className="hidden text-white/90 md:inline">— {campaign.tagline}</span>
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/marketplace/requests/new"
            className="font-semibold text-sol underline-offset-2 hover:underline"
          >
            {campaign.ctaClient}
          </Link>
          <span className="text-white/40" aria-hidden>
            ·
          </span>
          <Link
            href="/register"
            className="font-semibold underline-offset-2 hover:underline"
          >
            {campaign.ctaPro}
          </Link>
        </div>
      </div>
    </div>
  );
}
