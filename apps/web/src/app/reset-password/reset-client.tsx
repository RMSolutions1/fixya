'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { AuthBrandPanel } from '@/components/brand/auth-brand-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <AuthBrandPanel
        title="Nueva contraseña"
        subtitle="Elegí una contraseña segura para proteger tu cuenta FixYa."
      />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-primary/10 shadow-celeste">
          <CardHeader className="text-center lg:hidden">
            <div className="mx-auto mb-4">
              <Logo showTagline showSun />
            </div>
          </CardHeader>
          <CardHeader className="hidden text-center lg:block">
            <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
            <CardDescription>Creá tu nueva contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <p className="text-sm text-destructive">
                Falta el token de recuperación. Solicitá un nuevo enlace en{' '}
                <Link href="/forgot-password" className="font-medium underline">
                  recuperar contraseña
                </Link>
                .
              </p>
            ) : success ? (
              <p className="text-sm text-pampa">
                Contraseña actualizada. Redirigiendo al inicio de sesión...
              </p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Repetir contraseña</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full shadow-celeste" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar contraseña'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
