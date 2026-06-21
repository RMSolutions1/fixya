import Link from 'next/link';
import { ExternalLink, Shield, Info } from 'lucide-react';
import {
  getRegistriesForProvince,
  type ProfessionalRegistry,
} from '@/lib/professional-registries';
import { RegistryLogo } from '@/components/professionals/registry-logo';

interface RegistryVerificationPanelProps {
  categorySlug: string;
  province?: string;
  variant?: 'light' | 'card';
}

function RegistryCard({ registry }: { registry: ProfessionalRegistry }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-start gap-3">
        <RegistryLogo
          acronym={registry.acronym}
          brandColor={registry.brandColor ?? '#1e3a5f'}
          logoPath={registry.logoPath ?? `/images/registries/${registry.id}.svg`}
          size={40}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {registry.acronym}
              </p>
              <h3 className="font-semibold">{registry.name}</h3>
            </div>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
              {registry.scope}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{registry.regulates}</p>
          <p className="mt-2 text-xs text-muted-foreground">{registry.notes}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={registry.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Verificar en {registry.acronym}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            {registry.directoryUrl && registry.directoryUrl !== registry.verificationUrl && (
              <Link
                href={registry.directoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Padrón / listado
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegistryVerificationPanel({
  categorySlug,
  province,
  variant = 'card',
}: RegistryVerificationPanelProps) {
  const registries = getRegistriesForProvince(categorySlug, province);

  if (registries.length === 0) return null;

  return (
    <section className={variant === 'card' ? 'mt-12' : ''}>
      <div className="mb-6 flex items-start gap-3">
        <Shield className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
        <div>
          <h2 className="text-xl font-bold">Dónde verificar matrícula o habilitación</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            FixYa revisa identidad en el onboarding. Para rubros regulados, consultá el padrón oficial
            {province ? ` en ${province}` : ''} antes de contratar.
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          No existe un registro nacional único descargable. Cada organismo mantiene su propio padrón
          (distribuidoras de gas, colegios profesionales, cámaras técnicas).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {registries.map((registry) => (
          <RegistryCard key={registry.id} registry={registry} />
        ))}
      </div>
    </section>
  );
}
