import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Source_Sans_3 } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { PwaRegister } from '@/components/providers/pwa-register';
import { SITE_URL } from '@/lib/site-url';
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FixYa — El marketplace de servicios de Argentina',
    template: '%s | FixYa',
  },
  description:
    'Beta abierta: encontrá profesionales en las 24 provincias y pedí presupuesto gratis. Marketplace digital del Grupo Emprenor.',
  applicationName: 'FixYa',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FixYa',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'FixYa · Grupo Emprenor',
    title: 'FixYa — Beta abierta · Marketplace de servicios',
    description:
      'Beta abierta en Argentina. Profesionales en el mapa, presupuestos comparables y solicitudes online. Grupo Emprenor.',
  },
  keywords: [
    'FixYa',
    'Grupo Emprenor',
    'marketplace servicios',
    'profesionales Argentina',
    'Mercado Pago',
    'plomero',
    'electricista',
    'gasista',
    'Argentina',
  ],
};

export const viewport = {
  themeColor: '#2E2A6E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        <QueryProvider>
          <PwaRegister />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
