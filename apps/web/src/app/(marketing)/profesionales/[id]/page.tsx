'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ArrowLeft, Star, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfessional } from '@/hooks/use-marketplace';
import { useAuthStore } from '@/stores/auth.store';
import {
  useCreateServiceRequest,
  usePublishServiceRequest,
} from '@/hooks/use-marketplace';
import { formatCurrency } from '@/lib/utils';
import { RegistryVerificationPanel } from '@/components/marketing/registry-verification-panel';
import { RegistryBadge } from '@/components/professionals/registry-badge';
import { RegistrySourceCard } from '@/components/professionals/registry-source-card';
import { PresenceIndicator } from '@/components/professionals/presence-indicator';
import { useMounted } from '@/hooks/use-mounted';

export default function ProfesionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const mounted = useMounted();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const { data: pro, isLoading, isError } = useProfessional(id, mounted);
  const createRequest = useCreateServiceRequest();
  const publishRequest = usePublishServiceRequest();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    date: '',
    time: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      router.push(`/login?redirect=/profesionales/${id}`);
      return;
    }

    if (!pro?.services[0]) return;

    setSubmitting(true);
    try {
      const primaryService = pro.services[0];
      const scheduledNote = form.date
        ? `\n\nFecha preferida: ${form.date}${form.time ? ` ${form.time}` : ''}`
        : '';
      const contactNote = `\nContacto: ${form.name}${form.phone ? ` · ${form.phone}` : ''}${form.address ? `\nDirección: ${form.address}` : ''}`;

      const request = await createRequest.mutateAsync({
        categoryId: primaryService.category.id,
        title: `Solicitud para ${pro.firstName} ${pro.lastName} — ${primaryService.title}`,
        description: `${form.description}${scheduledNote}${contactNote}`,
        address: form.address || undefined,
      });

      const published = await publishRequest.mutateAsync((request as { id: string }).id);
      router.push(`/marketplace/requests/${(published as { id: string }).id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (isError || !pro) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Profesional no encontrado</h1>
        <Button className="mt-6" variant="emprenor" asChild>
          <Link href="/profesionales">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  const primaryService = pro.services[0];
  const fullName = `${pro.firstName} ${pro.lastName}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/profesionales"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Volver
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {pro.firstName[0]}
              {pro.lastName[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{fullName}</h1>
                {pro.registry && <RegistryBadge registry={pro.registry} size="md" showLink />}
                {pro.verified && !pro.registry && (
                  <Badge variant="success">
                    <Shield className="mr-1 h-3 w-3" />
                    Verificado FixYa
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-lg text-muted-foreground">
                {primaryService.category.name}
                {pro.licenseNumber ? ` · Mat. ${pro.licenseNumber}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-sol text-sol" />
                  {Number(pro.ratingAvg).toFixed(1)} ({pro.ratingCount} reseñas)
                </span>
                {pro.presence ? (
                  <PresenceIndicator presence={pro.presence} />
                ) : (
                  pro.available && (
                    <span className="flex items-center gap-1 text-pampa">
                      <CheckCircle2 className="h-4 w-4" />
                      Disponible
                    </span>
                  )
                )}
              </div>
              {pro.minPrice !== null && (
                <p className="mt-4 text-2xl font-bold text-primary">
                  {formatCurrency(pro.minPrice)}
                  <span className="text-sm font-normal text-muted-foreground"> desde / servicio</span>
                </p>
              )}
            </div>
          </div>

          {pro.registry && (
            <div className="mt-6">
              <RegistrySourceCard registry={pro.registry} licenseNumber={pro.licenseNumber} />
            </div>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {pro.experienceYears && (
                <div>
                  <p className="text-sm text-muted-foreground">Experiencia</p>
                  <p className="font-medium">{pro.experienceYears} años</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Estado</p>
                {pro.presence ? (
                  <PresenceIndicator presence={pro.presence} className="mt-0.5" />
                ) : (
                  <p className="font-medium text-emerald-600">Disponible para contratar</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Sobre mí</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{pro.bio}</p>
            </CardContent>
          </Card>

          {pro.services.length > 1 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Servicios ofrecidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pro.services.map((s) => (
                  <div key={s.id} className="flex justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.category.name}</p>
                    </div>
                    {s.basePrice && (
                      <p className="font-semibold text-primary">{formatCurrency(Number(s.basePrice))}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(() => {
            const reviews = pro.services
              .flatMap((s) => s.reviews ?? [])
              .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
            if (reviews.length === 0) return null;
            return (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Reseñas de clientes ({pro.ratingCount})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                              key={n}
                              className={
                                r.rating >= n
                                  ? 'h-4 w-4 fill-sol text-sol'
                                  : 'h-4 w-4 text-muted-foreground/30'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">
                          {r.reviewer
                            ? `${r.reviewer.firstName} ${r.reviewer.lastName[0]}.`
                            : 'Cliente'}
                        </span>
                      </div>
                      {r.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })()}

          {primaryService?.category?.slug && (
            <div className="mt-8">
              <RegistryVerificationPanel
                categorySlug={primaryService.category.slug}
                province={pro.province ?? undefined}
                variant="light"
              />
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Solicitar servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tu nombre</Label>
                  <Input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción del trabajo</Label>
                  <Textarea
                    id="description"
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" variant="emprenor" className="w-full" disabled={submitting}>
                  {submitting ? 'Enviando...' : 'Enviar solicitud'}
                </Button>
                {!isAuthenticated && (
                  <p className="text-center text-xs text-muted-foreground">
                    Necesitás{' '}
                    <Link href={`/login?redirect=/profesionales/${id}`} className="text-primary">
                      ingresar
                    </Link>{' '}
                    para enviar
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
