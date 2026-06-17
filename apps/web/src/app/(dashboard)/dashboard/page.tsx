'use client';

import Link from 'next/link';
import {
  Store,
  FileText,
  Wallet,
  Users,
  ClipboardList,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useServiceRequests, useMarketplaceStats, useWalletBalance } from '@/hooks/use-marketplace';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMounted } from '@/hooks/use-mounted';
import {
  getDashboardDescription,
  resolveDashboardRole,
  canAccessWallet,
  canCreateRequest,
  canSubmitQuotation,
} from '@/lib/dashboard-nav';

export default function DashboardPage() {
  const mounted = useMounted();
  const user = useAuthStore((s) => s.user);
  const role = resolveDashboardRole(user?.memberships?.[0]?.role);
  const { data: requests } = useServiceRequests();
  const { data: stats } = useMarketplaceStats(mounted);
  const { data: wallet } = useWalletBalance(canAccessWallet(role));

  const requestCount = requests?.items?.length ?? 0;
  const publishedCount =
    requests?.items?.filter((r) => r.status === 'PUBLISHED' || r.status === 'QUOTING').length ?? 0;

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title={`Hola, ${user?.firstName ?? 'Usuario'}`}
        description={getDashboardDescription(role)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              {canSubmitQuotation(role) ? 'Oportunidades' : 'Mis solicitudes'}
            </CardDescription>
            <CardTitle className="text-3xl">{requestCount}</CardTitle>
          </CardHeader>
        </Card>
        {stats && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Profesionales activos</CardDescription>
              <CardTitle className="text-3xl">{stats.professionalsCount}</CardTitle>
            </CardHeader>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En curso</CardDescription>
            <CardTitle className="text-3xl">{publishedCount}</CardTitle>
          </CardHeader>
        </Card>
        {wallet && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Saldo liberado</CardDescription>
              <CardTitle className="text-3xl">${wallet.summary.released.toLocaleString('es-AR')}</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {role === 'CLIENTE' && canCreateRequest(role) && (
          <>
            <Card>
              <CardHeader>
                <Users className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Buscar profesional</CardTitle>
                <CardDescription>Explorá perfiles verificados cerca tuyo</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/profesionales">Ver profesionales</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <FileText className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Nueva solicitud</CardTitle>
                <CardDescription>Describí lo que necesitás y recibí presupuestos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/marketplace/requests/new">Crear solicitud</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <ClipboardList className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Mis solicitudes</CardTitle>
                <CardDescription>Seguí el estado de tus pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/solicitudes">Ver solicitudes</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {canSubmitQuotation(role) && (
          <>
            <Card>
              <CardHeader>
                <ClipboardList className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Oportunidades</CardTitle>
                <CardDescription>Solicitudes publicadas por clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/solicitudes">Ver oportunidades</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Marketplace</CardTitle>
                <CardDescription>Competí con presupuestos en solicitudes abiertas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/marketplace">Ir al marketplace</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Wallet className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Wallet</CardTitle>
                <CardDescription>Saldos retenidos, liberados y comisiones</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/wallet">Ver wallet</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {(role === 'SUPER_ADMIN' ||
          role === 'EMPRESA' ||
          role === 'CONTADOR' ||
          role === 'SUPERVISOR' ||
          role === 'OPERADOR') && (
          <>
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">
                  {role === 'CONTADOR' ? 'Contabilidad' : 'Administración'}
                </CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{role}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/marketplace">Marketplace global</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Wallet className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Wallet contable</CardTitle>
                <CardDescription>Ledger, comisiones y garantías</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/wallet">Ver wallet</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Store className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Solicitudes</CardTitle>
                <CardDescription>Monitoreo de operaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/solicitudes">Ver solicitudes</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'AUDITOR' && (
          <>
            <Card>
              <CardHeader>
                <ClipboardList className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Auditoría de solicitudes</CardTitle>
                <CardDescription>Consulta de operaciones publicadas</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/solicitudes">Ver solicitudes</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Wallet className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Libro diario</CardTitle>
                <CardDescription>Asientos contables del tenant</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/wallet">Ver ledger</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'GESTOR_DOCUMENTAL' && (
          <Card>
            <CardHeader>
              <ClipboardList className="mb-2 h-6 w-6 text-primary" />
              <CardTitle className="text-lg">Expedientes</CardTitle>
              <CardDescription>Contrataciones y documentación asociada</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/solicitudes">Ver expedientes</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
