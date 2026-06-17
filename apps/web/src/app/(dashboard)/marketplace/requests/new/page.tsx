'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceRequestSchema, type ServiceRequestForm } from '@/lib/validators/auth';
import { useCategories, useCreateServiceRequest, usePublishServiceRequest } from '@/hooks/use-marketplace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';

export default function NewServiceRequestPage() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const createRequest = useCreateServiceRequest();
  const publishRequest = usePublishServiceRequest();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestForm>({ resolver: zodResolver(serviceRequestSchema) });

  const onSubmit = async (data: ServiceRequestForm) => {
    const created = await createRequest.mutateAsync(data as unknown as Record<string, unknown>);
    const id = (created as { id: string }).id;
    await publishRequest.mutateAsync(id);
    router.push(`/marketplace/requests/${id}`);
  };

  const flatCategories =
    categories?.flatMap((c) => [c, ...(c.children ?? [])]) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <DashboardPageHeader
        title="Nueva solicitud de servicio"
        description="Describí lo que necesitás y recibí presupuestos de profesionales verificados en tu zona."
      />

      <Card className="card-argentina">
        <CardHeader>
          <CardTitle>Detalle del servicio</CardTitle>
          <CardDescription>Completá la información para publicar tu solicitud</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
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
              <Label htmlFor="title">Título</Label>
              <Input id="title" placeholder="Ej: Reparación pérdida de agua" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Describí el problema con el mayor detalle posible..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Input id="province" {...register('province')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register('address')} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar solicitud'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
