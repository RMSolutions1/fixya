import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Source_Sans_3 } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FixYa — Servicios profesionales en Argentina | Grupo Emprenor',
  description:
    'FixYa es la plataforma digital de servicios verificados del Grupo Emprenor. Mercado Pago, factura fiscal ARCA y expediente digital en las 24 provincias.',
  keywords: [
    'FixYa',
    'Grupo Emprenor',
    'EMPRENOR',
    'servicios Argentina',
    'profesionales verificados',
    'Mercado Pago',
    'plomero',
    'electricista',
    'gasista',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
