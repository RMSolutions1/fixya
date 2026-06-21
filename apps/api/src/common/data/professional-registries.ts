/**
 * Catálogo de organismos habilitantes y consultas públicas — Argentina.
 * Fuente editorial FixYa; verificar URLs en portales oficiales antes de producción.
 * No existen APIs abiertas nacionales unificadas: cada rubro usa colegios, distribuidoras o cámaras.
 */

export type RegistryScope = 'nacional' | 'provincial' | 'regional' | 'distribuidora' | 'camara';

export interface ProfessionalRegistry {
  id: string;
  name: string;
  acronym: string;
  scope: RegistryScope;
  /** Rubros FixYa (category-catalog slug) */
  categorySlugs: string[];
  provinces?: string[];
  regulates: string;
  verificationUrl: string;
  directoryUrl?: string;
  phone?: string;
  email?: string;
  notes: string;
  /** Si FixYa puede verificar automáticamente hoy */
  automatedLookup: boolean;
  /** Color institucional para badge / logo */
  brandColor?: string;
  /** Ruta pública del logo (SVG en /public) */
  logoPath?: string;
  /** Texto corto de confianza en UI */
  shortTagline?: string;
}

/** Colores institucionales aproximados para badges */
const REGISTRY_BRAND_COLORS: Record<string, string> = {
  copime: '#003366',
  copaipa: '#0054A6',
  enargas: '#00843D',
  gasnor: '#E87722',
  metrogas: '#00A651',
  'naturgy-ban': '#E87722',
  camuzzi: '#0066CC',
  ecogas: '#FF6600',
  edesa: '#0066B3',
  'aguas-del-norte': '#0099CC',
  aafrio: '#006699',
  carc: '#004B87',
  carhaa: '#1A5276',
  'ca-frigoristas': '#2874A6',
  'senasa-vet': '#2E7D32',
  cmv: '#1565C0',
  cacaaav: '#0277BD',
  'afip-habilitacion': '#003DA5',
  'municipal-habilitacion': '#546E7A',
};

function withRegistryDefaults(r: ProfessionalRegistry): ProfessionalRegistry {
  return {
    ...r,
    brandColor: r.brandColor ?? REGISTRY_BRAND_COLORS[r.id] ?? '#1e3a5f',
    logoPath: r.logoPath ?? `/images/registries/${r.id}.svg`,
    shortTagline:
      r.shortTagline ??
      `Matrícula habilitante verificada contra fuente oficial ${r.acronym}.`,
  };
}

