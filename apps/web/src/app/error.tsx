'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { COMPANY } from '@/lib/company-info';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción se puede conectar a Sentry/Datadog aquí
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo showTagline />

      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Algo salió mal</h1>
          <p className="max-w-sm text-muted-foreground">
            Ocurrió un error inesperado. Si el problema persiste, contactanos en{' '}
            <a
              href={`mailto:${COMPANY.emails.general}`}
              className="font-medium text-primary hover:underline"
            >
              {COMPANY.emails.general}
            </a>
            .
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">Referencia: {error.digest}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="emprenor" onClick={reset}>
          Reintentar
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
