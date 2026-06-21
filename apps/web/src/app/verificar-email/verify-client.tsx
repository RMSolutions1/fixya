'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { AuthBrandPanel } from '@/components/brand/auth-brand-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Falta el token de verificación en el enlace.');
      return;
    }

    apiRequest<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'No se pudo verificar el email.');
      });
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <AuthBrandPanel
        title="Verificación de email"
        subtitle="Confirmá tu dirección para activar todas las funciones de tu cuenta FixYa."
      />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-primary/10 shadow-celeste">
          <CardHeader className="text-center lg:hidden">
            <div className="mx-auto mb-4">
              <Logo showTagline showSun />
            </div>
          </CardHeader>
          <CardHeader className="hidden text-center lg:block">
            <CardTitle className="text-2xl">Verificar email</CardTitle>
            <CardDescription>Confirmamos tu dirección de correo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Verificando tu email...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-pampa" />
                <p className="font-medium">{message}</p>
                <Button asChild className="w-full shadow-celeste">
                  <Link href="/dashboard">Ir a mi panel</Link>
                </Button>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <p className="text-sm text-destructive">{message}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard">Volver al panel</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
