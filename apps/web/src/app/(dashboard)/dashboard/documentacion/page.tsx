'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, ShieldCheck } from 'lucide-react';
import { useApiAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { apiRequest } from '@/lib/api';
import { DashboardPageHeader } from '@/components/layout/dashboard-page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function DocumentacionPage() {
  const router = useRouter();
  const { token } = useApiAuth();
  const user = useAuthStore((s) => s.user);
  const [file, setFile] = useState<File | null>(null);
  const [license, setLicense] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Seleccioná un archivo (PDF o imagen)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo no puede superar 2 MB');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await apiRequest('/auth/me/compliance', {
        method: 'POST',
        token,
        body: {
          docType: 'CUIT_CONSTANCIA',
          fileUrl: dataUrl,
          documentNumber: license || undefined,
        },
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir documentación');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <DashboardPageHeader
        title="Documentación"
        description="Subí tu CUIT/DNI y matrícula para que un administrador verifique tu perfil."
      />

      {user?.status === 'PENDING_VERIFICATION' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            Tu perfil ya aparece en el mapa. Completá la documentación para habilitar presupuestos y
            operaciones.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Constancia CUIT / DNI</CardTitle>
          <CardDescription>PDF, JPG o PNG — máximo 2 MB</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc">Archivo</Label>
              <Input
                id="doc"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Matrícula (opcional)</Label>
              <Input
                id="license"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="Nº de matrícula habilitante"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && (
              <p className="text-sm text-pampa">Documentación enviada. Te avisaremos al aprobar.</p>
            )}
            <Button type="submit" disabled={uploading} className="w-full">
              <FileUp className="mr-2 h-4 w-4" />
              {uploading ? 'Subiendo...' : 'Enviar documentación'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
