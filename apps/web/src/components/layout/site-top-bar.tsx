import Link from 'next/link';
import { Mail, Phone, Clock } from 'lucide-react';
import { COMPANY } from '@/lib/company-info';

export function SiteTopBar() {
  return (
    <div className="hidden border-b border-primary/10 bg-[hsl(var(--brand-indigo))] text-white lg:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <a
            href={COMPANY.phoneHref}
            className="flex items-center gap-1.5 transition-colors hover:text-sol"
          >
            <Phone className="h-3.5 w-3.5" />
            {COMPANY.phone}
          </a>
          <a
            href={`mailto:${COMPANY.emails.general}`}
            className="flex items-center gap-1.5 transition-colors hover:text-sol"
          >
            <Mail className="h-3.5 w-3.5" />
            {COMPANY.emails.general}
          </a>
          <span className="flex items-center gap-1.5 text-white/70">
            <Clock className="h-3.5 w-3.5" />
            Lun - Vie: 8:00 - 20:00
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-medium tracking-wider text-white/60">
            {COMPANY.groupBrand} · Mercado nacional de servicios
          </span>
        </div>
      </div>
    </div>
  );
}
