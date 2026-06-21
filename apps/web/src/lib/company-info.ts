/**
 * Fuente única de verdad corporativa — FixYa como unidad de negocio de Grupo Emprenor.
 * @see https://grupo.emprenor.com
 */

import { SITE_HOST, SITE_URL } from './site-url';

export interface GroupBusinessUnit {
  id: string;
  brand: string;
  tagline: string;
  website: string;
  /** Unidad actual (FixYa) — resaltar en UI */
  isCurrent?: boolean;
}

/** Unidades de negocio del Grupo Emprenor */
export const GROUP_BUSINESS_UNITS: GroupBusinessUnit[] = [
  {
    id: 'grupo',
    brand: 'Grupo Emprenor',
    tagline: 'Holding corporativo',
    website: 'https://grupo.emprenor.com',
  },
  {
    id: 'emprenor',
    brand: 'EMPRENOR C&S',
    tagline: 'Construcciones y servicios · NOA',
    website: 'https://www.emprenor.com',
  },
  {
    id: 'fixya',
    brand: 'FixYa',
    tagline: 'Marketplace de servicios profesionales',
    website: SITE_URL,
    isCurrent: true,
  },
  {
    id: 'emitia',
    brand: 'Emitia',
    tagline: 'Facturación fiscal ARCA',
    website: 'https://www.emitia.com.ar',
  },
  {
    id: 'gestion',
    brand: 'Gestión Emprenor',
    tagline: 'Operaciones y back-office',
    website: 'https://gestion.emprenor.com',
  },
  {
    id: 'myemprenor',
    brand: 'My Emprenor',
    tagline: 'Portal de clientes y equipos',
    website: 'https://myemprenor.online',
  },
];

export const COMPANY = {
  /** Entidad legal operadora de FixYa */
  legalName: 'RM International Group SAS',

  /** Unidad de negocio digital — marketplace de servicios */
  fixyaBrand: 'FixYa',
  fixyaTagline: 'Marketplace de servicios profesionales',
  /** Copy estándar para páginas de servicios y landings */
  marketingPitch:
    'Profesionales con identidad revisada. Pedí presupuesto online y seguí tu solicitud en un solo lugar.',
  /** Campaña beta abierta — copy centralizado para web y redes */
  campaign: {
    phase: 'beta_abierta' as const,
    label: 'Beta abierta',
    tagline: 'Explorá profesionales en todo el país y pedí presupuesto gratis.',
    disclaimer: 'Pagos con Mercado Pago: próximamente en esta beta.',
    ctaClient: 'Pedir presupuesto',
    ctaPro: 'Soy profesional',
  },
  fixyaDomain: SITE_HOST,
  fixyaWebsite: SITE_URL,

  /** Holding / grupo corporativo */
  groupBrand: 'Grupo Emprenor',
  groupWebsite: 'https://grupo.emprenor.com',
  groupTagline: 'Construcción, servicios, fiscal y tecnología en Argentina',

  /** Brazo de obra e instalaciones (NOA) */
  emprenorBrand: 'EMPRENOR C&S',
  emprenorTagline: 'Construcciones y Servicios',
  emprenorWebsite: 'https://www.emprenor.com',
  emprenorFoundedYear: 2018,

  /** Facturación electrónica */
  emitiaBrand: 'Emitia',
  emitiaTagline: 'Facturación fiscal ARCA',
  emitiaWebsite: 'https://www.emitia.com.ar',

  /** Gestión operativa */
  gestionBrand: 'Gestión Emprenor',
  gestionWebsite: 'https://gestion.emprenor.com',

  /** Portal clientes/equipos */
  myEmprenorBrand: 'My Emprenor',
  myEmprenorWebsite: 'https://myemprenor.online',

  rmFoundedYear: 2022,
  /** @deprecated Use emprenorFoundedYear or rmFoundedYear */
  foundedYear: 2018,

  phone: '+54 9 387 352-2920',
  phoneHref: 'tel:+5493873522920',
  emails: {
    general: 'info@fixya.emprenor.com.ar',
    legal: 'info@fixya.emprenor.com.ar',
    press: 'info@fixya.emprenor.com.ar',
  },
  address: {
    street: 'Av. Casiano Casas 3080, Barrio Policial',
    locality: 'Campamento Vespucio, Gral. San Martín',
    province: 'Salta',
    postalCode: '4563',
    country: 'Argentina',
    short: 'Av. Casiano Casas 3080, Salta, Argentina',
    full: 'Av. Casiano Casas 3080, Barrio Policial, Campamento Vespucio, Dpto. Gral. San Martín, CP 4563, Provincia de Salta, Argentina',
  },
  noaProvinces: ['Salta', 'Jujuy', 'Tucumán', 'Formosa'] as const,
  segments: [
    'Obras privadas',
    'Obras comerciales',
    'Obras industriales',
    'Obras corporativas',
    'Obras públicas',
  ] as const,
  specialtiesCount: 12,

  /** @deprecated Use emprenorWebsite */
  website: 'https://www.emprenor.com',
} as const;

/** Unidades del grupo excepto FixYa (para footers y cross-links) */
export function getSiblingBusinessUnits(): GroupBusinessUnit[] {
  return GROUP_BUSINESS_UNITS.filter((u) => !u.isCurrent);
}

/** Línea corporativa estándar para footers y legal */
export function corporateOwnershipLine(): string {
  return `${COMPANY.fixyaBrand} es una unidad de negocio de ${COMPANY.groupBrand}, operada por ${COMPANY.legalName}.`;
}

/** Descripción corta del ecosistema para páginas institucionales */
export function ecosystemSummary(): string {
  return (
    `${COMPANY.groupBrand} integra obra (${COMPANY.emprenorBrand}), servicios digitales (${COMPANY.fixyaBrand}), ` +
    `facturación fiscal (${COMPANY.emitiaBrand}), gestión operativa (${COMPANY.gestionBrand}) y portal ` +
    `${COMPANY.myEmprenorBrand} — un ecosistema completo para construir, operar y facturar en Argentina.`
  );
}

/** Hostname legible para links externos */
export function formatWebsiteHost(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}
