'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SANDBOX_PAYMENTS_ENABLED } from '@/lib/env';
import {
  useEngagementExpediente,
  useCreateCheckout,
  useConfirmSandboxPayment,
  useReleaseFunds,
} from '@/hooks/use-marketplace';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';

const statusLabels: Record<string, string> = {
  QUOTE_SELECTED: 'Presupuesto aceptado',
  PAYMENT_PENDING: 'Pago pendiente',
  FUNDS_HELD: 'Fondos retenidos',
  FUNDS_RELEASED: 'Fondos liberados',
  IN_PROGRESS: 'En progreso',
  CLOSED: 'Cerrado',
};

export default function EngagementExpedienteClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const paymentResult = searchParams.get('payment');
  const { data, isLoading, refetch } = useEngagementExpediente(id);
  const role = useAuthStore((s) => s.user?.memberships?.[0]?.role);
  const checkout = useCreateCheckout();
  const sandboxConfirm = useConfirmSandboxPayment();
  const releaseFunds = useReleaseFunds();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando expediente...
      </div>
    );
  }
  if (!data) return <p>Expediente no encontrado</p>;

  const timeline =
    (data.timelineEvents as Array<{ eventType: string; createdAt: string; payload: unknown }>) ??
    [];
  const payment = data.payment as {
    id: string;
    status: string;
    amount: string;
  } | null;
  const status = String(data.status);
  const isClient = role === 'CLIENTE';

  const handleCheckout = async () => {
    const result = await checkout.mutateAsync(id);
    if (result.mode === 'mercadopago' && result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    } else {
      refetch();
    }
  };

  const handleSandboxPay = async () => {
    if (!payment) {
      const result = await checkout.mutateAsync(id);
      if (result.paymentId) {
        await sandboxConfirm.mutateAsync(result.paymentId);
        refetch();
      }
    } else {
      await sandboxConfirm.mutateAsync(payment.id);
      refetch();
    }
  };

  const handleRelease = async () => {
    await releaseFunds.mutateAsync(id);
    refetch();
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
        title="Expediente digital"
        description={`Contratación #${id.slice(0, 8)} · seguimiento, pagos y liberación de fondos`}
        action={<Badge variant="secondary">{statusLabels[status] ?? status}</Badge>}
      />

      {paymentResult === 'success' && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Pago procesado. Actualizando expediente...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Monto</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(String(data.totalAmount))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {(data.client as { firstName: string; lastName: string }).firstName}{' '}
              {(data.client as { firstName: string; lastName: string }).lastName}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Profesional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {(data.professional as { firstName: string; lastName: string }).firstName}{' '}
              {(data.professional as { firstName: string; lastName: string }).lastName}
            </p>
          </CardContent>
        </Card>
      </div>

      {isClient && (status === 'QUOTE_SELECTED' || status === 'PAYMENT_PENDING') && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pagar con Mercado Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={handleCheckout} disabled={checkout.isPending}>
              {checkout.isPending ? 'Preparando...' : 'Pagar con Mercado Pago'}
            </Button>
            {SANDBOX_PAYMENTS_ENABLED && (
              <Button
                variant="outline"
                onClick={handleSandboxPay}
                disabled={sandboxConfirm.isPending || checkout.isPending}
              >
                {sandboxConfirm.isPending ? 'Confirmando...' : 'Simular pago (solo dev)'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isClient && status === 'FUNDS_HELD' && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Confirmar conformidad del servicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Al confirmar, los fondos se liberan al profesional (menos comisión FixYa).
            </p>
            <Button onClick={handleRelease} disabled={releaseFunds.isPending}>
              {releaseFunds.isPending ? 'Liberando...' : 'Liberar fondos al profesional'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline de eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-muted-foreground">Sin eventos registrados</p>
          ) : (
            <ul className="space-y-3">
              {timeline.map((event, i) => (
                <li key={i} className="flex items-start gap-3 border-l-2 border-primary pl-4">
                  <div>
                    <p className="font-medium">{event.eventType}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {!!payment && (
        <Card>
          <CardHeader>
            <CardTitle>Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant={payment.status === 'APPROVED' ? 'success' : 'secondary'}>
                {payment.status}
              </Badge>
              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!!data.walletAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet contable</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Retenido</p>
              <p className="font-semibold">
                {formatCurrency(String((data.walletAccount as { heldAmount: string }).heldAmount))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Liberado</p>
              <p className="font-semibold">
                {formatCurrency(
                  String((data.walletAccount as { releasedAmount: string }).releasedAmount),
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Comisión</p>
              <p className="font-semibold">
                {formatCurrency(
                  String((data.walletAccount as { commissionAmount: string }).commissionAmount),
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
