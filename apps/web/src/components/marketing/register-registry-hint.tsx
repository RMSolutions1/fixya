'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { useCategories } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { getRegistriesForCategory } from '@/lib/professional-registries';
import { RegistryLogo } from '@/components/professionals/registry-logo';

export function RegisterRegistryHint({ categoryId }: { categoryId?: string }) {
  const mounted = useMounted();
  const { data: categories } = useCategories(mounted);
  const category = categories?.find((c) => c.id === categoryId);
  if (!category) return null;

  const registries = getRegistriesForCategory(category.slug).slice(0, 4);
  if (registries.length === 0) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
      <p className="font-medium text-foreground">Organismos oficiales para {category.name}</p>
      <ul className="mt-3 space-y-2">
        {registries.map((r) => (
          <li key={r.id} className="flex items-start gap-2">
            <RegistryLogo
              acronym={r.acronym}
              brandColor={r.brandColor ?? '#1e3a5f'}
              logoPath={r.logoPath ?? `/images/registries/${r.id}.svg`}
              size={28}
            />
            <div className="min-w-0">
              <Link
                href={r.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium hover:text-primary hover:underline"
              >
                {r.acronym}
                <ExternalLink className="h-3 w-3" />
              </Link>
              <p className="text-xs text-muted-foreground line-clamp-2">{r.regulates}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
