'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { AuthBrandPanel } from '@/components/brand/auth-brand-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';

interface ForgotResponse {
  message: string;
  devToken?: string;
}

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devToken, setDevToken] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setDevToken('');
    try {
      const res = await apiRequest<ForgotResponse>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setMessage(res.message);
      if (res.devToken) setDevToken(res.devToken);
    } catch {
      setMessage('Si el email está registrado, te enviamos las instrucciones.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <AuthBrandPanel
        title="Recuperá tu acceso"
        subtitle="Te enviamos un enlace para crear una contraseña nueva y volver a tu panel FixYa."
      />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-primary/10 shadow-celeste">
          <CardHeader className="text-center lg:hidden">
            <div className="mx-auto mb-4">
              <Logo showTagline showSun />
            </div>
          </CardHeader>
          <CardHeader className="hidden text-center lg:block">
            <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>Ingresá tu email y te ayudamos</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {message && <p className="text-sm text-pampa">{message}</p>}
              {devToken && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-medium">Modo desarrollo — token de prueba:</p>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="break-all font-mono underline"
                  >
                    Continuar al restablecimiento
                  </Link>
                </div>
              )}
              <Button type="submit" className="w-full shadow-celeste" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Volver a iniciar sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
