'use client';

import { useCategories } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { getRegistriesForCategory } from '@/lib/professional-registries';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function RegisterRegistryHint({ categoryId }: { categoryId?: string }) {
  const mounted = useMounted();
  const { data: categories } = useCategories(mounted);
  const category = categories?.find((c) => c.id === categoryId);
  if (!category) return null;

  const registries = getRegistriesForCategory(category.slug).slice(0, 3);
  if (registries.length === 0) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
      <p className="font-medium text-foreground">Organismos de referencia para {category.name}</p>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        {registries.map((r) => (
          <li key={r.id}>
            <Link
              href={r.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary hover:underline"
            >
              {r.acronym} — {r.name}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        Ingresá tu número de matrícula si tenés. FixYa lo contrastará en la revisión documental.
      </p>
    </div>
  );
}
