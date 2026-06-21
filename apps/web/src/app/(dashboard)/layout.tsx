import { DashboardShell } from '@/components/layout/app-sidebar';
import { AuthGuard } from '@/components/auth/auth-guard';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { PresenceProvider } from '@/components/providers/presence-provider';

export const metadata = {
  title: 'Panel | FixYa · Grupo Emprenor',
  description: 'Panel de control FixYa — plataforma digital del Grupo Emprenor.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PresenceProvider>
        <DashboardShell>{children}</DashboardShell>
      </PresenceProvider>
      <InstallPrompt />
    </AuthGuard>
  );
}
