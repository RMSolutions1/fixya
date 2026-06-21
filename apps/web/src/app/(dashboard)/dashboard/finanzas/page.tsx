'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  CreditCard,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import {
  useAdminFinanceSummary,
  useAdminFinanceWallets,
  useAdminFinancePayments,
  useAdminFinanceLedger,
  useUpdateCommissionRule,
} from '@/hooks/use-admin-finance';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { resolveDashboardRole } from '@/lib/dashboard-nav';

type FinanceTab = 'wallets' | 'payments' | 'ledger';

interface WalletItem {
  id: string;
  engagementId: string;
  engagementStatus: string;
  totalAmount: number;
  currency: string;
  status: string;
  heldAmount: number;
  releasedAmount: number;
  commissionAmount: number;
  warrantyHeld: number;
  tenant: { name: string; slug: string };
  client: { firstName: string; lastName: string; email: string };
  professional: { firstName: string; lastName: string };
  updatedAt: string;
}

interface PaymentItem {
  id: string;
  engagementId: string;
  status: string;
  amount: number;
  currency: string;
  mpPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
  engagement: {
    client: { firstName: string; lastName: string };
    professional: { firstName: string; lastName: string };
  };
}

interface LedgerLine {
  id: string;
  accountCode: string;
  debit: number;
  credit: number;
}

interface LedgerEntry {
  id: string;
  entryType: string;
  description: string;
  postedAt: string;
  lines: LedgerLine[];
  walletAccount?: { engagementId: string; tenant: { name: string } };
}

