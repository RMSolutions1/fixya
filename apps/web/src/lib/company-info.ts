/**
 * Fuente única de verdad corporativa — FixYa como unidad de negocio de Grupo Emprenor.
 * @see https://grupo.emprenor.com
 */
export const COMPANY = {
  /** Entidad legal operadora de FixYa */
  legalName: 'RM International Group SAS',

  /** Unidad de negocio digital — marketplace de servicios */
  fixyaBrand: 'FixYa',
  fixyaTagline: 'Servicios profesionales verificados',
  fixyaDomain: 'fixya.com.ar',

  /** Holding / grupo corporativo */
  groupBrand: 'Grupo Emprenor',
  groupWebsite: 'https://grupo.emprenor.com',
  groupTagline: 'Construcción, servicios y tecnología en Argentina',

  /** Brazo de obra e instalaciones (NOA) */
  emprenorBrand: 'EMPRENOR C&S',
  emprenorTagline: 'Construcciones y Servicios',
  emprenorWebsite: 'https://www.emprenor.com',
  emprenorFoundedYear: 2018,

  rmFoundedYear: 2022,
  /** @deprecated Use emprenorFoundedYear or rmFoundedYear */
  foundedYear: 2018,

  phone: '+54 9 387 352-2920',
  phoneHref: 'tel:+5493873522920',
  emails: {
    general: 'hola@fixya.com.ar',
    legal: 'legal@fixya.com.ar',
    press: 'prensa@fixya.com.ar',
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

/** Línea corporativa estándar para footers y legal */
export function corporateOwnershipLine(): string {
  return `${COMPANY.fixyaBrand} es una unidad de negocio de ${COMPANY.groupBrand}, operada por ${COMPANY.legalName}.`;
}

/** Descripción corta del ecosistema para páginas institucionales */
export function ecosystemSummary(): string {
  return `${COMPANY.groupBrand} integra ${COMPANY.emprenorBrand} (obra e instalaciones en el NOA desde ${COMPANY.emprenorFoundedYear}) y ${COMPANY.fixyaBrand} (plataforma digital de servicios en todo el país).`;
}
