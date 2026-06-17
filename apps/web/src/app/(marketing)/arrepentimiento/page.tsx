import Link from 'next/link';
import { LegalDocumentPage } from '@/components/marketing/legal-document-page';
import { COMPANY } from '@/lib/company-info';

export const metadata = {
  title: 'Botón de Arrepentimiento | FixYa',
  description:
    'Ejercé tu derecho de revocación dentro de los 10 días, conforme el artículo 34 de la Ley 24.240 y la Resolución SCI 424/2020.',
};

export default function ArrepentimientoPage() {
  const asunto = encodeURIComponent('Botón de Arrepentimiento — Revocación de contratación');
  const cuerpo = encodeURIComponent(
    'Solicito la revocación de la siguiente contratación realizada en FixYa:\n\n' +
      '- Nombre y apellido:\n' +
      '- Correo registrado:\n' +
      '- N.º o identificación de la contratación:\n' +
      '- Fecha de la contratación:\n\n' +
      'Manifiesto mi voluntad de revocar la aceptación dentro del plazo legal de 10 días corridos.',
  );

  return (
    <LegalDocumentPage
      title="Botón de Arrepentimiento"
      subtitle="Derecho de revocación · Art. 34 Ley 24.240 y Resolución SCI 424/2020"
      lastUpdated="Junio 2026"
      sections={[
        {
          id: 'que-es',
          title: '1. Qué es el derecho de arrepentimiento',
          content:
            'Si contrataste un servicio a distancia a través de FixYa y sos consumidor, tenés derecho a revocar tu aceptación dentro de los DIEZ (10) días corridos, sin necesidad de justificar el motivo y sin penalidad alguna. Este derecho es irrenunciable (artículo 34 de la Ley 24.240 y Resolución SCI 424/2020).',
        },
        {
          id: 'plazo',
          title: '2. Desde cuándo se cuenta el plazo',
          content:
            'El plazo de 10 días corridos se cuenta a partir de la celebración del contrato. Si el plazo vence un día inhábil, se extiende al primer día hábil siguiente.',
        },
        {
          id: 'como',
          title: '3. Cómo ejercerlo',
          content: [
            'Enviá tu solicitud al correo legal indicando tus datos y la contratación a revocar.',
            'También podés iniciar el pedido desde el expediente digital de la contratación, dentro de tu cuenta.',
            'Una vez recibida la solicitud dentro del plazo, gestionamos la cancelación y la devolución de los fondos retenidos sin costo para vos.',
          ],
        },
        {
          id: 'excepciones',
          title: '4. Excepciones',
          content:
            'El derecho de revocación no procede cuando el servicio ya hubiera sido íntegramente prestado con tu conformidad previa, conforme las excepciones legalmente admitidas.',
        },
        {
          id: 'contacto',
          title: '5. Canal de contacto',
          content: `Correo de revocaciones: ${COMPANY.emails.legal} · Tel.: ${COMPANY.phone} · ${COMPANY.address.short}.`,
        },
      ]}
      footerNote={
        <div className="flex flex-col gap-3">
          <p>
            Ejercé tu derecho ahora mismo enviando tu solicitud por correo. Prepararemos el mensaje
            por vos:
          </p>
          <a
            href={`mailto:${COMPANY.emails.legal}?subject=${asunto}&body=${cuerpo}`}
            className="inline-flex w-fit items-center justify-center rounded-md bg-[hsl(var(--emprenor-accent))] px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-[hsl(var(--emprenor-accent-hover))]"
          >
            Iniciar revocación por correo
          </a>
          <p className="text-xs">
            Más información en los{' '}
            <Link href="/terminos" className="font-medium text-primary hover:underline">
              Términos y Condiciones
            </Link>
            .
          </p>
        </div>
      }
    />
  );
}
