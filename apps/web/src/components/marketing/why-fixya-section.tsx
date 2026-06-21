import { SectionHeading } from '@/components/marketing/section-heading';
import { ValueProps } from '@/components/marketing/value-props';

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

        <div className="mt-14">
          <ValueProps variant="grid" />
        </div>
      </div>
    </section>
  );
}