export const PROFESSIONAL_REGISTRIES: ProfessionalRegistry[] = [
  {
    id: 'copime',
    name: 'Consejo Profesional de Ingeniería Mecánica y Electricista',
    acronym: 'COPIME',
    scope: 'nacional',
    categorySlugs: ['electricidad', 'mecanica', 'aire-acondicionado'],
    regulates: 'Ingenieros, licenciados y técnicos matriculados en electromecánica (CABA y ámbito COPIME).',
    verificationUrl: 'https://www.copime.org.ar/verificacion',
    directoryUrl: 'https://www.copime.org.ar/searches',
    phone: '+54 11 4372-2445',
    email: 'copime@copime.org.ar',
    notes:
      'Verificación por DNI + código de credencial digital o QR. No hay API pública de padrón completo.',
    automatedLookup: false,
  },
  {
    id: 'copaipa',
    name: 'Consejo Profesional de Agrimensores, Ingenieros y Profesiones Afines',
    acronym: 'COPAIPA',
    scope: 'provincial',
    categorySlugs: ['electricidad', 'albanileria', 'carpinteria'],
    provinces: ['Salta'],
    regulates: 'Ingeniería, agrimensura y profesiones afines — control de normas eléctricas y estructurales en Salta.',
    verificationUrl: 'https://copaipa.org.ar/profesiones-matriculadas/',
    directoryUrl: 'https://padrones.copaipa.org.ar/profesionesmatriculadas',
    email: 'info@copaipa.org.ar',
    notes:
      'Padrón público en padrones.copaipa.org.ar (~3.900 matriculados). FixYa sincroniza con npm run scrape:copaipa && npm run db:import:copaipa:directory.',
    automatedLookup: true,
    shortTagline: 'Profesional matriculado en el padrón oficial COPAIPA (Salta).',
  },
  {
    id: 'enargas',
    name: 'Ente Nacional Regulador del Gas',
    acronym: 'ENARGAS',
    scope: 'nacional',
    categorySlugs: ['gas'],
    regulates: 'Marco regulatorio NAG; denuncias y orientación al usuario.',
    verificationUrl: 'https://www.enargas.gob.ar/',
    phone: '0800-333-4444',
    notes:
      'No opera padrón único de gasistas (Res. 219/2022 derogada). La matrícula se consulta en cada distribuidora.',
    automatedLookup: false,
  },
  {
    id: 'gasnor',
    name: 'Gasnor (Naturgy NOA)',
    acronym: 'GASNOR',
    scope: 'distribuidora',
    categorySlugs: ['gas'],
    provinces: ['Salta', 'Jujuy', 'Tucumán', 'Santiago del Estero', 'Catamarca'],
    regulates: 'Instaladores matriculados 1ra, 2da y 3ra categoría en el NOA.',
    verificationUrl: 'https://gasnor.idearit.com.ar/instaladores',
    directoryUrl: 'https://gasnor.idearit.com.ar/instaladores',
    notes:
      'Padrón público NOA (Jujuy, Salta, Santiago del Estero, Tucumán). FixYa sincroniza con npm run scrape:gasnor && npm run db:import:gasnor:directory.',
    automatedLookup: true,
    shortTagline: 'Instalador de gas matriculado en el padrón oficial Gasnor / Naturgy NOA.',
  },
  {
    id: 'edesa',
    name: 'EDESA — Empresa Distribuidora de Electricidad de Salta',
    acronym: 'EDESA',
    scope: 'distribuidora',
    categorySlugs: ['electricidad'],
    provinces: ['Salta'],
    regulates: 'Electricistas habilitados para trabajos en la red de EDESA.',
    verificationUrl: 'https://www.edesa.com.ar/',
    directoryUrl: 'https://www.edesa.com.ar/',
    notes: 'Consulta de habilitados en portal EDESA. Importación de padrón en roadmap FixYa.',
    automatedLookup: false,
    shortTagline: 'Electricista habilitado ante la distribuidora EDESA (Salta).',
  },
  {
    id: 'aguas-del-norte',
    name: 'Aguas del Norte S.A.',
    acronym: 'ADN',
    scope: 'distribuidora',
    categorySlugs: ['plomeria'],
    provinces: ['Salta', 'Jujuy', 'Catamarca', 'Santiago del Estero', 'Tucumán'],
    regulates: 'Plomeros y sanitaristas habilitados en la red de agua potable del NOA.',
    verificationUrl: 'https://www.aguasdelnortesalta.com.ar/consulta_matriculados.php',
    directoryUrl: 'https://www.aguasdelnortesalta.com.ar/consulta_matriculados.php',
    notes:
      'Padrón público vía API /api/v1/web/matriculados. FixYa sincroniza con npm run sync:adn.',
    automatedLookup: true,
    shortTagline: 'Plomero habilitado ante Aguas del Norte (NOA).',
  },
  {
    id: 'metrogas',
    name: 'MetroGAS',
    acronym: 'METROGAS',
    scope: 'distribuidora',
    categorySlugs: ['gas'],
    provinces: ['Ciudad Autónoma de Buenos Aires', 'Buenos Aires'],
    regulates: 'Gasistas matriculados CABA y sur del GBA.',
    verificationUrl: 'https://www.metrogas.com.ar/colaboradores/listado-de-gasistas-matriculados/',
    directoryUrl: 'https://www.metrogas.com.ar/colaboradores/listado-de-gasistas-matriculados/',
    notes: 'Padrón por distribuidora; un gasista solo puede estar matriculado en una a la vez.',
    automatedLookup: false,
  },
  {
    id: 'naturgy-ban',
    name: 'Naturgy BAN',
    acronym: 'NATURGY BAN',
    scope: 'distribuidora',
    categorySlugs: ['gas'],
    provinces: ['Buenos Aires'],
    regulates: 'Instaladores matriculados norte y oeste del GBA e interior bonaerense.',
    verificationUrl: 'https://www.naturgyban.com.ar/',
    notes: 'Consulta de matriculados en portal de la distribuidora.',
    automatedLookup: false,
  },
  {
    id: 'camuzzi',
    name: 'Camuzzi Gas Pampeana / del Sur',
    acronym: 'CAMUZZI',
    scope: 'distribuidora',
    categorySlugs: ['gas'],
    provinces: ['Buenos Aires', 'La Pampa', 'Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego'],
    regulates: 'Instaladores en Pampeana y Patagonia.',
    verificationUrl: 'https://www.camuzzigas.com/',
    notes: 'Padrón regional Camuzzi.',
    automatedLookup: false,
  },
  {
    id: 'ecogas',
    name: 'Ecogas (Centro / Cuyana)',
    acronym: 'ECOGAS',
    scope: 'distribuidora',
    categorySlugs: ['gas'],
    provinces: ['Córdoba', 'La Rioja', 'Catamarca', 'Mendoza', 'San Juan', 'San Luis'],
    regulates: 'Listado de gasistas matriculados Centro y Cuyo.',
    verificationUrl: 'https://ecogas.com.ar/hogares-comercios/tramites-y-servicios/listado-de-gasistas-matriculados',
    directoryUrl: 'https://ecogas.com.ar/hogares-comercios/tramites-y-servicios/listado-de-gasistas-matriculados',
    notes: 'Filtro por provincia, localidad y categoría.',
    automatedLookup: false,
  },
  {
    id: 'aafrio',
    name: 'Asociación Argentina del Frío',
    acronym: 'AAF',
    scope: 'camara',
    categorySlugs: ['aire-acondicionado'],
    regulates: 'Certificación de instaladores en equipos de frío y aire acondicionado.',
    verificationUrl: 'https://aafrio.org.ar/listado-de-tecnicos-certificados/',
    directoryUrl: 'https://aafrio.org.ar/listado-de-tecnicos-certificados/',
    email: 'aafrio@aafrio.org.ar',
    notes: 'Listado descargable de técnicos certificados. No es matrícula estatal única.',
    automatedLookup: false,
  },
  {
    id: 'carc',
    name: 'Cámara Argentina de Refrigeración y Climatización',
    acronym: 'CARC',
    scope: 'camara',
    categorySlugs: ['aire-acondicionado'],
    regulates: 'Matrícula y verificación de técnicos en refrigeración y climatización.',
    verificationUrl: 'https://www.carctec.ar/',
    directoryUrl: 'https://www.carctec.ar/',
    notes: 'Verificación de técnico por DNI en portal CARC.',
    automatedLookup: false,
  },
  {
    id: 'carhaa',
    name: 'Cámara Argentina de Refrigeración de Heladeras y Aire Acondicionado',
    acronym: 'CARHAA',
    scope: 'camara',
    categorySlugs: ['aire-acondicionado'],
    regulates: 'Matrícula digital de técnicos en refrigeración doméstica y comercial.',
    verificationUrl: 'https://carhaa.com.ar/',
    directoryUrl: 'https://carhaa.com.ar/',
    notes: 'Publica últimos matriculados en sitio web.',
    automatedLookup: false,
  },
  {
    id: 'ca-frigoristas',
    name: 'Cámara Argentina de Frigoristas',
    acronym: 'CAF',
    scope: 'camara',
    categorySlugs: ['aire-acondicionado', 'electricidad'],
    regulates: 'Matrícula de técnicos en refrigeración y electricidad.',
    verificationUrl: 'https://camaraargentinadefrigoristas.com.ar/',
    notes: 'Matrícula por niveles según carga horaria del curso.',
    automatedLookup: false,
  },
  {
    id: 'senasa-vet',
    name: 'SENASA — Registro veterinario',
    acronym: 'SENASA',
    scope: 'nacional',
    categorySlugs: ['veterinaria'],
    regulates: 'Marco sanitario veterinario nacional.',
    verificationUrl: 'https://www.argentina.gob.ar/senasa',
    notes: 'Matrícula profesional provincial (MN) complementaria al registro sanitario.',
    automatedLookup: false,
  },
  {
    id: 'cmv',
    name: 'Consejo de Médicos Veterinarios (provincial)',
    acronym: 'CMV',
    scope: 'provincial',
    categorySlugs: ['veterinaria'],
    regulates: 'Matrícula nacional/provincial de médicos veterinarios.',
    verificationUrl: 'https://www.argentina.gob.ar/justicia/rebusque',
    notes: 'Cada provincia tiene su consejo o registro profesional veterinario.',
    automatedLookup: false,
  },
  {
    id: 'cacaaav',
    name: 'Cámara Argentina de Calefacción, Aire Acondicionado y Ventilación',
    acronym: 'CACAAV',
    scope: 'camara',
    categorySlugs: ['aire-acondicionado'],
    regulates: 'Instaladores de climatización y ventilación.',
    verificationUrl: 'https://www.cacaav.org.ar/',
    notes: 'Entidad gremial con programas de certificación.',
    automatedLookup: false,
  },
  {
    id: 'afip-habilitacion',
    name: 'AFIP — Monotributo / responsable inscripto',
    acronym: 'AFIP',
    scope: 'nacional',
    categorySlugs: [
      'plomeria',
      'electricidad',
      'gas',
      'limpieza',
      'pintura',
      'jardineria',
      'flete',
      'mudanza',
      'peluqueria',
      'tecnico-pc',
    ],
    regulates: 'Constancia de inscripción fiscal del prestador independiente.',
    verificationUrl: 'https://www.afip.gob.ar/',
    notes: 'Complementa identidad; no acredita oficio ni matrícula habilitante.',
    automatedLookup: false,
  },
  {
    id: 'municipal-habilitacion',
    name: 'Habilitación municipal / comercial',
    acronym: 'MUNICIPAL',
    scope: 'regional',
    categorySlugs: ['plomeria', 'cerrajeria', 'limpieza', 'peluqueria', 'albanileria'],
    regulates: 'Habilitación de oficios en muchas jurisdicciones locales.',
    verificationUrl: 'https://www.argentina.gob.ar/interior/organismos-municipios',
    notes: 'Requisitos variables por municipio. FixYa solicita documentación en onboarding.',
    automatedLookup: false,
  },
];

