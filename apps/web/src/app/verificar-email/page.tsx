import { Suspense } from 'react';
import { AuthPageShell } from '@/components/layout/auth-page-shell';
import VerifyEmailClient from './verify-client';

export const metadata = {
  title: 'Verificar email | FixYa · Grupo Emprenor',
  description: 'Confirmá tu dirección de email para activar tu cuenta FixYa.',
};

export default function VerifyEmailPage() {
  return (
    <AuthPageShell>
      <Suspense>
        <VerifyEmailClient />
      </Suspense>
    </AuthPageShell>
  );
}
