'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Check, X } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useApiAuth } from '@/hooks/use-auth';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PendingProfessional {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  province: string | null;
  address: string | null;
  createdAt: string;
  services: Array<{ id: string; title: string; status: string; category: { name: string } }>;
  complianceDocuments: Array<{
    id: string;
    docType: string;
    status: string;
    documentNumber: string | null;
  }>;
}

export default function AprobacionesPage() {
  const { token, tenantId } = useApiAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'pending-professionals'],
    queryFn: () =>
      apiRequest<PendingProfessional[]>('/admin/professionals/pending', { token, tenantId }),
    enabled: !!token,
  });

  const approve = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/admin/professionals/${id}/approve`, {
        method: 'POST',
        token,
        tenantId,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pending-professionals'] }),
  });

  const reject = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/admin/professionals/${id}/reject`, {
        method: 'POST',
        token,
        tenantId,
        body: { note: 'Documentación insuficiente o inválida' },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'pending-professionals'] }),
  });

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Aprobación de profesionales"
        description="Revisá documentación y habilitá perfiles en el mapa público."
      />

      {isLoading && <p className="text-muted-foreground">Cargando pendientes...</p>}

      {!isLoading && (!data || data.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ShieldCheck className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No hay profesionales pendientes de aprobación.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {data?.map((pro) => (
          <Card key={pro.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>
                    {pro.firstName} {pro.lastName}
                  </CardTitle>
                  <CardDescription>
                    {pro.email} · {pro.phone} · {pro.city}, {pro.province}
                  </CardDescription>
                </div>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {pro.services.map((s) => (
                <p key={s.id} className="text-sm">
                  <span className="font-medium">{s.category.name}</span> — {s.title} ({s.status})
                </p>
              ))}
              <div className="space-y-1">
                {pro.complianceDocuments.map((doc) => (
                  <p key={doc.id} className="text-sm text-muted-foreground">
                    {doc.docType}: {doc.documentNumber ?? '—'} ({doc.status})
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => approve.mutate(pro.id)}
                  disabled={approve.isPending || reject.isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reject.mutate(pro.id)}
                  disabled={approve.isPending || reject.isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rechazar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