function PaginationBar({
  meta,
  onPage,
}: {
  meta: { page: number; pages: number; total: number };
  onPage: (p: number) => void;
}) {
  if (meta.pages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
      <span>
        Página {meta.page} de {meta.pages} ({meta.total} registros)
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPage(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.pages}
          onClick={() => onPage(meta.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CommissionRuleEditor({
  rule,
  canEdit,
}: {
  rule: { id: string; name: string; ratePercent: number; isGlobal: boolean };
  canEdit: boolean;
}) {
  const [value, setValue] = useState(String(Math.round(rule.ratePercent * 10000) / 100));
  const update = useUpdateCommissionRule();

  const handleSave = () => {
    const pct = parseFloat(value.replace(',', '.'));
    if (Number.isNaN(pct) || pct < 0 || pct > 50) return;
    update.mutate({ id: rule.id, ratePercent: pct / 100 });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
      <div>
        <p className="font-medium">{rule.name}</p>
        <p className="text-xs text-muted-foreground">
          {rule.isGlobal ? 'Regla global' : 'Regla por tenant/categoría'}
        </p>
      </div>
      {canEdit ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={50}
            step={0.1}
            className="w-24"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <span className="text-sm text-muted-foreground">%</span>
          <Button size="sm" onClick={handleSave} disabled={update.isPending}>
            Guardar
          </Button>
        </div>
      ) : (
        <Badge variant="secondary">{(rule.ratePercent * 100).toFixed(2)}%</Badge>
      )}
    </div>
  );
}

export default function FinanzasPage() {
  const role = resolveDashboardRole(useAuthStore((s) => s.user?.memberships?.[0]?.role));
  const canEditCommission = role === 'SUPER_ADMIN';
  const [tab, setTab] = useState<FinanceTab>('wallets');
  const [page, setPage] = useState(1);

  const { data: summary, isLoading: summaryLoading } = useAdminFinanceSummary();
  const { data: wallets, isLoading: walletsLoading } = useAdminFinanceWallets(
    tab === 'wallets' ? page : 1,
  );
  const { data: payments, isLoading: paymentsLoading } = useAdminFinancePayments(
    tab === 'payments' ? page : 1,
  );
  const { data: ledger, isLoading: ledgerLoading } = useAdminFinanceLedger(
    tab === 'ledger' ? page : 1,
  );

  const switchTab = (next: FinanceTab) => {
    setTab(next);
    setPage(1);
  };

  const mp = summary?.integrations.mercadopago;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Finanzas de la plataforma"
        description="Vista global — wallets, pagos Mercado Pago, libro diario y comisiones FixYa"
      />

      {summaryLoading && <p className="text-muted-foreground">Cargando resumen...</p>}

      {summary && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Retenido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summary.wallet.held)}</p>
                <p className="text-xs text-muted-foreground">
                  {summary.wallet.accounts} cuentas wallet
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Liberado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summary.wallet.released)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Comisiones FixYa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summary.wallet.commission)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Garantía retenida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(summary.wallet.warranty)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Mercado Pago
                </CardTitle>
                <CardDescription>Estado de integración en producción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {mp?.ready ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span>{mp?.ready ? 'Checkout operativo' : 'Pendiente de credenciales'}</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Access token: {mp?.accessToken ? 'Configurado' : 'Falta MP_ACCESS_TOKEN'}</li>
                  <li>Webhook secret: {mp?.webhookSecret ? 'Configurado' : 'Falta MP_WEBHOOK_SECRET'}</li>
                  <li className="break-all">Webhook: {mp?.webhookUrl}</li>
                </ul>
                {!mp?.ready && (
                  <p className="text-xs text-muted-foreground">
                    Activación: configurá variables en Vercel y ejecutá{' '}
                    <code className="rounded bg-muted px-1">npm run mp:enable</code>
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contrataciones y pagos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.engagements.length === 0 && summary.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sin contrataciones ni pagos registrados aún.
                  </p>
                ) : (
                  <>
                    {summary.engagements.map((e) => (
                      <div key={e.status} className="flex justify-between text-sm">
                        <span>Contrataciones {e.status}</span>
                        <Badge variant="outline">{e.count}</Badge>
                      </div>
                    ))}
                    {summary.payments.map((p) => (
                      <div key={p.status} className="flex justify-between text-sm">
                        <span>
                          Pagos {p.status} ({formatCurrency(p.totalAmount)})
                        </span>
                        <Badge variant="outline">{p.count}</Badge>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {summary.commissionRules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reglas de comisión</CardTitle>
                <CardDescription>
                  {canEditCommission
                    ? 'Editá la tasa global de la plataforma'
                    : 'Solo lectura — contactá al super admin para cambios'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.commissionRules.map((rule) => (
                  <CommissionRuleEditor key={rule.id} rule={rule} canEdit={canEditCommission} />
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['wallets', 'Cuentas wallet', Wallet],
            ['payments', 'Pagos MP', CreditCard],
            ['ledger', 'Libro diario', BookOpen],
          ] as const
        ).map(([key, label, Icon]) => (
          <Button
            key={key}
            variant={tab === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchTab(key)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {tab === 'wallets' && (
        <Card>
          <CardHeader>
            <CardTitle>Cuentas por contratación</CardTitle>
          </CardHeader>
          <CardContent>
            {walletsLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : !wallets?.items.length ? (
              <p className="text-muted-foreground">No hay cuentas wallet registradas</p>
            ) : (
              <>
                <div className="space-y-3">
                  {(wallets.items as WalletItem[]).map((account) => (
                    <div
                      key={account.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {account.client.firstName} {account.client.lastName} →{' '}
                          {account.professional.firstName} {account.professional.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.tenant.name} · {account.engagementStatus} ·{' '}
                          {formatCurrency(account.totalAmount)}
                        </p>
                      </div>
                      <Badge variant="outline">{account.status}</Badge>
                      <div className="text-right text-sm">
                        <p>Retenido: {formatCurrency(account.heldAmount)}</p>
                        <p className="text-muted-foreground">
                          Comisión: {formatCurrency(account.commissionAmount)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/engagements/${account.engagementId}`}>Expediente</Link>
                      </Button>
                    </div>
                  ))}
                </div>
                {wallets.meta && <PaginationBar meta={wallets.meta} onPage={setPage} />}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle>Pagos Mercado Pago</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : !payments?.items.length ? (
              <p className="text-muted-foreground">No hay pagos registrados</p>
            ) : (
              <>
                <div className="space-y-3">
                  {(payments.items as PaymentItem[]).map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm"
                    >
                      <div>
                        <p className="font-medium">{formatCurrency(p.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.engagement.client.firstName} {p.engagement.client.lastName} · MP:{' '}
                          {p.mpPaymentId ?? '—'}
                        </p>
                      </div>
                      <Badge variant="outline">{p.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleString('es-AR')}
                      </span>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/engagements/${p.engagementId}`}>Expediente</Link>
                      </Button>
                    </div>
                  ))}
                </div>
                {payments.meta && <PaginationBar meta={payments.meta} onPage={setPage} />}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'ledger' && (
        <Card>
          <CardHeader>
            <CardTitle>Libro diario global</CardTitle>
          </CardHeader>
          <CardContent>
            {ledgerLoading ? (
              <p className="text-muted-foreground">Cargando...</p>
            ) : !ledger?.entries.length ? (
              <p className="text-muted-foreground">Sin asientos contables</p>
            ) : (
              <>
                <div className="space-y-3">
                  {(ledger.entries as LedgerEntry[]).map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="secondary">{entry.entryType}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.postedAt).toLocaleString('es-AR')}
                        </span>
                      </div>
                      <p className="mt-2 font-medium">{entry.description}</p>
                      {entry.walletAccount && (
                        <p className="text-xs text-muted-foreground">
                          {entry.walletAccount.tenant.name}
                        </p>
                      )}
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {entry.lines.map((line) => (
                          <li key={line.id}>
                            {line.accountCode}: D {formatCurrency(line.debit)} / C{' '}
                            {formatCurrency(line.credit)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {ledger.meta && <PaginationBar meta={ledger.meta} onPage={setPage} />}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
