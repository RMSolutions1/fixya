import { LegalDocumentPage } from '@/components/marketing/legal-document-page';
import { COMPANY } from '@/lib/company-info';

export const metadata = {
  title: 'Política de Privacidad | FixYa',
  description: 'Política de privacidad de FixYa conforme Ley 25.326 (Argentina).',
};

export default function PrivacidadPage() {
  return (
    <LegalDocumentPage
      title="Política de Privacidad"
      subtitle="Cumplimos con la Ley 25.326 de Protección de Datos Personales (Argentina)"
      lastUpdated="Marzo 2026"
      sections={[
        {
          id: 'responsable',
          title: 'Responsable del tratamiento',
          content: `${COMPANY.legalName} (${COMPANY.fixyaBrand}), con domicilio en ${COMPANY.address.full}, es responsable del tratamiento de los datos personales recopilados a través de la plataforma FixYa y sitios asociados.`,
        },
        {
          id: 'datos',
          title: 'Datos que recopilamos',
          content: [
            'Datos de registro: nombre, apellido, email, teléfono, documento de identidad.',
            'Datos de ubicación: coordenadas y zona declarada para matching geográfico de servicios.',
            'Datos operativos: historial de solicitudes, presupuestos, contrataciones y reseñas.',
            'Datos de pago: procesados por Mercado Pago; no almacenamos números completos de tarjeta.',
            'Datos técnicos: logs de acceso, dispositivo, IP y uso de la plataforma para seguridad.',
          ],
        },
        {
          id: 'uso',
          title: 'Uso de los datos',
          content:
            'Utilizamos tus datos para conectar clientes con profesionales, procesar pagos, emitir comprobantes fiscales, mejorar el servicio, prevenir fraude y cumplir obligaciones legales. No vendemos datos personales a terceros con fines comerciales.',
        },
        {
          id: 'comparticion',
          title: 'Compartición con terceros',
          content: [
            'Profesionales o clientes involucrados en una contratación específica.',
            'Mercado Pago como procesador de pagos.',
            'Servicios fiscales y ARCA vía integraciones autorizadas (Emitia).',
            'Autoridades competentes cuando la ley lo exija.',
          ],
        },
        {
          id: 'derechos',
          title: 'Tus derechos',
          content: `Podés acceder, rectificar, actualizar o suprimir tus datos escribiendo a ${COMPANY.emails.legal}. Tenés derecho a presentar un reclamo ante la Agencia de Acceso a la Información Pública (AAIP).`,
        },
        {
          id: 'seguridad',
          title: 'Seguridad',
          content:
            'Implementamos cifrado TLS en tránsito, hash de contraseñas, autenticación JWT, controles de acceso en base de datos y auditoría de operaciones sensibles.',
        },
        {
          id: 'contacto',
          title: 'Contacto',
          content: `Consultas sobre privacidad: ${COMPANY.emails.legal} · Tel: ${COMPANY.phone}`,
        },
      ]}
      footerNote={
        <>
          Para más información sobre el ecosistema corporativo, visitá{' '}
          <a
            href={COMPANY.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            emprenor.com
          </a>
          .
        </>
      }
    />
  );
}
