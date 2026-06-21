'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterForm } from '@/lib/validators/auth';
import { useAuth } from '@/hooks/use-auth';
import { useCategories } from '@/hooks/use-marketplace';
import { useMounted } from '@/hooks/use-mounted';
import { AuthBrandPanel } from '@/components/brand/auth-brand-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RegisterRegistryHint } from '@/components/marketing/register-registry-hint';
import { Logo } from '@/components/layout/logo';
import { cn } from '@/lib/utils';
import {
  User,
  Wrench,
  Building2,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';

const trustSignals = [
  { icon: Lock, label: 'Conexión cifrada' },
  { icon: BadgeCheck, label: 'Identidad revisada' },
  { icon: ShieldCheck, label: 'Pagos protegidos' },
];

const strengthLabels = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Fuerte'];
const strengthColors = [
  'bg-destructive',
  'bg-destructive',
  'bg-amber-500',
  'bg-emprenor-accent',
  'bg-emprenor-accent',
];

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const roles = [
  {
    value: 'CLIENTE' as const,
    label: 'Cliente',
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

const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

export default function RegisterPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get('role');
  const { register: registerUser } = useAuth();
  const mounted = useMounted();
  const { data: categories } = useCategories(mounted);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CLIENTE', province: 'Salta' },
  });

  const selectedRole = watch('role');
  const selectedCategoryId = watch('categoryId');
  const isProfessional = selectedRole === 'PROFESIONAL';
  const passwordValue = watch('password') ?? '';
  const strength = passwordStrength(passwordValue);

  const checkCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLock(e.getModifierState?.('CapsLock') ?? false);
  };

  useEffect(() => {
    if (roleParam === 'PROFESIONAL' || roleParam === 'CLIENTE' || roleParam === 'EMPRESA') {
      setValue('role', roleParam);
    }
  }, [roleParam, setValue]);

  const flatCategories =
    categories?.flatMap((c) => [c, ...(c.children ?? [])]) ?? [];

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    if (!accepted) {
      setError('Para continuar, aceptá los Términos y la Política de Privacidad.');
      return;
    }
    try {
      await registerUser(data);
      router.push('/dashboard');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al registrarse';
      setError(
        /timeout|fetch|network|Failed/i.test(message)
          ? 'No pudimos conectar con el servidor. Reintentá en unos segundos.'
          : message,
      );
    }
  };

  return (
    <div className="flex min-h-full flex-1">
      <AuthBrandPanel
        title="Sumate a la red de servicios argentina"
        subtitle="Completá tu perfil una sola vez. Los datos se cargan automáticamente en cada solicitud."
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
                Ingresar
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
                  <Input id="firstName" autoComplete="given-name" autoFocus {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+54 9 ..." {...register('phone')} />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" autoComplete="address-level2" {...register('city')} />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Provincia" />
                        </SelectTrigger>
                        <SelectContent>
                          {ARGENTINA_PROVINCES.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.province && (
                    <p className="text-sm text-destructive">{errors.province.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección (opcional)</Label>
                <Input id="address" autoComplete="street-address" placeholder="Calle, número, barrio" {...register('address')} />
              </div>

              {isProfessional && (
                <>
                  <div className="space-y-2">
                    <Label>Rubro principal</Label>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccioná tu especialidad" />
                          </SelectTrigger>
                          <SelectContent>
                            {flatCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.categoryId && (
                      <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">CUIT o DNI</Label>
                    <Input id="documentNumber" {...register('documentNumber')} />
                    {errors.documentNumber && (
                      <p className="text-sm text-destructive">{errors.documentNumber.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">Matrícula (opcional)</Label>
                    <Input id="licenseNumber" placeholder="Ej. COPIME / Gasnor / CARC" {...register('licenseNumber')} />
                  </div>
                  <RegisterRegistryHint categoryId={selectedCategoryId} />
                  <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                    Tu perfil aparecerá en el mapa de profesionales al registrarte. La
                    administración verificará tu documentación antes de habilitar contacto y
                    presupuestos.
                  </p>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="pr-10"
                    aria-invalid={!!errors.password}
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
                {passwordValue.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1" aria-hidden>
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors',
                            i < strength ? strengthColors[strength] : 'bg-border',
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seguridad: {strengthLabels[strength]}
                    </p>
                  </div>
                )}
                {capsLock && <p className="text-xs text-amber-600">Bloq Mayús está activado.</p>}
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-[hsl(var(--primary))]"
                />
                <span>
                  Acepto los{' '}
                  <Link href="/terminos" target="_blank" className="font-medium text-primary hover:underline">
                    Términos y Condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacidad" target="_blank" className="font-medium text-primary hover:underline">
                    Política de Privacidad
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Button
                type="submit"
                className="w-full shadow-celeste"
                disabled={isSubmitting || !accepted}
              >
                {isSubmitting
                  ? 'Creando cuenta...'
                  : `Crear cuenta como ${roles.find((r) => r.value === selectedRole)?.label}`}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground lg:hidden">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Ingresar
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