/** Rubro → organismos recomendados para verificación */
export const CATEGORY_REGISTRY_MAP: Record<string, string[]> = {
  electricidad: ['copime', 'copaipa', 'edesa', 'afip-habilitacion'],
  plomeria: ['aguas-del-norte', 'municipal-habilitacion', 'afip-habilitacion'],
  gas: ['enargas', 'gasnor', 'metrogas', 'naturgy-ban', 'camuzzi', 'ecogas'],
  'aire-acondicionado': ['carc', 'aafrio', 'carhaa', 'ca-frigoristas', 'cacaaav', 'copime'],
  seguridad: ['afip-habilitacion', 'municipal-habilitacion'],
  cerrajeria: ['municipal-habilitacion', 'afip-habilitacion'],
  mecanica: ['copime', 'afip-habilitacion'],
  pintura: ['afip-habilitacion', 'municipal-habilitacion'],
  mudanza: ['afip-habilitacion'],
  flete: ['afip-habilitacion'],
  limpieza: ['afip-habilitacion', 'municipal-habilitacion'],
  jardineria: ['afip-habilitacion'],
  peluqueria: ['municipal-habilitacion', 'afip-habilitacion'],
  veterinaria: ['senasa-vet', 'cmv'],
  ninera: ['afip-habilitacion'],
  'cuidador-adultos': ['afip-habilitacion'],
  albanileria: ['copaipa', 'municipal-habilitacion', 'afip-habilitacion'],
  carpinteria: ['copaipa', 'afip-habilitacion'],
  'tecnico-pc': ['afip-habilitacion'],
  'profesor-particular': ['afip-habilitacion'],
};

export function getRegistryById(id: string): ProfessionalRegistry | undefined {
  const found = PROFESSIONAL_REGISTRIES.find((r) => r.id === id);
  return found ? withRegistryDefaults(found) : undefined;
}

export function getAllRegistries(): ProfessionalRegistry[] {
  return PROFESSIONAL_REGISTRIES.map(withRegistryDefaults);
}

export function getRegistriesForCategory(categorySlug?: string): ProfessionalRegistry[] {
  if (!categorySlug) return getAllRegistries();
  const ids = CATEGORY_REGISTRY_MAP[categorySlug] ?? [];
  return ids.map((id) => getRegistryById(id)).filter(Boolean) as ProfessionalRegistry[];
}

export function getRegistriesForProvince(
  categorySlug: string,
  province?: string,
): ProfessionalRegistry[] {
  const all = getRegistriesForCategory(categorySlug);
  if (!province) return all;
  const normalized = province.toLowerCase();
  return all.filter(
    (r) =>
      !r.provinces ||
      r.provinces.some((p) => p.toLowerCase() === normalized || normalized.includes(p.toLowerCase())),
  );
}
