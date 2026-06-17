import Link from 'next/link';
import { LegalDocumentPage } from '@/components/marketing/legal-document-page';
import { COMPANY } from '@/lib/company-info';

export const metadata = {
  title: 'Política de Cookies | FixYa',
  description: 'Cómo utiliza FixYa las cookies y tecnologías similares, y cómo podés gestionarlas.',
};

export default function CookiesPage() {
  return (
    <LegalDocumentPage
      title="Política de Cookies"
      subtitle="Uso de cookies y tecnologías similares en la plataforma FixYa"
      lastUpdated="Junio 2026"
      sections={[
        {
          id: 'que-son',
          title: '1. Qué son las cookies',
          content:
            'Las cookies son pequeños archivos que un sitio web almacena en tu dispositivo para recordar información sobre tu visita. Utilizamos cookies propias y de terceros para que la Plataforma funcione correctamente, sea segura y podamos mejorarla.',
        },
        {
          id: 'tipos',
          title: '2. Tipos de cookies que utilizamos',
          content: [
            'Necesarias: imprescindibles para iniciar sesión, mantener la sesión y operar de forma segura. No se pueden desactivar.',
            'De preferencias: recuerdan tus elecciones (por ejemplo, zona o configuración de interfaz).',
            'Analíticas: nos ayudan a entender el uso de la Plataforma de forma agregada para mejorarla.',
          ],
        },
        {
          id: 'terceros',
          title: '3. Cookies de terceros',
          content:
            'Algunos servicios integrados —como Mercado Pago para pagos— pueden establecer sus propias cookies, regidas por las políticas de privacidad de cada proveedor.',
        },
        {
          id: 'gestion',
          title: '4. Cómo gestionarlas',
          content:
            'Podés configurar o eliminar las cookies desde los ajustes de tu navegador. Tené en cuenta que deshabilitar las cookies necesarias puede impedir el funcionamiento de funciones esenciales, como el inicio de sesión.',
        },
        {
          id: 'cambios',
          title: '5. Cambios en esta política',
          content:
            'Podemos actualizar esta Política de Cookies para reflejar cambios técnicos o legales. Publicaremos la versión vigente en esta página con su fecha de actualización.',
        },
        {
          id: 'contacto',
          title: '6. Contacto',
          content: `Consultas sobre cookies y privacidad: ${COMPANY.emails.legal}.`,
        },
      ]}
      footerNote={
        <>
          Más información en nuestra{' '}
          <Link href="/privacidad" className="font-medium text-primary hover:underline">
            Política de Privacidad
          </Link>
          .
        </>
      }
    />
  );
}
