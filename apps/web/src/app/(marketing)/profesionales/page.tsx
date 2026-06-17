import { Suspense } from 'react';
import ProfesionalesPageClient from './profesionales-client';

export const metadata = {
  title: 'Profesionales | FixYa',
  description: 'Directorio de profesionales verificados con reseñas, precios en pesos y cobertura nacional.',
};

export default function ProfesionalesPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center">Cargando...</div>}>
      <ProfesionalesPageClient />
    </Suspense>
  );
}
