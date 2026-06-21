import { HomePortalShell } from '@/components/home/home-portal-shell';
import { HomePortalHero } from '@/components/home/home-portal-hero';
import { HomeAuthRedirect } from '@/components/home/home-auth-redirect';

export const metadata = {
  title: 'Acceso · FixYa',
  description: 'Ingresá o registrate en FixYa — marketplace de servicios del Grupo Emprenor.',
};

export default function AccesoPage() {
  return (
    <>
      <HomeAuthRedirect />
      <HomePortalShell>
        <HomePortalHero />
      </HomePortalShell>
    </>
  );
}
