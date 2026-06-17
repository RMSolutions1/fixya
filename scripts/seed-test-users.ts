/**
 * Crea usuarios de prueba para cada rol de FixYa.
 * Uso: npm run db:seed:users
 * Contraseña: SEED_DEMO_PASSWORD o FixYa2026!
 */
import {
  PrismaClient,
  MemberRole,
  TenantType,
  TenantStatus,
  ServiceStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const TEST_USER_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';

export const TEST_USERS = [
  {
    email: 'admin@fixya.test',
    firstName: 'Admin',
    lastName: 'FixYa',
    role: MemberRole.SUPER_ADMIN,
    tenantSlug: 'fixya-platform',
    tenantType: TenantType.PLATFORM,
  },
  {
    email: 'cliente@fixya.test',
    firstName: 'Carla',
    lastName: 'Cliente',
    role: MemberRole.CLIENTE,
    tenantSlug: 'carla-cliente',
    tenantType: TenantType.EMPRESA,
  },
  {
    email: 'profesional@fixya.test',
    firstName: 'Pedro',
    lastName: 'Profesional',
    role: MemberRole.PROFESIONAL,
    tenantSlug: 'pedro-profesional',
    tenantType: TenantType.PROFESIONAL,
    withService: true,
    categorySlug: 'plomeria',
  },
  {
    email: 'empresa@fixya.test',
    firstName: 'Empresa',
    lastName: 'Demo',
    role: MemberRole.EMPRESA,
    tenantSlug: 'empresa-demo',
    tenantType: TenantType.EMPRESA,
    withService: true,
    categorySlug: 'electricidad',
  },
  {
    email: 'contador@fixya.test',
    firstName: 'Laura',
    lastName: 'Contadora',
    role: MemberRole.CONTADOR,
    tenantSlug: 'fixya-platform',
    tenantType: TenantType.PLATFORM,
  },
  {
    email: 'supervisor@fixya.test',
    firstName: 'Sergio',
    lastName: 'Supervisor',
    role: MemberRole.SUPERVISOR,
    tenantSlug: 'fixya-platform',
    tenantType: TenantType.PLATFORM,
  },
  {
    email: 'operador@fixya.test',
    firstName: 'Olivia',
    lastName: 'Operadora',
    role: MemberRole.OPERADOR,
    tenantSlug: 'fixya-platform',
    tenantType: TenantType.PLATFORM,
  },
  {
    email: 'auditor@fixya.test',
    firstName: 'Andrés',
    lastName: 'Auditor',
    role: MemberRole.AUDITOR,
    tenantSlug: 'fixya-platform',
    tenantType: TenantType.PLATFORM,
  },
  {
    email: 'gestor@fixya.test',
    firstName: 'Gabriela',
    lastName: 'Gestora',
    role: MemberRole.GESTOR_DOCUMENTAL,
    tenantSlug: 'fixya-platform',
    tenantType: TenantType.PLATFORM,
  },
] as const;

export async function seedTestUsers(
  platformTenantId: string,
  categoryMap: Map<string, string>,
) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seedTestUsers no puede ejecutarse en producción');
  }

  const passwordHash = await bcrypt.hash(TEST_USER_PASSWORD, 12);

  for (const spec of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { email: spec.email },
      update: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        passwordHash,
        status: 'ACTIVE',
        emailVerified: true,
      },
      create: {
        email: spec.email,
        passwordHash,
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone: '+54 387 352-2920',
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    const tenantId =
      spec.tenantSlug === 'fixya-platform'
        ? platformTenantId
        : (
            await prisma.tenant.upsert({
              where: { slug: spec.tenantSlug },
              update: { name: `${spec.firstName} ${spec.lastName}`, type: spec.tenantType },
              create: {
                slug: spec.tenantSlug,
                name: `${spec.firstName} ${spec.lastName}`,
                type: spec.tenantType,
                status: TenantStatus.ACTIVE,
              },
            })
          ).id;

    await prisma.tenantMember.upsert({
      where: { tenantId_userId: { tenantId, userId: user.id } },
      update: { role: spec.role, isActive: true, isDefault: true },
      create: {
        tenantId,
        userId: user.id,
        role: spec.role,
        isDefault: true,
        isActive: true,
      },
    });

    if ('withService' in spec && spec.withService && 'categorySlug' in spec) {
      const categoryId = categoryMap.get(spec.categorySlug);
      if (categoryId) {
        const serviceSlug = `${spec.categorySlug}-${spec.tenantSlug}`;
        await prisma.service.upsert({
          where: { tenantId_slug: { tenantId, slug: serviceSlug } },
          update: {
            professionalId: user.id,
            status: ServiceStatus.ACTIVE,
            title: `Servicio ${spec.firstName}`,
            description: `Servicio de prueba para ${spec.email}`,
            basePrice: 5000,
          },
          create: {
            tenantId,
            categoryId,
            professionalId: user.id,
            title: `Servicio ${spec.firstName}`,
            slug: serviceSlug,
            description: `Servicio de prueba para ${spec.email}`,
            basePrice: 5000,
            currency: 'ARS',
            status: ServiceStatus.ACTIVE,
            coverageRadiusKm: 50,
            latitude: -24.7821,
            longitude: -65.4232,
          },
        });
      }
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log('  CREDENCIALES DE PRUEBA — FixYa (todos los roles)');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Contraseña común: ${TEST_USER_PASSWORD}`);
  console.log('──────────────────────────────────────────────────');
  for (const spec of TEST_USERS) {
    console.log(`  ${spec.role.padEnd(18)} ${spec.email}`);
  }
  console.log('──────────────────────────────────────────────────');
  console.log('  Demo adicional (db:seed:demo):');
  console.log('  CLIENTE            cliente@fixya.demo');
  console.log('  PROFESIONAL        marcos.rodriguez@fixya.demo');
  console.log('══════════════════════════════════════════════════\n');
}

async function main() {
  const platform = await prisma.tenant.findUnique({ where: { slug: 'fixya-platform' } });
  if (!platform) {
    console.error('Ejecutá primero: npm run db:seed');
    process.exit(1);
  }

  const categories = await prisma.serviceCategory.findMany({
    where: { tenantId: platform.id, parentId: null },
  });
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  await seedTestUsers(platform.id, categoryMap);
  console.log('Usuarios de prueba creados/actualizados.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
