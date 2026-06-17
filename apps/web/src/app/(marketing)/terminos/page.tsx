import Link from 'next/link';
import { LegalDocumentPage } from '@/components/marketing/legal-document-page';
import { COMPANY } from '@/lib/company-info';

export const metadata = {
  title: 'Términos y Condiciones | FixYa',
  description:
    'Términos y condiciones de uso de la plataforma FixYa, marketplace de servicios profesionales en la República Argentina.',
};

export default function TerminosPage() {
  return (
    <LegalDocumentPage
      title="Términos y Condiciones"
      subtitle="Condiciones de uso de la plataforma FixYa · República Argentina"
      lastUpdated="Junio 2026"
      sections={[
        {
          id: 'definiciones',
          title: '1. Definiciones',
          content: [
            '«Plataforma» o «FixYa»: el sitio web y la aplicación operados como unidad de negocio digital del Grupo Emprenor.',
            '«Operador»: ' +
              `${COMPANY.legalName}, con domicilio en ${COMPANY.address.full}, titular y responsable de la Plataforma.`,
            '«Cliente»: persona humana o jurídica que busca, solicita o contrata un servicio a través de la Plataforma.',
            '«Profesional»: persona humana o jurídica independiente que ofrece y presta servicios a través de la Plataforma.',
            '«Usuario»: todo Cliente o Profesional registrado.',
            '«Contratación»: el acuerdo de prestación de servicio celebrado entre un Cliente y un Profesional.',
          ],
        },
        {
          id: 'aceptacion',
          title: '2. Aceptación y capacidad legal',
          content:
            'El registro o uso de la Plataforma implica la aceptación plena y sin reservas de estos Términos. Para registrarte debés ser mayor de 18 años y tener capacidad legal para contratar conforme el Código Civil y Comercial de la Nación. Si actuás en representación de una persona jurídica, declarás contar con facultades suficientes para obligarla.',
        },
        {
          id: 'servicio',
          title: '3. Naturaleza del servicio',
          content:
            'FixYa es una plataforma de intermediación que conecta Clientes con Profesionales independientes. FixYa no es empleadora de los Profesionales, no presta por sí los servicios ofrecidos, no es parte del contrato de prestación celebrado entre Cliente y Profesional y no garantiza un resultado específico de cada trabajo. FixYa sí verifica identidad y documentación de los Profesionales, aplica políticas de calidad, retiene fondos en garantía y media en disputas según las políticas publicadas.',
        },
        {
          id: 'cuentas',
          title: '4. Registro, cuentas y veracidad',
          content: [
            'Los Usuarios deben proporcionar información veraz, exacta y actualizada, y mantener la confidencialidad de sus credenciales.',
            'El Usuario es responsable de toda actividad realizada desde su cuenta.',
            'FixYa puede suspender, limitar o cerrar cuentas que incumplan estos Términos, las políticas de la Plataforma o la legislación vigente.',
          ],
        },
        {
          id: 'profesionales',
          title: '5. Obligaciones del Profesional',
          content: [
            'Contar con las habilitaciones, matrículas y seguros legalmente exigibles para su rubro y mantenerlos vigentes.',
            'Cumplir con sus obligaciones fiscales y previsionales conforme su condición ante ARCA (ex AFIP).',
            'Prestar los servicios con la diligencia, calidad e idoneidad ofrecidas, y respetar los presupuestos aceptados.',
            'Emitir, cuando corresponda, el comprobante fiscal de la operación según su categoría tributaria.',
          ],
        },
        {
          id: 'clientes',
          title: '6. Obligaciones del Cliente',
          content: [
            'Describir con precisión el servicio requerido, su zona y condiciones.',
            'Abonar el precio acordado a través de los medios habilitados en la Plataforma.',
            'Brindar acceso y condiciones razonables para la prestación del servicio.',
            'Confirmar la conformidad del trabajo o, en su defecto, abrir una disputa en tiempo oportuno.',
          ],
        },
        {
          id: 'pagos',
          title: '7. Pagos, comisiones y retención de fondos',
          content:
            'Los pagos se procesan a través de Mercado Pago, en pesos argentinos. FixYa percibe una comisión sobre las transacciones exitosas, informada de manera clara antes de confirmar cada Contratación (artículo 4, Ley 24.240). Los fondos quedan retenidos en garantía y se liberan al Profesional una vez que el Cliente presta conformidad, o conforme la resolución de una disputa.',
        },
        {
          id: 'facturacion',
          title: '8. Facturación fiscal',
          content:
            'Cada operación genera un comprobante dentro del expediente digital. La emisión de factura fiscal conforme normativa ARCA, mediante la integración con Emitia (unidad de facturación del Grupo Emprenor), se encuentra en desarrollo. Hasta su disponibilidad, la emisión del comprobante fiscal es responsabilidad del Profesional según su condición tributaria.',
        },
        {
          id: 'consumidor',
          title: '9. Relación de consumo',
          content:
            'Cuando el Cliente reviste la calidad de consumidor o usuario final, la relación se rige por la Ley 24.240 de Defensa del Consumidor, sus modificatorias y normas complementarias, así como por el Código Civil y Comercial de la Nación. Ninguna cláusula de estos Términos limita los derechos irrenunciables que dichas normas reconocen al consumidor.',
        },
        {
          id: 'arrepentimiento',
          title: '10. Derecho de revocación (Botón de Arrepentimiento)',
          content:
            'El consumidor que contrate servicios a distancia tiene derecho a revocar la aceptación dentro de los DIEZ (10) días corridos contados desde la celebración del contrato, sin expresión de causa y sin costo, conforme el artículo 34 de la Ley 24.240 y la Resolución SCI 424/2020. Para ejercerlo podés usar el Botón de Arrepentimiento o escribir a ' +
            `${COMPANY.emails.legal}. La revocación no procede cuando el servicio ya hubiera sido prestado con tu conformidad previa.`,
        },
        {
          id: 'garantia',
          title: '11. Garantía FixYa y disputas',
          content:
            'El Cliente puede abrir una disputa desde el expediente digital. FixYa media entre las partes conforme sus políticas publicadas, con historial documentado de cada etapa. La retención de fondos protege a ambas partes hasta la resolución del conflicto.',
        },
        {
          id: 'prohibidas',
          title: '12. Conductas prohibidas',
          content: [
            'Publicar información falsa, engañosa o que infrinja derechos de terceros.',
            'Operar por fuera de la Plataforma para evadir comisiones, verificaciones o garantías.',
            'Utilizar la Plataforma para fines ilícitos, fraudulentos o discriminatorios.',
            'Vulnerar la seguridad, integridad o disponibilidad de los sistemas de FixYa.',
          ],
        },
        {
          id: 'propiedad',
          title: '13. Propiedad intelectual',
          content: `FixYa, su marca, software, diseño y contenidos son propiedad de ${COMPANY.legalName} o de sus licenciantes. Queda prohibida la reproducción, distribución o uso no autorizado del servicio o de los materiales de la Plataforma.`,
        },
        {
          id: 'responsabilidad',
          title: '14. Limitación de responsabilidad',
          content:
            'FixYa responde por el correcto funcionamiento de la Plataforma de intermediación y por las obligaciones que asume expresamente. No responde por la calidad, idoneidad u oportunidad de los servicios prestados por los Profesionales, sin perjuicio de las responsabilidades que la Ley 24.240 atribuya a la cadena de comercialización. Nada en esta cláusula excluye o limita la responsabilidad que no pueda excluirse o limitarse por ley.',
        },
        {
          id: 'modificaciones',
          title: '15. Modificaciones',
          content:
            'FixYa puede modificar estos Términos para adecuarlos a cambios legales, técnicos o de servicio. Las modificaciones se publican en esta página con su fecha de vigencia y, cuando sean sustanciales, se notifican por medios electrónicos. El uso posterior de la Plataforma implica la aceptación de la versión vigente.',
        },
        {
          id: 'notificaciones',
          title: '16. Notificaciones',
          content:
            'Las comunicaciones entre FixYa y el Usuario se cursan válidamente por medios electrónicos (correo registrado y notificaciones dentro de la Plataforma). Es responsabilidad del Usuario mantener actualizados sus datos de contacto.',
        },
        {
          id: 'datos',
          title: '17. Protección de datos personales',
          content:
            'El tratamiento de datos personales se rige por la Política de Privacidad, que forma parte integrante de estos Términos y se ajusta a la Ley 25.326 de Protección de los Datos Personales.',
        },
        {
          id: 'ley',
          title: '18. Ley aplicable y jurisdicción',
          content:
            'Estos Términos se rigen por las leyes de la República Argentina. En las relaciones de consumo, será competente el tribunal del domicilio del consumidor, conforme el artículo 36 de la Ley 24.240 (norma de orden público). Para los restantes casos, las partes se someten a los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires.',
        },
        {
          id: 'contacto',
          title: '19. Contacto y autoridad de aplicación',
          content:
            `Consultas legales: ${COMPANY.emails.legal} · ${COMPANY.phone} · ${COMPANY.address.short}. ` +
            'Ante un conflicto de consumo, podés acudir a la autoridad de aplicación o iniciar un reclamo en la Ventanilla Única Federal de Defensa del Consumidor.',
        },
      ]}
      footerNote={
        <>
          ¿Necesitás cancelar una contratación reciente? Ejercé tu derecho desde el{' '}
          <Link href="/arrepentimiento" className="font-medium text-primary hover:underline">
            Botón de Arrepentimiento
          </Link>
          . Consultá también nuestra{' '}
          <Link href="/privacidad" className="font-medium text-primary hover:underline">
            Política de Privacidad
          </Link>{' '}
          y la{' '}
          <Link href="/cookies" className="font-medium text-primary hover:underline">
            Política de Cookies
          </Link>
          .
        </>
      }
    />
  );
}
