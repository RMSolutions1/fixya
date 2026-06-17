import {
  PrismaClient,
  MemberRole,
  TenantType,
  TenantStatus,
  ServiceStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categories = [
  { slug: 'electricidad', name: 'Electricista', description: 'Instalaciones, reparaciones y mantenimiento eléctrico' },
  { slug: 'plomeria', name: 'Plomero', description: 'Servicios de plomería y cañerías' },
  { slug: 'gas', name: 'Gasista', description: 'Instalaciones y mantenimiento de gas' },
  { slug: 'aire-acondicionado', name: 'Refrigeración', description: 'Aires acondicionados y sistemas de frío' },
  { slug: 'seguridad', name: 'Seguridad', description: 'Sistemas de alarmas y cámaras' },
  { slug: 'cerrajeria', name: 'Cerrajero', description: 'Cerraduras, llaves y aperturas' },
  { slug: 'mecanica', name: 'Mecánico', description: 'Servicios mecánicos para vehículos' },
  { slug: 'pintura', name: 'Pintor', description: 'Pintura interior y exterior' },
  { slug: 'mudanza', name: 'Mudanza', description: 'Servicios de mudanza completa' },
  { slug: 'flete', name: 'Flete', description: 'Transporte y envío de mercadería' },
  { slug: 'limpieza', name: 'Limpieza', description: 'Limpieza domiciliaria y comercial' },
  { slug: 'jardineria', name: 'Jardinería', description: 'Mantenimiento de jardines y espacios verdes' },
  { slug: 'peluqueria', name: 'Peluquería', description: 'Servicios de peluquería a domicilio' },
  { slug: 'veterinaria', name: 'Veterinario', description: 'Atención veterinaria a domicilio' },
  { slug: 'ninera', name: 'Niñera', description: 'Cuidado de niños profesional' },
  { slug: 'cuidador-adultos', name: 'Cuidador Adultos', description: 'Cuidado de adultos mayores' },
  { slug: 'albanileria', name: 'Albañil', description: 'Construcción y reformas' },
  { slug: 'carpinteria', name: 'Carpintero', description: 'Trabajos en madera y muebles' },
  { slug: 'tecnico-pc', name: 'Técnico PC', description: 'Reparación de computadoras' },
  { slug: 'profesor-particular', name: 'Profesor Particular', description: 'Clases particulares a domicilio' },
];

/** Solo para desarrollo local — nunca en producción */
const demoProfessionals = [
  {
    email: 'marcos.rodriguez@fixya.demo',
    firstName: 'Marcos',
    lastName: 'Rodríguez',
    phone: '+54 11 4567-8901',
    categorySlug: 'electricidad',
    title: 'Electricista matriculado',
    description: 'Electricista matriculado con más de 15 años de experiencia en instalaciones domiciliarias e industriales.',
    basePrice: 3500,
    ratingAvg: 4.9,
    ratingCount: 47,
    metadata: { bio: 'Electricista matriculado con más de 15 años de experiencia.', experienceYears: 15, licenseNumber: 'Matrícula #14882' },
    lat: -34.6037,
    lng: -58.3816,
  },
  {
    email: 'roberto.sanchez@fixya.demo',
    firstName: 'Roberto',
    lastName: 'Sánchez',
    phone: '+54 11 4567-8902',
    categorySlug: 'cerrajeria',
    title: 'Cerrajero · Urgencias 24hs',
    description: 'Aperturas de emergencia, cambio de cerraduras y duplicado de llaves las 24 horas.',
    basePrice: 4500,
    ratingAvg: 4.8,
    ratingCount: 62,
    metadata: { bio: 'Especialista en urgencias de cerrajería con cobertura en CABA y GBA.', experienceYears: 12, licenseNumber: 'Urgencias 24hs' },
    lat: -34.615,
    lng: -58.433,
  },
  {
    email: 'graciela.lopez@fixya.demo',
    firstName: 'Graciela',
    lastName: 'López',
    phone: '+54 11 4567-8903',
    categorySlug: 'gas',
    title: 'Gasista matriculada',
    description: 'Instalaciones de gas, revisiones periódicas y certificaciones para viviendas y comercios.',
    basePrice: 4200,
    ratingAvg: 4.95,
    ratingCount: 38,
    metadata: { bio: 'Gasista matriculada con certificación oficial.', experienceYears: 18, licenseNumber: 'Matrícula #8871-G' },
    lat: -34.59,
    lng: -58.42,
  },
  {
    email: 'carlos.mendoza@fixya.demo',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    phone: '+54 11 4567-8904',
    categorySlug: 'mudanza',
    title: 'Mudanzas completas',
    description: 'Mudanzas residenciales y comerciales con embalaje, transporte y montaje incluido.',
    basePrice: 15000,
    ratingAvg: 4.7,
    ratingCount: 29,
    metadata: { bio: 'Más de 10 años realizando mudanzas en Buenos Aires.', experienceYears: 10 },
    lat: -34.62,
    lng: -58.39,
  },
  {
    email: 'ana.gutierrez@fixya.demo',
    firstName: 'Ana',
    lastName: 'Gutiérrez',
    phone: '+54 11 4567-8905',
    categorySlug: 'veterinaria',
    title: 'Veterinaria a domicilio',
    description: 'Atención veterinaria para perros y gatos. Vacunas, consultas y emergencias.',
    basePrice: 6500,
    ratingAvg: 4.85,
    ratingCount: 51,
    metadata: { bio: 'Médica veterinaria especializada en pequeños animales.', experienceYears: 8, licenseNumber: 'MN 54321' },
    lat: -34.605,
    lng: -58.45,
  },
  {
    email: 'patricia.vega@fixya.demo',
    firstName: 'Patricia',
    lastName: 'Vega',
    phone: '+54 11 4567-8906',
    categorySlug: 'profesor-particular',
    title: 'Profesora de Matemáticas y Física',
    description: 'Clases particulares para secundaria y universidad. Preparación para exámenes.',
    basePrice: 3000,
    ratingAvg: 4.92,
    ratingCount: 44,
    metadata: { bio: 'Licenciada en Matemática con experiencia docente universitaria.', experienceYears: 14 },
    lat: -34.598,
    lng: -58.375,
  },
];

async function seedReferenceData(platformTenantId: string) {
  const categoryMap = new Map<string, string>();

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const created = await prisma.serviceCategory.upsert({
      where: { slug_tenantId: { slug: cat.slug, tenantId: platformTenantId } },
      update: { name: cat.name, description: cat.description, sortOrder: i },
      create: {
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        tenantId: platformTenantId,
        isGlobal: true,
        isActive: true,
        sortOrder: i,
      },
    });
    categoryMap.set(cat.slug, created.id);
  }

  await prisma.commissionRule.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Comisión global default',
      ratePercent: 0.08,
      isGlobal: true,
      isActive: true,
    },
  });

  return categoryMap;
}

