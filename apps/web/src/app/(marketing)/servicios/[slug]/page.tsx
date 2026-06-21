import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALL_CATEGORY_SLUGS, getCategoryCatalog } from '@/lib/category-catalog';
import CategoryLandingClient from './category-landing-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = getCategoryCatalog(slug);
  if (!catalog) return { title: 'Servicio no encontrado' };
  return {
    title: `${catalog.name} cerca tuyo — FixYa Argentina`,
    description: `${catalog.longDescription.slice(0, 155)}…`,
    openGraph: {
      title: `${catalog.name} en Argentina | FixYa`,
      description: catalog.tagline,
    },
  };
}

export default async function CategoryLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const catalog = getCategoryCatalog(slug);
  if (!catalog) notFound();
  return <CategoryLandingClient catalog={catalog} />;
}
