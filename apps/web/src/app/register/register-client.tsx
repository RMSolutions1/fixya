'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterForm } from '@/lib/validators/auth';
import { useAuth } from '@/hooks/use-auth';
import { AuthBrandPanel } from '@/components/brand/auth-brand-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';
import { User, Wrench, Building2 } from 'lucide-react';

const roles = [
  {
    value: 'CLIENTE' as const,
    label: 'Usuario',
    description: 'Necesito contratar servicios para mi hogar o negocio',
    icon: User,
  },
  {
    value: 'PROFESIONAL' as const,
    label: 'Profesional',
    description: 'Ofrezco servicios y quiero conseguir más clientes',
    icon: Wrench,
  },
  {
    value: 'EMPRESA' as const,
    label: 'Empresa',
    description: 'Gestiono un equipo de profesionales',
    icon: Building2,
  },
];

export default function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CLIENTE' },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (roleParam === 'PROFESIONAL' || roleParam === 'CLIENTE' || roleParam === 'EMPRESA') {
      setValue('role', roleParam);
    }
  }, [roleParam, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await registerUser(data);
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al registrarse');
    }
  };

  return (
    <div className="flex min-h-full flex-1">
      <AuthBrandPanel
        title="Sumate a la red de servicios argentina"
        subtitle="Unite a la red nacional de servicios del Grupo Emprenor — clientes, profesionales y empresas con Mercado Pago y expediente digital."
      />
      <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg border-primary/10 shadow-celeste">
        <CardHeader className="text-center lg:hidden">
          <div className="mx-auto mb-4">
            <Logo showTagline showSun />
          </div>
        </CardHeader>
        <CardHeader className="hidden lg:block">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Iniciar sesión
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="mb-3 block">Quiero registrarme como</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="grid gap-2">
                    {roles.map(({ value, label, description, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-3 text-left transition-all',
                          field.value === value
                            ? 'border-primary bg-primary/5 shadow-celeste'
                            : 'hover:border-primary/40',
                        )}
                      >
                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full shadow-celeste" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : `Continuar como ${roles.find((r) => r.value === selectedRole)?.label}`}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
