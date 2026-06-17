import Link from 'next/link';
import { LegalDocumentPage } from '@/components/marketing/legal-document-page';
import { COMPANY } from '@/lib/company-info';

export const metadata = {
  title: 'Política de Privacidad | FixYa',
  description:
    'Política de privacidad de FixYa conforme a la Ley 25.326 de Protección de los Datos Personales (Argentina).',
};

export default function PrivacidadPage() {
  return (
    <LegalDocumentPage
      title="Política de Privacidad"
      subtitle="Tratamiento de datos personales conforme a la Ley 25.326 (Argentina)"
      lastUpdated="Junio 2026"
      sections={[
        {
          id: 'responsable',
          title: '1. Responsable del tratamiento',
          content: `${COMPANY.legalName}, operadora de la plataforma ${COMPANY.fixyaBrand}, con domicilio en ${COMPANY.address.full}, es responsable del tratamiento de los datos personales recopilados a través de la Plataforma. Consultas: ${COMPANY.emails.legal}.`,
        },
        {
          id: 'datos',
          title: '2. Datos que recopilamos',
          content: [
            'Datos de registro: nombre, apellido, correo electrónico, teléfono y documento de identidad.',
            'Datos de ubicación: zona declarada y coordenadas para el matching geográfico de servicios.',
            'Datos operativos: historial de solicitudes, presupuestos, contrataciones, mensajes y reseñas.',
            'Datos de pago: procesados por Mercado Pago; no almacenamos números completos de tarjeta.',
            'Datos de los Profesionales: matrículas, habilitaciones y documentación de verificación.',
            'Datos técnicos: registros de acceso, dispositivo, dirección IP y uso, con fines de seguridad.',
          ],
        },
        {
          id: 'finalidad',
          title: '3. Finalidad y base legal',
          content:
            'Tratamos tus datos para conectar Clientes con Profesionales, procesar pagos, verificar identidad, prevenir fraude, brindar soporte, mejorar el servicio y cumplir obligaciones legales. La base legal es tu consentimiento libre, expreso e informado prestado al registrarte (artículos 5 y 6 de la Ley 25.326) y, cuando corresponde, la ejecución del contrato y el cumplimiento de obligaciones legales. No vendemos datos personales a terceros con fines comerciales.',
        },
        {
          id: 'comparticion',
          title: '4. Cesiones y transferencias',
          content: [
            'Profesionales o Clientes involucrados en una contratación específica, en la medida necesaria para prestarla.',
            'Mercado Pago, como procesador de pagos.',
            'Emitia y servicios fiscales ARCA, para la emisión de comprobantes (integración en desarrollo).',
            'Proveedores tecnológicos que actúan como encargados de tratamiento bajo acuerdos de confidencialidad.',
            'Autoridades administrativas o judiciales competentes cuando la ley lo exija.',
          ],
        },
        {
          id: 'conservacion',
          title: '5. Plazo de conservación',
          content:
            'Conservamos los datos mientras la cuenta permanezca activa y, luego de su baja, durante los plazos exigidos por la legislación fiscal, comercial y de defensa del consumidor (en general hasta 10 años para registros contables y de operaciones), tras lo cual se eliminan o anonimizan de forma segura.',
        },
        {
          id: 'derechos',
          title: '6. Derechos del titular de los datos',
          content:
            `Podés ejercer en cualquier momento los derechos de acceso, rectificación, actualización y supresión de tus datos escribiendo a ${COMPANY.emails.legal}. Daremos respuesta en los plazos legales (10 días corridos para el acceso). El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14, inciso 3 de la Ley 25.326.`,
        },
        {
          id: 'aaip',
          title: '7. Autoridad de control',
          content:
            'La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA (AAIP), órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.',
        },
        {
          id: 'cookies',
          title: '8. Cookies',
          content:
            'Utilizamos cookies y tecnologías similares para el funcionamiento, la seguridad y la analítica de la Plataforma. Podés gestionarlas desde tu navegador. El detalle se encuentra en nuestra Política de Cookies.',
        },
        {
          id: 'seguridad',
          title: '9. Seguridad de la información',
          content:
            'Implementamos cifrado TLS en tránsito, almacenamiento de contraseñas con hash, autenticación basada en tokens, controles de acceso en base de datos y auditoría de operaciones sensibles, conforme las medidas técnicas y organizativas exigidas por la normativa vigente.',
        },
        {
          id: 'contacto',
          title: '10. Contacto',
          content: `Consultas sobre privacidad y protección de datos: ${COMPANY.emails.legal} · Tel.: ${COMPANY.phone} · ${COMPANY.address.short}.`,
        },
      ]}
      footerNote={
        <>
          Revisá también nuestra{' '}
          <Link href="/cookies" className="font-medium text-primary hover:underline">
            Política de Cookies
          </Link>{' '}
          y los{' '}
          <Link href="/terminos" className="font-medium text-primary hover:underline">
            Términos y Condiciones
          </Link>
          . Para conocer el ecosistema corporativo visitá{' '}
          <a
            href={COMPANY.groupWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            grupo.emprenor.com
          </a>
          .
        </>
      }
    />
  );
}
