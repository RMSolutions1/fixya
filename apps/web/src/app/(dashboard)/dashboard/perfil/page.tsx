'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { useApiAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/api';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SecuritySection } from './security-section';

const profileSchema = z.object({
  phone: z.string().min(8, 'Teléfono requerido'),
  city: z.string().min(2, 'Ciudad requerida'),
  province: z.string().min(2, 'Provincia requerida'),
  address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function PerfilPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { token } = useApiAuth();
  const mustComplete = searchParams.get('complete') === '1';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (user) {
      reset({
        phone: user.phone ?? '',
        city: user.city ?? '',
        province: user.province ?? '',
        address: user.address ?? '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    const updated = await apiRequest<typeof user>('/auth/me', {
      method: 'PATCH',
      token,
      body: data,
    });
    if (updated) setUser({ ...user!, ...updated });
    router.push(mustComplete ? '/marketplace/requests/new' : '/dashboard');
  };

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <DashboardPageHeader
        title="Mi perfil"
        description={
          mustComplete
            ? 'Completá tus datos para poder publicar solicitudes de servicio.'
            : 'Actualizá tu información de contacto y ubicación.'
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input id="province" {...register('province')} />
              {errors.province && (
                <p className="text-sm text-destructive">{errors.province.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register('address')} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar perfil'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <SecuritySection />
    </div>
  );
}
