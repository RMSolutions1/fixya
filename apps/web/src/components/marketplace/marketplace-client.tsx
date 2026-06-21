'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Star, SlidersHorizontal } from 'lucide-react';
import { useServices, useCategories, useRanking } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { EmptyState } from '@/components/marketing/marketing-blocks';

export default function MarketplaceClient() {
  const mounted = useMounted();
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>();
  const [sortBy, setSortBy] = useState<string>('rating');
  const [minRating, setMinRating] = useState<number>();
  const [geo, setGeo] = useState<{ lat: number; lng: number }>();
  const [showFilters, setShowFilters] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const { data: categories } = useCategories(mounted);
  const { data: ranking } = useRanking(10, mounted);
  const { data, isLoading, isError } = useServices(
    {
      q: search || undefined,
      categoryId,
      sortBy,
      minRating,
      latitude: geo?.lat,
      longitude: geo?.lng,
      radiusKm: 50,
    },
    mounted,
  );

  useEffect(() => {
    if (isError) setApiError(true);
  }, [isError]);

  const detectLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError('No se pudo obtener tu ubicación. Revisá los permisos del navegador.'),
    );
  };

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Mercado de servicios"
        description="Explorá servicios publicados, filtrá por categoría y ubicación, y competí con presupuestos."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/solicitudes">Ver solicitudes</Link>
          </Button>
        }
      />

      {apiError && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No pudimos cargar los servicios en este momento. Verificá tu conexión e intentá nuevamente.
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-sm flex-1"
              placeholder="Buscar servicios..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearch(q)}
            />
            <Button onClick={() => setSearch(q)} aria-label="Buscar servicios">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={detectLocation}>
              <MapPin className="mr-1 h-4 w-4" />
              Cerca mío
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-1 h-4 w-4" />
              Filtros
            </Button>
          </div>

          {geoError && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {geoError}
            </p>
          )}

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-3 rounded-lg border p-4">
              <select
                className="rounded-md border px-3 py-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Ordenar resultados"
              >
                <option value="rating">Mejor rating</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
                <option value="newest">Más recientes</option>
              </select>
              <select
                className="rounded-md border px-3 py-2 text-sm"
                value={minRating ?? ''}
                onChange={(e) =>
                  setMinRating(e.target.value ? Number(e.target.value) : undefined)
                }
                aria-label="Filtrar por calificación"
              >
                <option value="">Cualquier rating</option>
                <option value="4">4+ estrellas</option>
                <option value="3">3+ estrellas</option>
              </select>
              {geo && <Badge variant="secondary">Búsqueda geo activa</Badge>}
            </div>
          )}

          {categories && categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                variant={!categoryId ? 'default' : 'secondary'}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => setCategoryId(undefined)}
                onKeyDown={(e) => e.key === 'Enter' && setCategoryId(undefined)}
              >
                Todas
              </Badge>
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={categoryId === cat.id ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => setCategoryId(cat.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setCategoryId(cat.id)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {(!mounted || isLoading) && (
              <p className="text-muted-foreground">Cargando servicios...</p>
            )}
            {mounted &&
              data?.items.map((service) => {
                const href = service.professionalId
                  ? `/profesionales/${service.professionalId}`
                  : '/profesionales';
                return (
                  <Link key={service.id} href={href}>
                    <Card className="card-argentina h-full transition-shadow hover:shadow-celeste">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                          {'rankingScore' in service && (
                            <Badge variant="success">
                              Top {String((service as { rankingScore: number }).rankingScore)}
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{service.category.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {service.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between">
                          {service.basePrice && (
                            <span className="font-semibold text-primary">
                              Desde {formatCurrency(service.basePrice)}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3 w-3 fill-sol text-sol" />
                            {service.ratingAvg} ({service.ratingCount})
                          </span>
                        </div>
                        {'distanceKm' in service &&
                          (service as { distanceKm: number | null }).distanceKm != null && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {(service as { distanceKm: number }).distanceKm} km de distancia
                            </p>
                          )}
                        <p className="mt-2 text-xs text-muted-foreground">{service.tenant.name}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            {mounted && !isLoading && !isError && data?.items.length === 0 && (
              <div className="col-span-2">
                <EmptyState
                  title="No hay servicios publicados"
                  description="Cuando los profesionales publiquen servicios en tu zona, los verás acá."
                  action={
                    <Button asChild>
                      <Link href="/register?role=PROFESIONAL">Registrar servicios</Link>
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>

        <aside className="w-full lg:w-72">
          <Card className="card-argentina">
            <CardHeader>
              <CardTitle className="text-lg">Top ranking</CardTitle>
              <CardDescription>Mejor valorados en FixYa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ranking?.map((item) => (
                <div key={item.serviceId} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {item.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.ratingAvg} · {item.tenantName}
                    </p>
                  </div>
                </div>
              ))}
              {mounted && !ranking?.length && (
                <p className="text-sm text-muted-foreground">Sin datos aún</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
