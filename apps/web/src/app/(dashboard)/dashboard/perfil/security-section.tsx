'use client';

import { useState } from 'react';
import { MailCheck, MailWarning, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useApiAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SecuritySection() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { token } = useApiAuth();

  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // ── Email ──────────────────────────────────────────────────────────────
  const resendVerification = async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await apiRequest<{ message: string }>('/auth/resend-verification', {
        method: 'POST',
        token,
      });
      setMsg(res.message);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo reenviar el email.');
    } finally {
      setBusy(false);
    }
  };

  // ── MFA ────────────────────────────────────────────────────────────────
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState('');

  const startMfa = async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await apiRequest<{ secret: string; otpauthUrl: string }>('/auth/mfa/setup', {
        method: 'POST',
        token,
      });
      setSetup(res);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'No se pudo iniciar la configuración.');
    } finally {
      setBusy(false);
    }
  };

  const enableMfa = async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await apiRequest<{ message: string }>('/auth/mfa/enable', {
        method: 'POST',
        token,
        body: { code },
      });
      setMsg(res.message);
      setSetup(null);
      setCode('');
      if (user) setUser({ ...user, mfaEnabled: true });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Código inválido.');
    } finally {
      setBusy(false);
    }
  };

  const disableMfa = async () => {
    setBusy(true);
    setMsg('');
    try {
      const res = await apiRequest<{ message: string }>('/auth/mfa/disable', {
        method: 'POST',
        token,
        body: { code },
      });
      setMsg(res.message);
      setCode('');
      if (user) setUser({ ...user, mfaEnabled: false });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Código inválido.');
    } finally {
      setBusy(false);
    }
  };

  const emailVerified = user?.emailVerified;
  const mfaEnabled = user?.mfaEnabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguridad de la cuenta</CardTitle>
        <CardDescription>Verificá tu email y activá la verificación en dos pasos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email */}
        <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
          <div className="flex items-start gap-3">
            {emailVerified ? (
              <MailCheck className="mt-0.5 h-5 w-5 text-pampa" />
            ) : (
              <MailWarning className="mt-0.5 h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-medium">
                {emailVerified ? 'Email verificado' : 'Email sin verificar'}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          {!emailVerified && (
            <Button size="sm" variant="outline" onClick={resendVerification} disabled={busy}>
              Reenviar
            </Button>
          )}
        </div>

        {/* MFA */}
        <div className="rounded-lg border p-4">
          <div className="flex items-start gap-3">
            {mfaEnabled ? (
              <ShieldCheck className="mt-0.5 h-5 w-5 text-pampa" />
            ) : (
              <ShieldOff className="mt-0.5 h-5 w-5 text-muted-foreground" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                Verificación en dos pasos (2FA){' '}
                {mfaEnabled ? '· activada' : '· desactivada'}
              </p>
              <p className="text-xs text-muted-foreground">
                Protegé tu cuenta con una app como Google Authenticator o Authy.
              </p>

              {!mfaEnabled && !setup && (
                <Button size="sm" className="mt-3" onClick={startMfa} disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activar 2FA'}
                </Button>
              )}

              {!mfaEnabled && setup && (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Escaneá este código en tu app, o cargá la clave manualmente:
                  </p>
                  <code className="block break-all rounded bg-muted px-2 py-1 text-xs">
                    {setup.secret}
                  </code>
                  <a
                    href={setup.otpauthUrl}
                    className="text-xs font-medium text-primary underline"
                  >
                    Abrir en mi app de autenticación
                  </a>
                  <div className="space-y-2">
                    <Label htmlFor="mfa-enable-code">Código de 6 dígitos</Label>
                    <Input
                      id="mfa-enable-code"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                    />
                  </div>
                  <Button size="sm" onClick={enableMfa} disabled={busy || code.length !== 6}>
                    Confirmar y activar
                  </Button>
                </div>
              )}

              {mfaEnabled && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="mfa-disable-code">Ingresá un código para desactivar</Label>
                  <Input
                    id="mfa-disable-code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={disableMfa}
                    disabled={busy || code.length !== 6}
                  >
                    Desactivar 2FA
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      </CardContent>
    </Card>
  );
}
