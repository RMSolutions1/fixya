import { Suspense } from 'react';
import ServiciosPageClient from './servicios-client';

export const metadata = {
  title: 'Servicios | FixYa',
  description: 'Directorio de categorías de servicios profesionales en las 24 provincias de Argentina.',
};

export default function ServiciosPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Cargando...</div>}>
      <ServiciosPageClient />
    </Suspense>
  );
}
