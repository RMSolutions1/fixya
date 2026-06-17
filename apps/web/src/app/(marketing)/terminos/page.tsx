import { LegalDocumentPage } from '@/components/marketing/legal-document-page';
import { COMPANY } from '@/lib/company-info';

export const metadata = {
  title: 'Términos y Condiciones | FixYa',
  description: 'Términos y condiciones de uso de la plataforma FixYa (Argentina).',
};

export default function TerminosPage() {
  return (
    <LegalDocumentPage
      title="Términos y Condiciones"
      subtitle="Condiciones de uso de la plataforma FixYa · República Argentina"
      lastUpdated="Marzo 2026"
      sections={[
        {
          id: 'aceptacion',
          title: '1. Aceptación',
          content: `Al registrarte o usar FixYa aceptás estos términos. FixYa es una unidad de negocio de ${COMPANY.groupBrand}, operada por ${COMPANY.legalName}, con domicilio en ${COMPANY.address.short}.`,
        },
        {
          id: 'servicio',
          title: '2. Naturaleza del servicio',
          content:
            'FixYa es un marketplace que conecta clientes con profesionales independientes de servicios. No somos empleadores de los profesionales ni garantizamos un resultado específico de cada trabajo, pero verificamos identidad, aplicamos políticas de calidad y mediación en disputas.',
        },
        {
          id: 'cuentas',
          title: '3. Cuentas y veracidad',
          content: [
            'Los usuarios deben proporcionar información veraz y mantenerla actualizada.',
            'Los profesionales deben contar con habilitaciones legales vigentes para su rubro.',
            'FixYa puede suspender o cerrar cuentas que incumplan políticas o la ley.',
          ],
        },
        {
          id: 'pagos',
          title: '4. Pagos y comisiones',
          content:
            'Los pagos se procesan vía Mercado Pago. FixYa retiene una comisión sobre transacciones exitosas, informada antes de confirmar cada contratación. Los fondos se liberan al profesional tras la conformidad del cliente, salvo disputa en curso.',
        },
        {
          id: 'garantia',
          title: '5. Garantía y disputas',
          content:
            'El cliente puede abrir una disputa desde el expediente digital. FixYa media entre las partes conforme sus políticas publicadas. La retención de fondos protege a ambas partes hasta resolución.',
        },
        {
          id: 'propiedad',
          title: '6. Propiedad intelectual',
          content:
            'FixYa, su marca, software y contenidos son propiedad de RM International Group SAS o sus licenciantes. Queda prohibida la reproducción no autorizada del servicio o de materiales de la plataforma.',
        },
        {
          id: 'ley',
          title: '7. Ley aplicable y jurisdicción',
          content:
            'Estos términos se rigen por las leyes de la República Argentina. Para controversias, las partes se someten a los Tribunales Ordinarios de la Ciudad Autónoma de Buenos Aires, salvo norma imperativa en contrario.',
        },
        {
          id: 'contacto',
          title: '8. Contacto',
          content: `Consultas legales: ${COMPANY.emails.legal} · ${COMPANY.phone} · ${COMPANY.address.short}`,
        },
      ]}
    />
  );
}
