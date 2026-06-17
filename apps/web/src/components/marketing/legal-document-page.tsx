import type { ReactNode } from 'react';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';
import { SectionHeading } from '@/components/marketing/section-heading';
import { MarketingPageCloser } from '@/components/marketing/marketing-page-closer';
import { COMPANY } from '@/lib/company-info';

export interface LegalSection {
  id: string;
  title: string;
  content: string | string[];
}

interface LegalDocumentPageProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalSection[];
  footerNote?: ReactNode;
}

export function LegalDocumentPage({
  title,
  subtitle,
  lastUpdated,
  sections,
  footerNote,
}: LegalDocumentPageProps) {
  return (
    <div>
      <MarketingPageHero title={title} subtitle={subtitle} narrow />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Índice
            </p>
            <nav className="mt-4 space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="mt-8 rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Operador</p>
              <p className="mt-1">{COMPANY.legalName}</p>
              <p className="mt-3 font-semibold text-foreground">Actualización</p>
              <p className="mt-1">{lastUpdated}</p>
            </div>
          </aside>

          <article className="min-w-0">
            <p className="mb-10 text-sm text-muted-foreground lg:hidden">
              Última actualización: {lastUpdated}
            </p>
            <div className="space-y-12">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <SectionHeading title={section.title} />
                  {Array.isArray(section.content) ? (
                    <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
                      {section.content.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 leading-relaxed text-muted-foreground">{section.content}</p>
                  )}
                </section>
              ))}
            </div>
            {footerNote && (
              <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-sm text-muted-foreground">
                {footerNote}
              </div>
            )}
          </article>
        </div>
      </div>

      <MarketingPageCloser />
    </div>
  );
}
