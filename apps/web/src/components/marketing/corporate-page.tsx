import { Card, CardContent } from '@/components/ui/card';
import { MarketingPageHero } from '@/components/marketing/marketing-page-hero';

interface ContentSection {
  title: string;
  content: string | string[];
}

interface CorporatePageProps {
  title: string;
  subtitle?: string;
  sections: ContentSection[];
}

export function CorporatePage({ title, subtitle, sections }: CorporatePageProps) {
  return (
    <div>
      <MarketingPageHero title={title} subtitle={subtitle} narrow />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="space-y-8">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold">{section.title}</h2>
                {Array.isArray(section.content) ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                    {section.content.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 leading-relaxed text-muted-foreground">{section.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
