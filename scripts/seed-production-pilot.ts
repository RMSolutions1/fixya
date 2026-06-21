/**
 * Usuarios piloto para contratación E2E en producción.
 * Emails @fixya.com.ar — no aparecen en directorio público.
 *
 * Uso:
 *   PILOT_SEED_CONFIRM=1 npm run db:seed:pilot
 */
import { PrismaClient, MemberRole, TenantStatus, TenantType, ServiceStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const PILOT_CLIENT_EMAIL = 'piloto.cliente@fixya.com.ar';
export const PILOT_PRO_EMAIL = 'piloto.profesional@fixya.com.ar';

async function main() {
  if (process.env.PILOT_SEED_CONFIRM !== '1') {
    throw new Error('Definí PILOT_SEED_CONFIRM=1 para crear usuarios piloto en la DB remota');
  }

  const password =
    process.env.PILOT_PASSWORD?.trim() ||
    `FixYa-pilot-${randomBytes(6).toString('base64url')}`;

  const platform = await prisma.tenant.findFirst({
    where: { slug: 'fixya-platform', deletedAt: null },
  });
  if (!platform) throw new Error('Ejecutá npm run db:seed primero');

  const plomeria = await prisma.serviceCategory.findFirst({
    where: { tenantId: platform.id, slug: 'plomeria', deletedAt: null },
  });
  if (!plomeria) throw new Error('Categoría plomería no encontrada');

  const passwordHash = await bcrypt.hash(password, 12);

  const client = await prisma.user.upsert({
    where: { email: PILOT_CLIENT_EMAIL },
    update: {
      firstName: 'María',
      lastName: 'Piloto Cliente',
      passwordHash,
      status: 'ACTIVE',
      emailVerified: true,
      city: 'Salta',
      province: 'Salta',
      deletedAt: null,
    },
    create: {
      email: PILOT_CLIENT_EMAIL,
      passwordHash,
      firstName: 'María',
      lastName: 'Piloto Cliente',
      phone: '+54 387 400-0001',
      city: 'Salta',
      province: 'Salta',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const pro = await prisma.user.upsert({
    where: { email: PILOT_PRO_EMAIL },
    update: {
      firstName: 'Jorge',
      lastName: 'Piloto Profesional',
      passwordHash,
      status: 'ACTIVE',
      emailVerified: true,
      city: 'Salta',
      province: 'Salta',
      deletedAt: null,
    },
    create: {
      email: PILOT_PRO_EMAIL,
      passwordHash,
      firstName: 'Jorge',
      lastName: 'Piloto Profesional',
      phone: '+54 387 400-0002',
      city: 'Salta',
      province: 'Salta',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  const clientTenant = await prisma.tenant.upsert({
    where: { slug: 'piloto-cliente-fixya' },
    update: { name: 'María Piloto Cliente', status: TenantStatus.ACTIVE },
    create: {
      slug: 'piloto-cliente-fixya',
      name: 'María Piloto Cliente',
      type: TenantType.EMPRESA,
      status: TenantStatus.ACTIVE,
    },
  });

  const proTenant = await prisma.tenant.upsert({
    where: { slug: 'piloto-profesional-fixya' },
    update: { name: 'Jorge Piloto Profesional', status: TenantStatus.ACTIVE },
    create: {
      slug: 'piloto-profesional-fixya',
      name: 'Jorge Piloto Profesional',
      type: TenantType.PROFESIONAL,
      status: TenantStatus.ACTIVE,
    },
  });

  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: clientTenant.id, userId: client.id } },
    update: { role: MemberRole.CLIENTE, isActive: true, isDefault: true },
    create: {
      tenantId: clientTenant.id,
      userId: client.id,
      role: MemberRole.CLIENTE,
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: proTenant.id, userId: pro.id } },
    update: { role: MemberRole.PROFESIONAL, isActive: true, isDefault: true },
    create: {
      tenantId: proTenant.id,
      userId: pro.id,
      role: MemberRole.PROFESIONAL,
      isDefault: true,
      isActive: true,
    },
  });

  await prisma.service.upsert({
    where: { tenantId_slug: { tenantId: proTenant.id, slug: 'plomeria-piloto' } },
    update: {
      professionalId: pro.id,
      status: ServiceStatus.ACTIVE,
      title: 'Plomería — Piloto FixYa',
      description: 'Profesional piloto para validación de contrataciones E2E',
      basePrice: 15000,
    },
    create: {
      tenantId: proTenant.id,
      categoryId: plomeria.id,
      professionalId: pro.id,
      title: 'Plomería — Piloto FixYa',
      slug: 'plomeria-piloto',
      description: 'Profesional piloto para validación de contrataciones E2E',
      basePrice: 15000,
      currency: 'ARS',
      status: ServiceStatus.ACTIVE,
      coverageRadiusKm: 50,
      latitude: -24.7821,
      longitude: -65.4232,
    },
  });

  const credPath = join(root, '.pilot-credentials.local');
  writeFileSync(
    credPath,
    [
      `# FixYa — usuarios piloto E2E (${new Date().toISOString().slice(0, 10)})`,
      `# NO commitear`,
      `PILOT_CLIENT_EMAIL=${PILOT_CLIENT_EMAIL}`,
      `PILOT_PRO_EMAIL=${PILOT_PRO_EMAIL}`,
      `PILOT_PASSWORD=${password}`,
      `URL=https://fixya.emprenor.com/login`,
    ].join('\n') + '\n',
    'utf8',
  );

  console.log('✓ Usuarios piloto creados/actualizados');
  console.log(`  Cliente:      ${PILOT_CLIENT_EMAIL}`);
  console.log(`  Profesional:  ${PILOT_PRO_EMAIL}`);
  console.log(`  Contraseña:   ${password}`);
  console.log(`  Credenciales: .pilot-credentials.local`);
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
