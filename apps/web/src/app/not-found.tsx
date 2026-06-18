import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';

export const metadata = {
  title: 'Página no encontrada | FixYa',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <Logo showTagline />

      <div className="space-y-2">
        <p className="text-7xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-bold text-foreground">Página no encontrada</h1>
        <p className="max-w-sm text-muted-foreground">
          Esta dirección no existe o fue movida. Podés volver al inicio o buscar un profesional
          directamente.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="emprenor">
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/profesionales">Buscar profesionales</Link>
        </Button>
      </div>
    </div>
  );
}
