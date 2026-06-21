import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import { COMPANY } from '@/lib/company-info';

interface HomePortalShellProps {
  children: ReactNode;
}

/** Layout minimalista estilo portal (referencia: MetroGAS Oficina Virtual). */
export function HomePortalShell({ children }: HomePortalShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#b0b0b2]">
      {/* Capas de sombra decorativas */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="absolute h-[min(520px,72vh)] w-[min(440px,88vw)] translate-x-[-10px] translate-y-3 rounded-md bg-[#949496] opacity-70 shadow-[8px_8px_24px_rgba(0,0,0,0.25)]" />
        <div className="absolute h-[min(520px,72vh)] w-[min(440px,88vw)] translate-x-[6px] translate-y-1 rounded-md bg-[#a3a3a5] opacity-55 shadow-[6px_6px_18px_rgba(0,0,0,0.18)]" />
      </div>

      <header className="relative z-10 flex justify-end px-[4.5%] pt-6 sm:pt-7">
        <Logo showTagline variant="dark" />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-4 sm:px-6">
        {children}
      </main>

      <footer className="relative z-10 pb-6 text-center text-[11px] text-[#555]">
        <p>
          © {year} {COMPANY.fixyaBrand} ·{' '}
          <Link href="/terminos" className="underline-offset-2 hover:underline">
            Términos
          </Link>
          {' · '}
          <Link href="/privacidad" className="underline-offset-2 hover:underline">
            Privacidad
          </Link>
        </p>
      </footer>
    </div>
  );
}
