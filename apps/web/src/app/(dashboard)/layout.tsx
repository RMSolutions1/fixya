import { DashboardShell } from '@/components/layout/app-sidebar';
import { AuthGuard } from '@/components/auth/auth-guard';

export const metadata = {
  title: 'Panel | FixYa · Grupo Emprenor',
  description: 'Panel de control FixYa — plataforma digital del Grupo Emprenor.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
