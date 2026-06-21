/** Catálogo editorial completo por rubro — landings SEO y UX */
export interface CategoryCatalogEntry {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  priceFrom: number;
  priceUnit: string;
  faqs: Array<{ q: string; a: string }>;
  highlights: string[];
  requiresLicense?: boolean;
  urgentAvailable?: boolean;
}

/** FAQs base cuando el rubro no define propias */
export const DEFAULT_CATEGORY_FAQS: Array<{ q: string; a: string }> = [
  {
    q: '¿Puedo pagar con Mercado Pago?',
    a: 'Sí. Los fondos quedan retenidos hasta que confirmes la conformidad del trabajo.',
  },
  {
    q: '¿Cómo comparo presupuestos?',
    a: 'Publicá tu solicitud o contactá profesionales desde el mapa. Recibí presupuestos comparables antes de contratar.',
  },
  {
    q: '¿Dónde verifico la matrícula del profesional?',
    a: 'En la landing del rubro vas a ver los organismos oficiales (COPIME, Gasnor, CARC, etc.). FixYa no reemplaza esas consultas: usá el padrón correspondiente a tu provincia y distribuidora de gas.',
  },
];

export function getCategoryFaqs(entry: CategoryCatalogEntry): Array<{ q: string; a: string }> {
  return entry.faqs.length > 0 ? entry.faqs : DEFAULT_CATEGORY_FAQS;
}

