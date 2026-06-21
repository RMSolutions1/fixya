import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRegistryVerificationLabel } from '@/lib/category-colors';
import type { RegistrySourceInfo } from '@/components/professionals/registry-badge';

interface VerifiedSourceLabelProps {
  registry?: RegistrySourceInfo | null;
  verified?: boolean;
  className?: string;
}

/** Línea discreta bajo el profesional: «Datos verificados (COPAIPA)». */
export function VerifiedSourceLabel({ registry, verified, className }: VerifiedSourceLabelProps) {
  if (!registry && !verified) return null;

  const text = registry
    ? getRegistryVerificationLabel(registry.acronym, registry.id)
    : 'Datos verificados (FixYa)';

  return (
    <p className={cn('flex items-center gap-1 text-xs text-muted-foreground', className)}>
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-pampa" aria-hidden />
      <span>{text}</span>
    </p>
  );
}
