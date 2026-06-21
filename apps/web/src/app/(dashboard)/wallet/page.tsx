'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWalletBalance, useWalletLedger } from '@/hooks/use-marketplace';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { canAccessAdminFinance, resolveDashboardRole } from '@/lib/dashboard-nav';

export default function WalletPage() {
  const router = useRouter();
  const role = resolveDashboardRole(useAuthStore((s) => s.user?.memberships?.[0]?.role));

  useEffect(() => {
    if (canAccessAdminFinance(role)) {
      router.replace('/dashboard/finanzas');
    }
  }, [role, router]);

  const financeRedirect = canAccessAdminFinance(role);
  const { data, isLoading } = useWalletBalance(!financeRedirect);
  const { data: ledger, isLoading: ledgerLoading } = useWalletLedger(1, 20, !financeRedirect);

  if (financeRedirect) {
    return <p className="text-muted-foreground">Redirigiendo al panel financiero...</p>;
  }

  if (isLoading) return <p className="text-muted-foreground">Cargando wallet...</p>;

  const summary = data?.summary ?? { held: 0, released: 0, commission: 0, warranty: 0 };
  const accounts = data?.accounts ?? [];
  const entries = ledger?.entries ?? [];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Wallet contable"
        description="Registro contable de operaciones — FixYa no custodia fondos"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Retenido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.held)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Liberado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.released)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Comisiones FixYa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.commission)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Garantía retenida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.warranty)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas por contratación</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">No hay movimientos registrados aún</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">Contratación</p>
                    <p className="text-xs text-muted-foreground">{account.engagementId}</p>
                  </div>
                  <Badge variant="outline">{account.status}</Badge>
                  <div className="text-right text-sm">
                    <p>Retenido: {formatCurrency(account.heldAmount)}</p>
                    <p className="text-muted-foreground">
                      Liberado: {formatCurrency(account.releasedAmount)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/engagements/${account.engagementId}`}>Ver expediente</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Libro diario</CardTitle>
        </CardHeader>
        <CardContent>
          {ledgerLoading ? (
            <p className="text-muted-foreground">Cargando asientos...</p>
          ) : entries.length === 0 ? (
            <p className="text-muted-foreground">Sin asientos contables registrados</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {entries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="secondary">{entry.entryType}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.postedAt).toLocaleString('es-AR')}
                      </span>
                    </div>
                    <p className="mt-2 font-medium">{entry.description}</p>
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
              <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Fecha</th>
                    <th className="pb-2 pr-4">Tipo</th>
                    <th className="pb-2 pr-4">Descripción</th>
                    <th className="pb-2">Líneas</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {new Date(entry.postedAt).toLocaleString('es-AR')}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{entry.entryType}</Badge>
                      </td>
                      <td className="py-3 pr-4">{entry.description}</td>
                      <td className="py-3">
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          {entry.lines.map((line) => (
                            <li key={line.id}>
                              {line.accountCode}: D {formatCurrency(line.debit)} / C{' '}
                              {formatCurrency(line.credit)}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
