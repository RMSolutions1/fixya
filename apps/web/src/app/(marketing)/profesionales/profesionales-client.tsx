'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProfessionalCard, EmptyState } from '@/components/marketing/marketing-blocks';
import { MarketingPageShell } from '@/components/marketing/marketing-page-shell';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { SectionHeading } from '@/components/marketing/section-heading';
import { useProfessionals, useCategories } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import Link from 'next/link';
import { ProfessionalsMap } from '@/components/marketing/professionals-map';
export default function ProfesionalesPageClient() {
  const mounted = useMounted();
  const searchParams = useSearchParams();
  const catSlug = searchParams.get('cat') ?? undefined;
  const initialQ = searchParams.get('q') ?? '';
  const [q, setQ] = useState(initialQ);
  const [search, setSearch] = useState(initialQ);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories } = useCategories(mounted);
  const activeCategory = categories?.find((c) => c.slug === catSlug);

  const { data, isLoading, isError } = useProfessionals(
    {
      q: search || undefined,
      categorySlug: catSlug,
      sortBy,
      includePending: true,
    },
    mounted,
  );

  const professionals = data?.items ?? [];

  return (
    <>
    <MarketingPageShell
      showCloser={false}
      title={
        <>
          Profesionales <span className="text-sol">verificados</span>
        </>
      }
      subtitle={`Encontrá al profesional ideal${activeCategory ? ` en ${activeCategory.name}` : ' en tu zona'} · identidad y matrículas revisadas`}
      heroExtra={
        <>
          <div className="mt-8 flex flex-wrap gap-2">
            <div className="flex flex-1 gap-2 rounded-full bg-white p-1.5 sm:max-w-xl">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, servicio, especialidad..."
                className="border-0 bg-transparent pl-4 text-foreground shadow-none focus-visible:ring-0"
                onKeyDown={(e) => e.key === 'Enter' && setSearch(q)}
              />
              <Button className="rounded-full" onClick={() => setSearch(q)} aria-label="Buscar profesionales">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outlineOnDark" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white"
              >
                <option value="rating">Mayor calificación</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>
              {catSlug && (
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/profesionales">Quitar filtro categoría</Link>
                </Button>
              )}
            </div>
          )}
        </>
      }
    >
      <SectionHeading
        eyebrow="Mapa"
        title="Profesionales en Argentina"
        description="Ubicación aproximada según provincia de registro. Los nuevos perfiles aparecen al instante; el equipo valida documentación antes de activar operaciones."
      />
      {!isLoading && professionals.length > 0 && (
        <div className="mb-10">
          <ProfessionalsMap professionals={professionals} />
        </div>
      )}

      <SectionHeading
        eyebrow="Directorio"
        title="Perfiles con reseñas y precios en pesos"
        description="Compará profesionales, revisá calificaciones y contactá con respaldo FixYa."
      />
      <p className="mb-6 mt-8 text-sm text-muted-foreground">
        {data?.meta.total ?? 0} profesional{data?.meta.total !== 1 ? 'es' : ''} encontrado
        {data?.meta.total !== 1 ? 's' : ''}
      </p>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : isError || professionals.length === 0 ? (
        <EmptyState
          title="No se encontraron profesionales"
          description="Probá con otra búsqueda o categoría. Los profesionales se irán sumando a medida que se registren en la plataforma."
          action={
            <Button asChild>
              <Link href="/servicios">Ver categorías</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((pro) => (
            <ProfessionalCard key={pro.id} professional={pro} />
          ))}
        </div>
      )}
    </MarketingPageShell>
    <MarketingPageCloser />
    </>
  );
}