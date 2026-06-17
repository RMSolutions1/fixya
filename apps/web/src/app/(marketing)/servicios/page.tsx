import { Suspense } from 'react';
import ServiciosPageClient from './servicios-client';

export const metadata = {
  title: 'Servicios | FixYa',
  description: 'Directorio de categorías de servicios profesionales verificados en Argentina.',
};

export default function ServiciosPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Cargando...</div>}>
      <ServiciosPageClient />
    </Suspense>
  );
}
