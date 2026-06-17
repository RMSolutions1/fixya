import { Suspense } from 'react';
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import RegisterPageClient from './register-client';

export const metadata = {
  title: 'Registrarse | FixYa · Grupo Emprenor',
  description: 'Creá tu cuenta en FixYa — unidad digital del Grupo Emprenor.',
};

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <RegisterPageClient />
      </Suspense>
    </AuthPageShell>
  );
}
