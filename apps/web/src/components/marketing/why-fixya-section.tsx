import {
  Shield,
  CreditCard,
  Users,
  Clock,
  FileCheck,
  MapPin,
} from 'lucide-react';
import { SectionHeading } from '@/components/marketing/section-heading';

const reasons = [
  {
    icon: Shield,
    title: 'Profesionales verificados',
    description:
      'Identidad, matrículas y antecedentes revisados. La confianza celeste y blanca en cada contratación.',
  },
  {
    icon: CreditCard,
    title: 'Pagos con Mercado Pago',
    description:
      'Cobrá y pagá en pesos argentinos con la billetera que ya usás. Fondos retenidos hasta tu conformidad.',
  },
  {
    icon: FileCheck,
    title: 'Factura fiscal ARCA',
    description:
      'Comprobantes legales e integración Emitia. Cumplimiento impositivo para hogares, PyMEs y empresas.',
  },
  {
    icon: Clock,
    title: 'Respuesta ágil',
    description:
      'Presupuestos comparables, expediente digital y seguimiento en tiempo real de cada servicio.',
  },
  {
    icon: Users,
    title: 'Todo el país conectado',
    description:
      'Del NOA al sur, del campo a la capital. Una red nacional de oficios y profesionales independientes.',
  },
  {
    icon: MapPin,
    title: 'Cerca tuyo',
    description:
      'Buscá por zona, categoría y calificación. Encontrá al especialista ideal en tu barrio o ciudad.',
  },
];

export function WhyFixYaSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            eyebrow="Por qué FixYa"
            title={
              <>
                Experiencia, tecnología y{' '}
                <span className="text-gradient-celeste">orgullo argentino</span>
              </>
            }
            description="Inspirados en la excelencia de la construcción y los servicios del NOA — con alcance en todo el país."
            align="center"
          />
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group card-argentina flex gap-4 p-6 hover:shadow-celeste"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
