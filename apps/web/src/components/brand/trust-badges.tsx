import { Shield, CreditCard, FileCheck, MapPin } from 'lucide-react';

const badges = [
  {
    icon: CreditCard,
    title: 'Mercado Pago',
    description: 'Pagos en pesos argentinos, seguros y familiares',
  },
  {
    icon: FileCheck,
    title: 'Factura fiscal',
    description: 'Cumplimiento ARCA e integración Emitia',
  },
  {
    icon: Shield,
    title: 'Profesionales verificados',
    description: 'Matrículas, identidad y reputación real',
  },
  {
    icon: MapPin,
    title: 'Cobertura nacional',
    description: 'De Ushuaia a La Quiaca, tu zona incluida',
  },
];

export function TrustBadges() {
  return (
    <section className="border-y bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