export const CATEGORY_CATALOG: Record<string, CategoryCatalogEntry> = {
  electricidad: {
    slug: 'electricidad',
    name: 'Electricista',
    tagline: 'Instalaciones seguras, matriculados y con respaldo FixYa',
    description: 'Instalaciones, reparaciones y mantenimiento eléctrico',
    longDescription:
      'Contratá electricistas matriculados para tu hogar, comercio u obra. Desde tableros y luminarias hasta urgencias por cortes. Cada profesional pasa revisión de identidad y documentación antes de operar en FixYa.',
    priceFrom: 3500,
    priceUnit: 'visita',
    highlights: ['Matrícula revisada', 'Urgencias disponibles', 'Presupuesto sin compromiso'],
    requiresLicense: true,
    urgentAvailable: true,
    faqs: [
      {
        q: '¿Cómo verifico la matrícula?',
        a: 'FixYa revisa documentación antes de activar al profesional. Podés pedirla en el chat del expediente.',
      },
      {
        q: '¿Puedo pagar con Mercado Pago?',
        a: 'Sí. Los fondos quedan retenidos hasta que confirmes la conformidad del trabajo.',
      },
    ],
  },
  plomeria: {
    slug: 'plomeria',
    name: 'Plomero',
    tagline: 'Cañerías, pérdidas y destapaciones a domicilio',
    description: 'Servicios de plomería y cañerías',
    longDescription:
      'Resolvé pérdidas, destapaciones, instalación de sanitarios y reparaciones de cañerías con plomeros cerca tuyo. Compará presupuestos en minutos y contratá con respaldo FixYa.',
    priceFrom: 4000,
    priceUnit: 'visita',
    highlights: ['Atención urgente', 'Presupuestos comparables', 'Reseñas de clientes'],
    urgentAvailable: true,
    faqs: [
      {
        q: '¿Atienden urgencias?',
        a: 'Muchos profesionales ofrecen servicio urgente. Filtrá por disponibilidad y distancia en el mapa.',
      },
    ],
  },
  gas: {
    slug: 'gas',
    name: 'Gasista',
    tagline: 'Matriculados para instalaciones y certificaciones',
    description: 'Instalaciones y mantenimiento de gas',
    longDescription:
      'Gasistas matriculados para artefactos, cañerías, revisiones periódicas y certificaciones. Trabajos regulados con documentación revisada en las 24 provincias.',
    priceFrom: 4200,
    priceUnit: 'visita',
    highlights: ['Matrícula obligatoria', 'Certificaciones', 'Cobertura nacional'],
    requiresLicense: true,
    faqs: [
      {
        q: '¿Necesito matrícula para contratar?',
        a: 'Sí, en FixYa solo operan gasistas con documentación revisada por nuestro equipo.',
      },
    ],
  },
  'aire-acondicionado': {
    slug: 'aire-acondicionado',
    name: 'Refrigeración',
    tagline: 'Instalación, service y reparación de climatización',
    description: 'Aires acondicionados y sistemas de frío',
    longDescription:
      'Técnicos en refrigeración para split, centrales y cámaras. Instalación, mantenimiento preventivo y reparación con presupuestos comparables.',
    priceFrom: 5000,
    priceUnit: 'service',
    highlights: ['Instalación certificada', 'Mantenimiento anual', 'Todas las marcas'],
    faqs: [],
  },
  seguridad: {
    slug: 'seguridad',
    name: 'Seguridad',
    tagline: 'Alarmas, cámaras y monitoreo para tu propiedad',
    description: 'Sistemas de alarmas y cámaras',
    longDescription:
      'Instaladores de sistemas de seguridad, CCTV, alarmas perimetrales y control de acceso para hogares y comercios.',
    priceFrom: 8000,
    priceUnit: 'instalación',
    highlights: ['Diagnóstico sin cargo', 'Instalación profesional', 'Soporte post-venta'],
    faqs: [],
  },
  cerrajeria: {
    slug: 'cerrajeria',
    name: 'Cerrajero',
    tagline: 'Aperturas, cambio de cerraduras y urgencias 24 hs',
    description: 'Cerraduras, llaves y aperturas',
    longDescription:
      'Cerrajeros para emergencias, duplicado de llaves, cambio de cerraduras y blindeo. Disponibilidad urgente en tu zona.',
    priceFrom: 4500,
    priceUnit: 'visita',
    highlights: ['Urgencias 24 hs', 'Presupuesto previo', 'Llegada rápida'],
    urgentAvailable: true,
    faqs: [],
  },
  mecanica: {
    slug: 'mecanica',
    name: 'Mecánico',
    tagline: 'Mecánica a domicilio y taller móvil',
    description: 'Servicios mecánicos para vehículos',
    longDescription:
      'Mecánicos para service, diagnóstico, frenos, distribución y asistencia en ruta. Ideal para flotas y particulares.',
    priceFrom: 6000,
    priceUnit: 'service',
    highlights: ['Diagnóstico computarizado', 'Repuestos a convenir', 'Garantía según presupuesto'],
    faqs: [],
  },
  pintura: {
    slug: 'pintura',
    name: 'Pintor',
    tagline: 'Interior, exterior y texturas profesionales',
    description: 'Pintura interior y exterior',
    longDescription:
      'Pintores para viviendas, edificios y locales comerciales. Presupuestos detallados por m² con materiales incluidos o mano de obra.',
    priceFrom: 2500,
    priceUnit: 'm²',
    highlights: ['Presupuesto por m²', 'Materiales a convenir', 'Limpieza incluida'],
    faqs: [],
  },
  mudanza: {
    slug: 'mudanza',
    name: 'Mudanza',
    tagline: 'Mudanzas completas con embalaje y transporte',
    description: 'Servicios de mudanza completa',
    longDescription:
      'Empresas y profesionales de mudanzas residenciales y comerciales. Embalaje, desmontaje, transporte y montaje en destino.',
    priceFrom: 15000,
    priceUnit: 'mudanza',
    highlights: ['Seguro a convenir', 'Embalaje profesional', 'Cobertura nacional'],
    faqs: [],
  },
  flete: {
    slug: 'flete',
    name: 'Flete',
    tagline: 'Transporte de mercadería y muebles',
    description: 'Transporte y envío de mercadería',
    longDescription:
      'Fletes urbanos e interurbanos para muebles, electrodomésticos y mercadería. Elegí por capacidad de vehículo y distancia.',
    priceFrom: 8000,
    priceUnit: 'viaje',
    highlights: ['Precio por km', 'Ayudantes disponibles', 'Coordinación del viaje'],
    faqs: [],
  },
  limpieza: {
    slug: 'limpieza',
    name: 'Limpieza',
    tagline: 'Limpieza profunda para hogares y oficinas',
    description: 'Limpieza domiciliaria y comercial',
    longDescription:
      'Servicios de limpieza regular y profunda para departamentos, casas, oficinas y locales. Personal con referencias revisadas.',
    priceFrom: 3000,
    priceUnit: 'visita',
    highlights: ['Productos incluidos', 'Referencias revisadas', 'Horarios flexibles'],
    faqs: [],
  },
  jardineria: {
    slug: 'jardineria',
    name: 'Jardinería',
    tagline: 'Paisajismo, poda y mantenimiento de espacios verdes',
    description: 'Mantenimiento de jardines y espacios verdes',
    longDescription:
      'Jardineros para mantenimiento, poda, riego automático y diseño paisajístico. Del campo a la ciudad.',
    priceFrom: 3500,
    priceUnit: 'visita',
    highlights: ['Mantenimiento mensual', 'Diseño paisajístico', 'Riego automático'],
    faqs: [],
  },
  peluqueria: {
    slug: 'peluqueria',
    name: 'Peluquería',
    tagline: 'Corte, color y tratamientos a domicilio',
    description: 'Servicios de peluquería a domicilio',
    longDescription:
      'Peluqueros profesionales que van a tu casa. Cortes, coloración, brushing y tratamientos capilares.',
    priceFrom: 5000,
    priceUnit: 'servicio',
    highlights: ['A domicilio', 'Productos profesionales', 'Reserva online'],
    faqs: [],
  },
  veterinaria: {
    slug: 'veterinaria',
    name: 'Veterinario',
    tagline: 'Atención veterinaria a domicilio',
    description: 'Atención veterinaria a domicilio',
    longDescription:
      'Veterinarios matriculados para consultas, vacunas y emergencias con mascotas en tu hogar.',
    priceFrom: 6500,
    priceUnit: 'consulta',
    highlights: ['Matrícula revisada', 'Vacunas', 'Emergencias'],
    requiresLicense: true,
    urgentAvailable: true,
    faqs: [],
  },
  ninera: {
    slug: 'ninera',
    name: 'Niñera',
    tagline: 'Cuidado profesional de niños',
    description: 'Cuidado de niños profesional',
    longDescription:
      'Niñeras con referencias revisadas para cuidado ocasional, fines de semana o permanente.',
    priceFrom: 4000,
    priceUnit: 'hora',
    highlights: ['Referencias revisadas', 'Primeros auxilios', 'Flexibilidad horaria'],
    faqs: [],
  },
  'cuidador-adultos': {
    slug: 'cuidador-adultos',
    name: 'Cuidador de Adultos',
    tagline: 'Acompañamiento y cuidado de adultos mayores',
    description: 'Cuidado de adultos mayores',
    longDescription:
      'Cuidadores capacitados para acompañamiento, higiene, medicación y compañía de adultos mayores.',
    priceFrom: 4500,
    priceUnit: 'hora',
    highlights: ['Capacitación revisada', 'Turnos diurnos/nocturnos', 'Referencia médica'],
    faqs: [],
  },
  albanileria: {
    slug: 'albanileria',
    name: 'Albañil',
    tagline: 'Construcción, refacciones y revoques',
    description: 'Construcción y reformas',
    longDescription:
      'Albañiles para ampliaciones, revoques, pisos, mampostería y refacciones integrales.',
    priceFrom: 3000,
    priceUnit: 'jornal',
    highlights: ['Obra llave en mano', 'Presupuesto detallado', 'Materiales a convenir'],
    faqs: [],
  },
  carpinteria: {
    slug: 'carpinteria',
    name: 'Carpintero',
    tagline: 'Muebles a medida y reparaciones en madera',
    description: 'Trabajos en madera y muebles',
    longDescription:
      'Carpinteros para muebles a medida, placares, decks y reparaciones en madera y melamina.',
    priceFrom: 5000,
    priceUnit: 'proyecto',
    highlights: ['Diseño 3D', 'Madera maciza', 'Instalación incluida'],
    faqs: [],
  },
  'tecnico-pc': {
    slug: 'tecnico-pc',
    name: 'Técnico PC',
    tagline: 'Reparación, upgrade y soporte informático',
    description: 'Reparación de computadoras',
    longDescription:
      'Técnicos en PC para formateo, upgrades, redes WiFi, recuperación de datos y soporte remoto o presencial.',
    priceFrom: 4000,
    priceUnit: 'visita',
    highlights: ['Soporte remoto', 'Recuperación de datos', 'Upgrade SSD/RAM'],
    faqs: [],
  },
  'profesor-particular': {
    slug: 'profesor-particular',
    name: 'Profesor Particular',
    tagline: 'Clases personalizadas a domicilio o virtual',
    description: 'Clases particulares a domicilio',
    longDescription:
      'Profesores universitarios y docentes para matemática, física, idiomas y apoyo escolar/universitario.',
    priceFrom: 3000,
    priceUnit: 'hora',
    highlights: ['Título revisado', 'Presencial o virtual', 'Plan de estudio personalizado'],
    faqs: [],
  },
};

export function getCategoryCatalog(slug: string): CategoryCatalogEntry | undefined {
  return CATEGORY_CATALOG[slug];
}

export const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_CATALOG);
