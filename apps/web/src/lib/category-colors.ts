import { FALLBACK_CATEGORIES } from '@/lib/fallback-categories';

/** Colores de marcador en mapa por rubro (identificación visual rápida). */
export const CATEGORY_MARKER_COLORS: Record<string, string> = {
  electricidad: '#F59E0B',
  plomeria: '#2563EB',
  gas: '#DC2626',
  'aire-acondicionado': '#06B6D4',
  seguridad: '#6366F1',
  cerrajeria: '#78716C',
  mecanica: '#475569',
  pintura: '#EC4899',
  mudanza: '#8B5CF6',
  flete: '#0D9488',
  limpieza: '#14B8A6',
  jardineria: '#22C55E',
  peluqueria: '#D946EF',
  veterinaria: '#84CC16',
  ninera: '#F472B6',
  'cuidador-adultos': '#FB7185',
  albanileria: '#EA580C',
  carpinteria: '#A16207',
  'tecnico-pc': '#0284C7',
  'profesor-particular': '#7C3AED',
};

const DEFAULT_MARKER_COLOR = '#2E2A6E';

const SPECIALTY_TO_SLUG = Object.fromEntries(
  FALLBACK_CATEGORIES.flatMap((c) => [
    [c.name.toLowerCase(), c.slug],
    [c.slug, c.slug],
  ]),
);

/** Nombre corto del organismo para la línea «Datos verificados (…)». */
const REGISTRY_VERIFICATION_LABELS: Record<string, string> = {
  'aguas-del-norte': 'Aguas del Norte',
  gasnor: 'Gasnor',
  metrogas: 'Metrogas',
  'naturgy-ban': 'Naturgy BAN',
  camuzzi: 'Camuzzi',
  ecogas: 'Ecogas',
  edesa: 'Edesa',
};

export function resolveCategorySlug(specialty?: string | null, categorySlug?: string | null): string {
  if (categorySlug) return categorySlug;
  if (!specialty) return 'default';
  const key = specialty.trim().toLowerCase();
  return SPECIALTY_TO_SLUG[key] ?? 'default';
}

export function getCategoryMarkerColor(categorySlug?: string | null, specialty?: string | null): string {
  const slug = resolveCategorySlug(specialty, categorySlug);
  return CATEGORY_MARKER_COLORS[slug] ?? DEFAULT_MARKER_COLOR;
}

export function getRegistryVerificationLabel(acronym: string, registryId?: string): string {
  const source =
    (registryId && REGISTRY_VERIFICATION_LABELS[registryId]) || acronym;
  return `Datos verificados (${source})`;
}
