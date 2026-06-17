import { Wheat, Factory, Building2, GraduationCap } from 'lucide-react';

const pillars = [
  {
    icon: Wheat,
    title: 'Campo & Pampa',
    description:
      'Veterinarios, jardineros, fletes y servicios rurales. Del agro a tu quinta, profesionales que conocen el interior.',
    accent: 'pampa',
  },
  {
    icon: Factory,
    title: 'Industria & Oficios',
    description:
      'Gasistas matriculados, electricistas, mecánicos y técnicos. Mano de obra calificada para fábricas, talleres y obras.',
    accent: 'celeste',
  },
  {
    icon: Building2,
    title: 'Ciudad & Hogar',
    description:
      'Plomeros, cerrajeros, limpieza y mudanzas en CABA, GBA y capitales provinciales. Soluciones para tu casa o edificio.',
    accent: 'celeste',
  },
  {
    icon: GraduationCap,
    title: 'Talento & Conocimiento',
    description:
      'Profesores, técnicos en PC, cuidadores. La fuerza del trabajo argentino al servicio de tu familia y tu negocio.',
    accent: 'sol',
  },
];

export function ArgentinaPillars() {
  return (
    <section className="relative overflow-hidden bg-secondary/50 py-20 pattern-grid-subtle">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Argentina en cada rubro
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Del campo a la industria,{' '}
            <span className="text-gradient-celeste">toda la Argentina trabaja acá</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            FixYa nace en Argentina, para argentinos. Conectamos el talento de las 24 provincias con
            quienes necesitan resolver — con la confianza de lo nuestro.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, description, accent }) => (
            <div
              key={title}
              className="card-argentina group relative overflow-hidden p-6"
            >
              <div
                className={
                  accent === 'pampa'
                    ? 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pampa/10 text-pampa'
                    : accent === 'sol'
                      ? 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sol/15 text-[hsl(var(--sol))]'
                      : 'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'
                }
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold group-hover:text-primary">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
