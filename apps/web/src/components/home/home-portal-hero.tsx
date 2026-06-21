import type { ReactNode } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';

const PORTAL = {
  title: '¡Bienvenido a FixYa!',
  subtitle:
    'Accedé para publicar solicitudes, contratar profesionales, gestionar tu expediente y mucho más.',
  registerLabel: 'Registrarse',
  loginLabel: 'Ingresar',
  notices: [
    {
      text: 'Conocé cómo registrarte como cliente o profesional haciendo clic',
      linkLabel: 'AQUÍ',
      href: '/para-quienes',
    },
    {
      text: 'Verificá matrículas COPAIPA, Gasnor y otros organismos haciendo clic',
      linkLabel: 'AQUÍ',
      href: '/servicios/gas',
    },
  ],
} as const;

function PortalButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block w-full max-w-[220px] rounded-[7px] px-6 py-[15px] text-center text-lg font-bold text-white transition-colors duration-200 bg-[#00ABE1] hover:bg-[#0055a4]"
    >
      {children}
    </Link>
  );
}

function NoticeBox({
  text,
  linkLabel,
  href,
}: {
  text: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <div className="flex gap-2.5 rounded-[10px] border border-[#8ed9f6] bg-[#e3f7fc] px-3 py-2.5 text-[11px] leading-snug text-[#555] sm:text-xs">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0056a4]" aria-hidden="true" />
      <p>
        {text}{' '}
        <Link href={href} className="font-semibold text-[#0056a4] underline-offset-2 hover:underline">
          {linkLabel}
        </Link>
        .
      </p>
    </div>
  );
}

/** Tarjeta central estilo Oficina Virtual (MetroGAS). */
export function HomePortalHero() {
  return (
    <div
      className="w-full max-w-[400px] rounded-[7px] border border-[#808080] bg-white/95 px-8 py-10 shadow-[7px_7px_30px_rgba(0,0,0,0.45)] sm:px-10"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
    >
      <h1
        className="text-[26px] font-normal leading-tight tracking-[-0.02em] text-[#0056a4] sm:text-[30px]"
        style={{ letterSpacing: '-1px' }}
      >
        {PORTAL.title}
      </h1>

      <h2
        className="mt-2.5 text-base font-normal leading-snug text-[#0056a4] sm:text-lg"
        style={{ letterSpacing: '-0.5px' }}
      >
        {PORTAL.subtitle}
      </h2>

      <div className="mt-8 flex flex-col items-center gap-4">
        <PortalButton href="/register">{PORTAL.registerLabel}</PortalButton>
        <PortalButton href="/login">{PORTAL.loginLabel}</PortalButton>
      </div>

      <div className="mt-6 space-y-4">
        {PORTAL.notices.map((notice) => (
          <NoticeBox key={notice.href} {...notice} />
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-[#666]">
        <Link href="/profesionales" className="text-[#0056a4] underline-offset-2 hover:underline">
          Explorar profesionales
        </Link>
        {' · '}
        <Link href="/servicios" className="text-[#0056a4] underline-offset-2 hover:underline">
          Ver rubros
        </Link>
      </p>
    </div>
  );
}
