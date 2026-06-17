import { SolDeMayo } from '@/components/brand/sol-de-mayo';
import { ArgentinaStripes } from '@/components/brand/argentina-stripes';
import { GroupBrandMark } from '@/components/brand/group-brand-mark';
import { COMPANY } from '@/lib/company-info';

interface AuthBrandPanelProps {
  title: string;
  subtitle: string;
}

export function AuthBrandPanel({ title, subtitle }: AuthBrandPanelProps) {
  return (
    <div className="relative hidden overflow-hidden celeste-gradient lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
      <ArgentinaStripes className="absolute left-0 right-0 top-0" />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-3">
          <SolDeMayo size={40} animated />
          <span className="text-xl font-bold text-white">
            Fix<span className="text-sol">Ya</span>
          </span>
        </div>
        <GroupBrandMark variant="light" />
      </div>

      <div className="relative z-10 space-y-6">
        <SolDeMayo size={120} animated className="mx-auto opacity-90" />
        <blockquote className="text-center">
          <p className="text-2xl font-semibold leading-snug text-white">{title}</p>
          <p className="mt-4 text-white/75">{subtitle}</p>
        </blockquote>
        <p className="text-center text-sm font-medium tracking-wide text-white/50">
          {COMPANY.groupBrand.toUpperCase()} · CELESTE Y BLANCO · ARGENTINA
        </p>
      </div>

      <ArgentinaStripes className="absolute bottom-0 left-0 right-0" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 70%, hsl(var(--sol) / 0.3) 0%, transparent 50%)`,
        }}
      />
    </div>
  );
}
