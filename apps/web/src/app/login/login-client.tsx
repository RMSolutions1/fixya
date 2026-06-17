'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Lock, ShieldCheck, BadgeCheck } from 'lucide-react';
import { loginSchema, type LoginForm } from '@/lib/validators/auth';
import { useAuth } from '@/hooks/use-auth';
import { AuthBrandPanel } from '@/components/brand/auth-brand-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';

const trustSignals = [
  { icon: Lock, label: 'Conexión cifrada' },
  { icon: BadgeCheck, label: 'Profesionales verificados' },
  { icon: ShieldCheck, label: 'Pagos protegidos' },
];

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data);
      router.push(redirect);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al iniciar sesión';
      setError(
        /timeout|fetch|network|Failed/i.test(message)
          ? 'No pudimos conectar con el servidor. Reintentá en unos segundos.'
          : message,
      );
    }
  };

  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <AuthBrandPanel
        title="Bienvenido de vuelta"
        subtitle="Ingresá a tu panel FixYa — pagos protegidos con Mercado Pago, expediente digital y profesionales verificados del Grupo Emprenor."
      />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-primary/10 shadow-celeste">
          <CardHeader className="text-center lg:hidden">
            <div className="mx-auto mb-4">
              <Logo showTagline showSun />
            </div>
          </CardHeader>
          <CardHeader className="hidden text-center lg:block">
            <CardTitle className="text-2xl">Ingresá a FixYa</CardTitle>
            <CardDescription>Tu cuenta te espera</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="tu@email.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="pr-10"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    onKeyUp={checkCaps}
                    onKeyDown={checkCaps}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {capsLock && (
                  <p className="text-xs text-amber-600">Bloq Mayús está activado.</p>
                )}
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button type="submit" className="w-full shadow-celeste" disabled={isSubmitting}>
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Registrate gratis
              </Link>
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t pt-4">
              {trustSignals.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                >
                  <Icon className="h-3.5 w-3.5 text-pampa" />
                  {label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
