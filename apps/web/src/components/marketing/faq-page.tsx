import Link from 'next/link';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { FaqAccordion, type FaqItem } from '@/components/marketing/faq-accordion';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { COMPANY } from '@/lib/company-info';

const faqGroups: { title: string; description: string; items: FaqItem[] }[] = [
  {
    title: 'Clientes',
    description: 'Contratación, búsqueda y garantías',
    items: [
      {
        question: '¿Cómo contrato un profesional?',
        answer:
          'Buscá por categoría en Servicios o por nombre en Profesionales. Elegí el perfil, completá la solicitud y recibí presupuestos comparables. Aceptá el que prefieras y seguí el trabajo en tu expediente digital.',
      },
      {
        question: '¿Los profesionales están verificados?',
        answer:
          'Sí. Verificamos identidad y, cuando el rubro lo exige, matrículas y habilitaciones. El badge "Verificado" indica que completó nuestro proceso de onboarding.',
      },
      {
        question: '¿Qué pasa si hay un problema con el servicio?',
        answer:
          'Podés abrir una disputa desde el expediente digital. Nuestro equipo media entre las partes y aplica la garantía FixYa cuando corresponde, con historial documentado de cada etapa.',
      },
    ],
  },
  {
    title: 'Pagos y facturación',
    description: 'Mercado Pago, retención y comprobantes',
    items: [
      {
        question: '¿Cómo funciona el pago?',
        answer:
          'Los pagos se procesan con Mercado Pago en pesos argentinos. El monto queda retenido hasta que confirmes la conformidad del servicio, protegiendo al cliente y al profesional.',
      },
      {
        question: '¿Emiten factura?',
        answer:
          'Sí. FixYa integra emisión fiscal conforme normativa ARCA, con camino a integración Emitia para comprobantes válidos en cada contratación.',
      },
      {
        question: '¿Hay comisión por usar FixYa?',
        answer:
          'FixYa retiene una comisión sobre transacciones exitosas, informada antes de confirmar cada contratación. El registro de clientes y profesionales no tiene costo.',
      },
    ],
  },
  {
    title: 'Profesionales',
    description: 'Registro, visibilidad y cobros',
    items: [
      {
        question: '¿Cómo me registro como profesional?',
        answer:
          'Entrá a "Ser profesional", completá tu perfil con servicios y zona de cobertura. Tras la verificación, empezás a recibir solicitudes de clientes en tu área.',
      },
      {
        question: '¿Cuándo recibo el pago?',
        answer:
          'Los fondos se liberan cuando el cliente confirma la conformidad del trabajo. Todo el flujo queda registrado en el expediente digital.',
      },
      {
        question: '¿Puedo operar desde cualquier provincia?',
        answer:
          'Sí. FixYa tiene cobertura nacional en las 24 provincias. Nuestro equipo matriz tiene experiencia operativa en el NOA desde 2018 a través de EMPRENOR C&S.',
      },
    ],
  },
  {
    title: 'Empresas y legal',
    description: 'Operación B2B, datos y términos',
    items: [
      {
        question: '¿FixYa sirve para empresas de servicios?',
        answer:
          'Sí. Ofrecemos operación multi-tenant con equipos, wallet contable, CRM y documentación para empresas que gestionan múltiples técnicos u obras.',
      },
      {
        question: '¿Quién opera la plataforma?',
        answer: `${COMPANY.legalName} opera FixYa como unidad de ${COMPANY.groupBrand}. El ecosistema incluye ${COMPANY.emprenorBrand} (obra), ${COMPANY.emitiaBrand} (fiscal), ${COMPANY.gestionBrand}, ${COMPANY.myEmprenorBrand} y ${COMPANY.fixyaBrand}, con sede en ${COMPANY.address.province}.`,
      },
      {
        question: '¿Dónde consulto términos y privacidad?',
        answer:
          'En /terminos y /privacidad encontrás la información legal completa. Para consultas: legal@fixya.com.ar.',
      },
    ],
  },
];

export function FaqPage() {
  return (
    <div>
      <MarketingPageHero
        title={
          <>
            Preguntas <span className="text-sol">frecuentes</span>
          </>
        }
        subtitle="Respuestas claras sobre contratación, pagos, profesionales y operación de la plataforma."
        narrow
      />

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {faqGroups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? 'mt-16' : ''}>
            <SectionHeading title={group.title} description={group.description} />
            <div className="mt-8">
              <FaqAccordion items={group.items} defaultOpen={groupIndex === 0 ? 0 : undefined} />
            </div>
          </div>
        ))}
      </section>

      <section className="border-t bg-secondary/30 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <HelpCircle className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">¿Seguís con dudas?</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            Nuestro equipo responde consultas de lunes a viernes de 8:00 a 20:00.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <a href={`mailto:${COMPANY.emails.general}`}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {COMPANY.emails.general}
              </a>
            </Button>
            <Button variant="outline" className="border-primary/30" asChild>
              <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
            </Button>
            <Button variant="outline" className="border-primary/30" asChild>
              <Link href="/nosotros">Conocer FixYa</Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketingPageCloser />
    </div>
  );
}
