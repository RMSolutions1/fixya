'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getCategoryIcon } from '@/lib/category-icons';
import { useCategories } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { TrustBadges } from '@/components/brand/trust-badges';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { SectionHeading } from '@/components/marketing/section-heading';
import { COMPANY } from '@/lib/company-info';

export default function ServiciosPageClient() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [search, setSearch] = useState(initialQ);
  const { data: categories, isLoading } = useCategories(mounted);

  const filtered = categories?.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <MarketingPageShell
        showCloser={false}
        title={
          <>
            Todos los <span className="text-sol">servicios</span>
          </>
        }
        subtitle={`${categories?.length ?? 0} categorías de servicios profesionales en las 24 provincias`}
        heroExtra={
          <form
            className="mt-8 flex max-w-xl gap-2 rounded-full bg-white p-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(q);
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar servicios..."
              className="border-0 bg-transparent pl-4 text-foreground shadow-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button type="submit" variant="emprenor" className="rounded-full" aria-label="Buscar servicios">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        }
      >
        <SectionHeading
          eyebrow="Directorio"
          title="Elegí el rubro que necesitás"
          description={COMPANY.marketingPitch}
        />
        <p className="mb-4 mt-8 text-sm text-muted-foreground">
          {filtered?.length ?? 0} categorías encontradas
          {search && (
            <>
              {' '}
              ·{' '}
              <Link href={`/profesionales?q=${encodeURIComponent(search)}`} className="text-primary hover:underline">
                Buscar profesionales para &quot;{search}&quot;
              </Link>
            </>
          )}
        </p>
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered?.map((cat) => (
              <Link
                key={cat.id}
                href={`/servicios/${cat.slug}`}
                className="group card-argentina p-6 hover:shadow-celeste"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {getCategoryIcon(cat.slug)}
                </div>
                <h3 className="font-semibold group-hover:text-primary">{cat.name}</h3>
                {cat.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                )}
                {(cat.serviceCount ?? 0) > 0 ? (
                  <p className="mt-3 text-sm font-medium text-primary">
                    {cat.serviceCount} profesional{cat.serviceCount !== 1 ? 'es' : ''}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">Próximamente en tu zona</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </MarketingPageShell>
      <TrustBadges />
      <section className="border-t bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold">¿Sos profesional de alguno de estos rubros?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Registrate gratis y empezá a recibir solicitudes en tu zona.
          </p>
          <Button variant="emprenor" className="mt-6" asChild>
            <Link href="/register?role=PROFESIONAL">Sumate como profesional</Link>
          </Button>
        </div>
      </section>
      <MarketingPageCloser />
    </>
  );
}
