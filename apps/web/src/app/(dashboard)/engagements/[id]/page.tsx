import { Suspense } from 'react';
import EngagementExpedienteClient from './engagement-client';

export default function EngagementExpedientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Cargando expediente...</p>}>
      <EngagementExpedienteClient params={params} />
    </Suspense>
  );
}
