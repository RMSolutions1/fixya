import { Suspense } from 'react';
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import ForgotPasswordClient from './forgot-client';

export const metadata = {
  title: 'Recuperar contraseña | FixYa · Grupo Emprenor',
  description: 'Restablecé tu contraseña de FixYa.',
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <ForgotPasswordClient />
      </Suspense>
    </AuthPageShell>
  );
}
