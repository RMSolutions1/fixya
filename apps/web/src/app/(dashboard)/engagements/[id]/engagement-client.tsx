'use client';

import { use, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CreditCard,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Star,
  Play,
  Flag,
  AlertTriangle,
  Clock,
  Banknote,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { COMPANY } from '@/lib/company-info';
import { SANDBOX_PAYMENTS_ENABLED } from '@/lib/env';
import {
  useEngagementExpediente,
  useCreateCheckout,
  useConfirmSandboxPayment,
  useReleaseFunds,
  useCreateReview,
  useStartEngagement,
  useCompleteEngagement,
  useOpenDispute,
  usePlatformIntegrations,
} from '@/hooks/use-marketplace';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  QUOTE_SELECTED: 'Presupuesto aceptado',
  PAYMENT_PENDING: 'Pago pendiente',
  FUNDS_HELD: 'Fondos retenidos',
  IN_PROGRESS: 'En ejecución',
  PENDING_APPROVAL: 'Pendiente de conformidad',
  FUNDS_RELEASED: 'Fondos liberados',
  WARRANTY: 'En garantía',
  CLOSED: 'Cerrado',
  CANCELLED: 'Cancelado',
  DISPUTED: 'En disputa',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'success' | 'warning'> = {
  QUOTE_SELECTED: 'secondary',
  PAYMENT_PENDING: 'secondary',
  FUNDS_HELD: 'default',
  IN_PROGRESS: 'default',
  PENDING_APPROVAL: 'warning',
  FUNDS_RELEASED: 'success',
  WARRANTY: 'success',
  CLOSED: 'outline',
  CANCELLED: 'outline',
  DISPUTED: 'warning',
};

const TIMELINE_ICONS: Record<string, string> = {
  QuotationAccepted: '✅',
  PaymentConfirmed: '💳',
  WorkStarted: '🔨',
  WorkCompleted: '🏁',
  FundsReleased: '💸',
  DisputeOpened: '⚠️',
  ReviewCreated: '⭐',
};

// ─── Review card ─────────────────────────────────────────────────────────────

function ReviewCard({
  engagementId,
  alreadyReviewed,
}: {
  engagementId: string;
  alreadyReviewed: boolean;
}) {
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  if (alreadyReviewed || done) {
    return (
      <Card className="border-[hsl(var(--sol))]/30 bg-[hsl(var(--sol))]/5">
        <CardContent className="flex items-center gap-3 py-5">
          <Star className="h-6 w-6 fill-[hsl(var(--sol))] text-[hsl(var(--sol))]" />
          <div>
            <p className="font-semibold">¡Gracias por tu reseña!</p>
            <p className="text-sm text-muted-foreground">Tu opinión ayuda a otros clientes a elegir mejor.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const submit = async () => {
    setError('');
    if (rating < 1) { setError('Elegí una calificación de 1 a 5 estrellas'); return; }
    try {
      await createReview.mutateAsync({ engagementId, rating, comment: comment || undefined });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la reseña');
    }
  };

  return (
    <Card className="border-[hsl(var(--sol))]/30 bg-[hsl(var(--sol))]/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-5 w-5 text-[hsl(var(--sol))]" />
          Calificá al profesional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} estrellas`}
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  (hover || rating) >= n
                    ? 'fill-[hsl(var(--sol))] text-[hsl(var(--sol))]'
                    : 'text-muted-foreground/40',
                )}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contanos cómo fue tu experiencia (opcional)"
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button variant="emprenor" onClick={submit} disabled={createReview.isPending}>
          {createReview.isPending ? 'Enviando...' : 'Enviar reseña'}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Dispute form ─────────────────────────────────────────────────────────────

function DisputeForm({ engagementId }: { engagementId: string }) {
  const openDispute = useOpenDispute();
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex items-center gap-3 py-5">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-sm">Disputa abierta. El equipo de FixYa revisará el caso.</p>
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <div className="text-right">
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
          <AlertTriangle className="mr-1 h-4 w-4" />
          Abrir disputa
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-destructive/40 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Abrir disputa</CardTitle>
        <CardDescription>
          Explicá el problema. El equipo de FixYa revisará el caso y mediará entre las partes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describí el problema con detalle..."
          rows={4}
          minLength={20}
          maxLength={2000}
          className="w-full rounded-lg border border-destructive/30 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive"
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={reason.trim().length < 20 || openDispute.isPending}
            onClick={async () => {
              await openDispute.mutateAsync({ engagementId, reason });
              setDone(true);
            }}
          >
            {openDispute.isPending ? 'Enviando...' : 'Confirmar disputa'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const REVIEWABLE = ['FUNDS_RELEASED', 'WARRANTY', 'CLOSED', 'PENDING_APPROVAL'];
const DISPUTABLE = ['FUNDS_HELD', 'IN_PROGRESS', 'PENDING_APPROVAL'];

export default function EngagementExpedienteClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentResult = searchParams.get('payment');

  const { data, isLoading, refetch } = useEngagementExpediente(id);
  const role = useAuthStore((s) => s.user?.memberships?.[0]?.role);
  const userId = useAuthStore((s) => s.user?.id);

  const checkout = useCreateCheckout();
  const sandboxConfirm = useConfirmSandboxPayment();
  const releaseFunds = useReleaseFunds();
  const startWork = useStartEngagement();
  const completeWork = useCompleteEngagement();
  const { data: integrations } = usePlatformIntegrations();
  const paymentsReady = SANDBOX_PAYMENTS_ENABLED || integrations?.mercadopago.ready === true;

  // Polling post-MP: si el usuario regresa con ?payment=success pero el estado
  // todavía es PAYMENT_PENDING, refresca cada 3 s hasta confirmar o timeout.
  useEffect(() => {
    if (paymentResult !== 'success') return;
    let tries = 0;
    const interval = setInterval(async () => {
      tries++;
      await refetch();
      const status = data?.status;
      if (
        status === 'FUNDS_HELD' ||
        status === 'IN_PROGRESS' ||
        tries >= 10
      ) {
        clearInterval(interval);
        // Limpiar el query param para no repollear en recargas
        router.replace(`/engagements/${id}`, { scroll: false });
      }
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentResult]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando expediente...
      </div>
    );
  }
  if (!data) return <p className="py-12 text-center text-muted-foreground">Expediente no encontrado.</p>;

  const timeline =
    (data.timelineEvents as Array<{ eventType: string; createdAt: string; payload: unknown }>) ?? [];
  const payment = data.payment as { id: string; status: string; amount: string } | null;
  const status = String(data.status);
  const isClient = role === 'CLIENTE';
  const isProfessional = role === 'PROFESIONAL' || role === 'EMPRESA';
  const isOwnEngagement =
    (data.client as { id: string }).id === userId ||
    (data.professional as { id: string }).id === userId;

  const handleCheckout = async () => {
    try {
      const result = await checkout.mutateAsync(id);
      if (result.mode === 'mercadopago' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        await refetch();
      }
    } catch {
      // el hook ya maneja el error
    }
  };

  const handleSandboxPay = async () => {
    try {
      if (!payment) {
        const result = await checkout.mutateAsync(id);
        if (result.paymentId) {
          await sandboxConfirm.mutateAsync(result.paymentId);
        }
      } else {
        await sandboxConfirm.mutateAsync(payment.id);
      }
      await refetch();
    } catch {
      // el hook ya maneja el error
    }
  };

  const handleRelease = async () => {
    await releaseFunds.mutateAsync(id);
    await refetch();
  };

  const handleStart = async () => {
    await startWork.mutateAsync(id);
    await refetch();
  };

  const handleComplete = async () => {
    await completeWork.mutateAsync({ engagementId: id });
    await refetch();
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
        description={`Contratación #${id.slice(0, 8).toUpperCase()} · trazabilidad completa`}
        action={
          <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
        }
      />

      {/* Banner post-MP */}
      {paymentResult === 'success' && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <Loader2 className="h-4 w-4 animate-spin" />
          Pago procesado — actualizando expediente...
        </div>
      )}
      {paymentResult === 'failure' && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          El pago no pudo completarse. Intentalo nuevamente o elegí otro medio de pago.
        </div>
      )}
      {paymentResult === 'pending' && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          El pago está pendiente de acreditación. Te notificaremos cuando se confirme.
        </div>
      )}

      {/* Resumen de partes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monto total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(String(data.totalAmount))}</p>
            <p className="text-xs text-muted-foreground">{String(data.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
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
          <CardHeader className="pb-2">
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

      {/* ── ACCIONES CLIENTE ─────────────────────────────────────────────────── */}

      {isClient && (status === 'QUOTE_SELECTED' || status === 'PAYMENT_PENDING') && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-5 w-5" />
              Pagar con Mercado Pago
            </CardTitle>
            <CardDescription>
              {paymentsReady
                ? 'El pago queda retenido por FixYa hasta que confirmés la conformidad del servicio.'
                : 'Los pagos en línea se habilitarán en breve. Mientras tanto, coordiná el pago directamente con el profesional.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {!paymentsReady && (
              <div className="mb-2 flex w-full items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Mercado Pago aún no está activo en la plataforma. Si necesitás ayuda, escribinos a{' '}
                  <a href={`mailto:${COMPANY.emails.general}`} className="font-medium underline">
                    {COMPANY.emails.general}
                  </a>
                  .
                </p>
              </div>
            )}
            <Button
              variant="emprenor"
              onClick={handleCheckout}
              disabled={checkout.isPending || !paymentsReady}
            >
              {checkout.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparando checkout...</>
              ) : (
                <><CreditCard className="mr-2 h-4 w-4" /> Pagar con Mercado Pago</>
              )}
            </Button>
            {SANDBOX_PAYMENTS_ENABLED && (
              <Button
                variant="outline"
                onClick={handleSandboxPay}
                disabled={sandboxConfirm.isPending || checkout.isPending}
              >
                {sandboxConfirm.isPending ? 'Simulando...' : '🧪 Simular pago (solo dev)'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isClient && status === 'PENDING_APPROVAL' && (
        <Card className="border-emerald-300 bg-emerald-50/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              El profesional marcó el trabajo como terminado
            </CardTitle>
            <CardDescription>
              Revisá el trabajo. Al confirmar conformidad, los fondos se liberan al profesional.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="emprenor" onClick={handleRelease} disabled={releaseFunds.isPending}>
              {releaseFunds.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Liberando fondos...</>
              ) : (
                <><Banknote className="mr-2 h-4 w-4" /> Confirmar y liberar fondos</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isClient && status === 'FUNDS_HELD' && (
        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="flex items-start gap-3 py-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">Fondos retenidos de forma segura</p>
              <p className="text-sm text-emerald-700">
                El pago está bajo custodia de Mercado Pago hasta que confirmes la conformidad del trabajo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isClient && REVIEWABLE.includes(status) && (
        <ReviewCard
          engagementId={id}
          alreadyReviewed={timeline.some((e) => e.eventType === 'ReviewCreated')}
        />
      )}

      {isClient && DISPUTABLE.includes(status) && (
        <DisputeForm engagementId={id} />
      )}

      {/* ── ACCIONES PROFESIONAL ─────────────────────────────────────────────── */}

      {isProfessional && status === 'FUNDS_HELD' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Play className="h-5 w-5" />
              Los fondos están listos — podés iniciar el trabajo
            </CardTitle>
            <CardDescription>
              Al iniciar, el cliente sabrá que estás en camino. Los fondos siguen bajo custodia hasta su conformidad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleStart} disabled={startWork.isPending}>
              {startWork.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando...</>
              ) : (
                <><Play className="mr-2 h-4 w-4" /> Iniciar trabajo</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isProfessional && status === 'IN_PROGRESS' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flag className="h-5 w-5" />
              Marcar trabajo como terminado
            </CardTitle>
            <CardDescription>
              Notificará al cliente para que revise y confirme la conformidad. Eso libera los fondos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="emprenor" onClick={handleComplete} disabled={completeWork.isPending}>
              {completeWork.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              ) : (
                <><Flag className="mr-2 h-4 w-4" /> Trabajo terminado — notificar al cliente</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {isProfessional && status === 'FUNDS_RELEASED' && (
        <Card className="border-emerald-300 bg-emerald-50/60">
          <CardContent className="flex items-start gap-3 py-5">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-800">¡Fondos liberados!</p>
              <p className="text-sm text-emerald-700">
                El cliente confirmó la conformidad. Los fondos (menos comisión FixYa) ya están disponibles.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isProfessional && status === 'PENDING_APPROVAL' && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex items-start gap-3 py-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-800">Esperando conformidad del cliente</p>
              <p className="text-sm text-amber-700">
                El cliente recibió la notificación. Cuando confirme, los fondos se liberarán automáticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── WALLET ───────────────────────────────────────────────────────────── */}

      {!!data.walletAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet de la contratación</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Retenido', key: 'heldAmount' },
              { label: 'Liberado', key: 'releasedAmount' },
              { label: 'Comisión FixYa', key: 'commissionAmount' },
            ].map(({ label, key }) => (
              <div key={key}>
                <p className="text-muted-foreground">{label}</p>
                <p className="font-semibold text-base">
                  {formatCurrency(String((data.walletAccount as Record<string, string>)[key]))}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── PAGO ─────────────────────────────────────────────────────────────── */}

      {!!payment && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estado del pago</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Badge variant={payment.status === 'APPROVED' ? 'success' : 'secondary'}>
              {payment.status === 'APPROVED' ? 'Aprobado' : payment.status}
            </Badge>
            <span className="font-semibold">{formatCurrency(payment.amount)}</span>
          </CardContent>
        </Card>
      )}

      {/* ── TIMELINE ─────────────────────────────────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline del expediente</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin eventos registrados aún.</p>
          ) : (
            <ol className="relative space-y-4 border-l-2 border-border pl-5">
              {[...timeline].reverse().map((event, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[1.625rem] flex h-6 w-6 items-center justify-center rounded-full bg-background text-sm ring-2 ring-border">
                    {TIMELINE_ICONS[event.eventType] ?? '📌'}
                  </span>
                  <p className="font-medium">{STATUS_LABELS[event.eventType] ?? event.eventType}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
