'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useServiceRequest,
  useAcceptQuotation,
  useSubmitQuotation,
  useCompareQuotations,
} from '@/hooks/use-marketplace';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';

interface Quotation {
  id: string;
  status: string;
  totalAmount: string;
  estimatedDays: number;
  validUntil: string;
  notes?: string;
  professional: { firstName: string; lastName: string };
  items: Array<{ description: string; quantity: string; unitPrice: string }>;
}

export default function ServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.memberships?.[0]?.role);
  const { data, isLoading } = useServiceRequest(id);
  const { data: comparison } = useCompareQuotations(id);
  const acceptQuotation = useAcceptQuotation();
  const submitQuotation = useSubmitQuotation();

  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteDays, setQuoteDays] = useState('3');
  const [quoteDesc, setQuoteDesc] = useState('Servicio profesional');

  if (isLoading) return <p className="text-muted-foreground">Cargando...</p>;
  if (!data) return <p>No encontrado</p>;

  const quotations = (data.quotations as Quotation[]) ?? [];

  const handleAccept = async (quotationId: string) => {
    const engagement = await acceptQuotation.mutateAsync(quotationId);
    router.push(`/engagements/${engagement.id}`);
  };

  const handleSubmitQuote = async () => {
    await submitQuotation.mutateAsync({
      serviceRequestId: id,
      totalAmount: parseFloat(quoteAmount),
      estimatedDays: parseInt(quoteDays, 10),
      items: [
        {
          description: quoteDesc,
          quantity: 1,
          unitPrice: parseFloat(quoteAmount),
        },
      ],
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/solicitudes"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Volver a solicitudes
      </Link>

      <DashboardPageHeader
        title={String(data.title)}
        description={String(data.description)}
        action={<Badge variant="secondary">{String(data.status)}</Badge>}
      />

      {(data.city || data.province) ? (
        <p className="-mt-4 text-sm text-muted-foreground">
          {[data.city, data.province].filter(Boolean).join(', ')}
        </p>
      ) : null}

      {(role === 'PROFESIONAL' || role === 'EMPRESA') && (
        <Card>
          <CardHeader>
            <CardTitle>Enviar presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monto total (ARS)</Label>
                <Input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Días estimados</Label>
                <Input
                  type="number"
                  value={quoteDays}
                  onChange={(e) => setQuoteDays(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSubmitQuote} disabled={submitQuotation.isPending}>
              Enviar presupuesto
            </Button>
          </CardContent>
        </Card>
      )}

      {comparison?.summary && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Comparador de presupuestos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Presupuestos</p>
              <p className="text-xl font-bold">{comparison.summary.count}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precio mínimo</p>
              <p className="text-xl font-bold">{formatCurrency(comparison.summary.minPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precio promedio</p>
              <p className="text-xl font-bold">{formatCurrency(comparison.summary.avgPrice)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Precio máximo</p>
              <p className="text-xl font-bold">{formatCurrency(comparison.summary.maxPrice)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold">
          Presupuestos recibidos ({quotations.length})
        </h2>
        <div className="mt-4 space-y-4">
          {quotations.map((q) => {
            const cmp = comparison?.quotations.find((c) => c.id === q.id);
            return (
            <Card key={q.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">
                  {q.professional.firstName} {q.professional.lastName}
                </CardTitle>
                <div className="flex gap-1">
                  {cmp?.isCheapest && <Badge variant="success">Mejor precio</Badge>}
                  {cmp?.isFastest && <Badge variant="warning">Más rápido</Badge>}
                  <Badge>{q.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(q.totalAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {q.estimatedDays} días · Válido hasta {formatDate(q.validUntil)}
                    </p>
                    {q.notes && (
                      <p className="mt-2 text-sm">{q.notes}</p>
                    )}
                  </div>
                  {role === 'CLIENTE' && q.status === 'SUBMITTED' && (
                    <Button
                      onClick={() => handleAccept(q.id)}
                      disabled={acceptQuotation.isPending}
                    >
                      Aceptar y contratar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
          })}
          {quotations.length === 0 && (
            <p className="text-muted-foreground">
              Aún no hay presupuestos. Los profesionales de tu zona serán notificados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
