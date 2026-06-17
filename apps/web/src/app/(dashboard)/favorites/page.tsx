'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import { useFavorites, useToggleFavorite } from '@/hooks/use-marketplace';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { EmptyState } from '@/components/marketing/marketing-blocks';

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavorites();
  const toggle = useToggleFavorite();

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Mis favoritos"
        description="Servicios guardados para contratar cuando los necesites"
        action={
          <Button asChild>
            <Link href="/servicios">
              <Plus className="mr-2 h-4 w-4" />
              Explorar servicios
            </Link>
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && favorites?.length === 0 && (
        <EmptyState
          title="No tenés favoritos aún"
          description="Guardá servicios mientras explorás profesionales para encontrarlos rápido acá."
          action={
            <Button asChild>
              <Link href="/profesionales">Ver profesionales</Link>
            </Button>
          }
        />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {favorites?.map((service) => (
          <Card key={service.id} className="card-argentina">
            <CardHeader className="flex flex-row items-start justify-between">
              <CardTitle className="text-lg">{service.title}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Quitar de favoritos"
                onClick={() => toggle.mutate(service.id)}
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
              </Button>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{service.category.name}</Badge>
              {service.basePrice && (
                <p className="mt-2 font-semibold text-primary">
                  {formatCurrency(service.basePrice)}
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">{service.tenant.name}</p>
              {service.professionalId && (
                <Button variant="link" className="mt-3 h-auto p-0" asChild>
                  <Link href={`/profesionales/${service.professionalId}`}>Ver profesional</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
