import { Suspense } from 'react';
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import LoginPageClient from './login-client';

export const metadata = {
  title: 'Ingresar | FixYa · Grupo Emprenor',
  description: 'Accedé a tu panel FixYa — plataforma digital del Grupo Emprenor.',
};

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <LoginPageClient />
      </Suspense>
    </AuthPageShell>
  );
}
