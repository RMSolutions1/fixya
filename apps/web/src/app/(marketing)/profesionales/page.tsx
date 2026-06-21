import { Suspense } from 'react';
import ProfesionalesPageClient from './profesionales-client';

export const metadata = {
  title: 'Profesionales',
  description: 'Directorio de profesionales con reseñas, precios en pesos y cobertura en las 24 provincias.',
};

export default function ProfesionalesPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Cargando...</div>}>
      <ProfesionalesPageClient />
    </Suspense>
  );
}
