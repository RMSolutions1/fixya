import { Suspense } from 'react';
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import ResetPasswordClient from './reset-client';

export const metadata = {
  title: 'Restablecer contraseña | FixYa · Grupo Emprenor',
  description: 'Creá una nueva contraseña para tu cuenta FixYa.',
};

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <ResetPasswordClient />
      </Suspense>
    </AuthPageShell>
  );
}