async function seedAdmin(platformTenantId: string) {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    console.log('  Admin: omitido (definí ADMIN_EMAIL y ADMIN_PASSWORD para crear el administrador inicial)');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, status: 'ACTIVE', emailVerified: true },
    create: {
      email,
      passwordHash,
      firstName: process.env.ADMIN_FIRST_NAME ?? 'Administrador',
      lastName: process.env.ADMIN_LAST_NAME ?? 'FixYa',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: platformTenantId, userId: admin.id } },
    update: { role: MemberRole.SUPER_ADMIN, isActive: true },
    create: {
      tenantId: platformTenantId,
      userId: admin.id,
      role: MemberRole.SUPER_ADMIN,
      isDefault: true,
      isActive: true,
    },
  });

  console.log(`  Admin: ${email} (contraseña desde ADMIN_PASSWORD)`);
}

async function seedDemoData(categoryMap: Map<string, string>) {
  const demoPassword = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const demoClient = await prisma.user.upsert({
    where: { email: 'cliente@fixya.demo' },
    update: {},
    create: {
      email: 'cliente@fixya.demo',
      passwordHash,
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+54 11 4000-0000',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const clientTenant = await prisma.tenant.upsert({
    where: { slug: 'juan-perez-cliente' },
    update: { type: TenantType.EMPRESA },
    create: {
      slug: 'juan-perez-cliente',
      name: 'Juan Pérez',
      type: TenantType.EMPRESA,
      status: TenantStatus.ACTIVE,
    },
  });

  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: clientTenant.id, userId: demoClient.id } },
    update: {},
    create: {
      tenantId: clientTenant.id,
      userId: demoClient.id,
      role: MemberRole.CLIENTE,
      isDefault: true,
      isActive: true,
    },
  });

  for (const pro of demoProfessionals) {
    const user = await prisma.user.upsert({
      where: { email: pro.email },
      update: {
        firstName: pro.firstName,
        lastName: pro.lastName,
        phone: pro.phone,
        emailVerified: true,
        status: 'ACTIVE',
      },
      create: {
        email: pro.email,
        passwordHash,
        firstName: pro.firstName,
        lastName: pro.lastName,
        phone: pro.phone,
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    const tenantSlug = `${pro.firstName}-${pro.lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantSlug },
      update: { name: `${pro.firstName} ${pro.lastName}` },
      create: {
        slug: tenantSlug,
        name: `${pro.firstName} ${pro.lastName}`,
        type: TenantType.PROFESIONAL,
        status: TenantStatus.ACTIVE,
      },
    });

    await prisma.tenantMember.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {},
      create: {
        tenantId: tenant.id,
        userId: user.id,
        role: MemberRole.PROFESIONAL,
        isDefault: true,
        isActive: true,
      },
    });

    const categoryId = categoryMap.get(pro.categorySlug)!;
    const serviceSlug = `${pro.categorySlug}-${tenantSlug}`;

    const service = await prisma.service.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: serviceSlug } },
      update: {
        title: pro.title,
        description: pro.description,
        basePrice: pro.basePrice,
        ratingAvg: pro.ratingAvg,
        ratingCount: pro.ratingCount,
        professionalId: user.id,
        latitude: pro.lat,
        longitude: pro.lng,
        status: ServiceStatus.ACTIVE,
        metadata: pro.metadata,
      },
      create: {
        tenantId: tenant.id,
        categoryId,
        professionalId: user.id,
        title: pro.title,
        slug: serviceSlug,
        description: pro.description,
        basePrice: pro.basePrice,
        currency: 'ARS',
        ratingAvg: pro.ratingAvg,
        ratingCount: pro.ratingCount,
        latitude: pro.lat,
        longitude: pro.lng,
        status: ServiceStatus.ACTIVE,
        metadata: pro.metadata,
        coverageRadiusKm: 50,
      },
    });

    const existingReview = await prisma.serviceReview.findFirst({
      where: { serviceId: service.id },
    });

    if (!existingReview) {
      await prisma.serviceReview.create({
        data: {
          serviceId: service.id,
          reviewerId: demoClient.id,
          rating: 5,
          comment: `Excelente servicio de ${pro.firstName}. Muy profesional y puntual.`,
        },
      });
    }
  }

  console.log('  Datos demo: cargados (SEED_DEMO_DATA=true)');
  if (process.env.NODE_ENV !== 'production') {
    console.log('  Cuentas demo: *@fixya.demo (ver SEED_DEMO_PASSWORD en .env)');
  }
}

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && process.env.SEED_DEMO_DATA === 'true') {
    throw new Error('SEED_DEMO_DATA no puede estar activo en producción');
  }

  console.log('Seeding FixYa — datos de referencia...');

  const platformTenant = await prisma.tenant.upsert({
    where: { slug: 'fixya-platform' },
    update: {},
    create: {
      slug: 'fixya-platform',
      name: 'FixYa Platform',
      type: TenantType.PLATFORM,
      status: TenantStatus.ACTIVE,
    },
  });

  const categoryMap = await seedReferenceData(platformTenant.id);
  await seedAdmin(platformTenant.id);

  if (process.env.SEED_DEMO_DATA === 'true') {
    await seedDemoData(categoryMap);
    const { seedTestUsers } = await import('../scripts/seed-test-users.ts');
    await seedTestUsers(platformTenant.id, categoryMap);
  } else {
    console.log('  Datos demo: omitidos (SEED_DEMO_DATA no está activo)');
  }

  console.log('Seed completado.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
