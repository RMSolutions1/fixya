'use client';

import Link from 'next/link';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/marketing/marketing-blocks';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { useServiceRequests } from '@/hooks/use-marketplace';
import { formatDate } from '@/lib/utils';
import { canSubmitQuotation, resolveDashboardRole } from '@/lib/dashboard-nav';
import { useAuthStore } from '@/stores/auth.store';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  DRAFT: { label: 'Borrador', variant: 'secondary' },
  PUBLISHED: { label: 'Publicada', variant: 'default' },
  QUOTING: { label: 'Recibiendo presupuestos', variant: 'warning' },
  CLOSED: { label: 'Cerrada', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'secondary' },
};

export default function SolicitudesPage() {
  const { data, isLoading } = useServiceRequests();
  const role = resolveDashboardRole(useAuthStore((s) => s.user?.memberships?.[0]?.role));
  const items = data?.items ?? [];
  const isProfessional = canSubmitQuotation(role) || data?.role === 'professional';

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={isProfessional ? 'Oportunidades de trabajo' : 'Mis solicitudes'}
        description={
          isProfessional
            ? 'Solicitudes publicadas por clientes en tu zona'
            : 'Seguí el estado de todos tus servicios contratados'
        }
        action={
          !isProfessional ? (
            <Button asChild>
              <Link href="/marketplace/requests/new">
                <Plus className="mr-2 h-4 w-4" />
                Nueva solicitud
              </Link>
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={isProfessional ? 'No hay solicitudes disponibles' : 'No tenés solicitudes aún'}
          description={
            isProfessional
              ? 'Cuando un cliente publique una solicitud en tu rubro, la verás acá.'
              : 'Cuando contrates un profesional, vas a ver tus solicitudes acá.'
          }
          action={
            !isProfessional ? (
              <Button asChild>
                <Link href="/profesionales">Buscar profesional</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {items.map((req) => {
            const status = statusLabels[req.status] ?? {
              label: req.status,
              variant: 'secondary' as const,
            };
            return (
              <Card key={req.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{req.title}</h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {req.category.name}
                        {req.client && ` · ${req.client.firstName} ${req.client.lastName}`}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(req.publishedAt ?? req.createdAt)}
                        {req._count && ` · ${req._count.quotations} presupuesto(s)`}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/marketplace/requests/${req.id}`}>
                      Ver detalle
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
