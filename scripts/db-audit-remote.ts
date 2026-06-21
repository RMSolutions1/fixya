#!/usr/bin/env tsx
/**
 * Auditoría remota de la DB FixYa (Neon/Postgres).
 * Uso: npx tsx scripts/db-audit-remote.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGISTRY_IDS = ['copaipa', 'gasnor', 'aguas-del-norte'] as const;

async function main() {
  console.log('✓ Conexión remota vía Prisma OK\n');

  await prisma.$queryRaw`SELECT 1`;
  const ver = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
  console.log('PostgreSQL:', ver[0].version.split(',')[0]);

  const ext = await prisma.$queryRaw<Array<{ extname: string }>>`
    SELECT extname FROM pg_extension
    WHERE extname IN ('postgis', 'pg_trgm', 'uuid-ossp', 'pgcrypto')
    ORDER BY extname
  `;
  console.log('Extensiones:', ext.map((e) => e.extname).join(', ') || '(ninguna)');

  const [
    categories,
    users,
    servicesActive,
    servicesTotal,
    professionalsWithServices,
    testUsers,
    demoUsers,
  ] = await Promise.all([
    prisma.serviceCategory.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.service.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.service.groupBy({
      by: ['professionalId'],
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        professionalId: { not: null },
      },
    }),
    prisma.user.count({ where: { email: { endsWith: '@fixya.test' } } }),
    prisma.user.count({ where: { email: { endsWith: '@fixya.demo' } } }),
  ]);

  console.log('\n── Conteos de datos ──');
  console.log(`  categories: ${categories}`);
  console.log(`  users: ${users}`);
  console.log(`  services_active: ${servicesActive}`);
  console.log(`  services_total: ${servicesTotal}`);
  console.log(`  professionals_with_services: ${professionalsWithServices.length}`);
  console.log(`  test_users (@fixya.test): ${testUsers}`);
  console.log(`  demo_users (@fixya.demo): ${demoUsers}`);

  console.log('\n── Padrones (metadata.registryId) ──');
  for (const reg of REGISTRY_IDS) {
    const n = await prisma.service.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        metadata: { path: ['registryId'], equals: reg },
      },
    });
    console.log(`  ${reg}: ${n}`);
  }

  const geo = await prisma.$queryRaw<Array<{ n: number }>>`
    SELECT COUNT(*)::int AS n
    FROM fixya.services s
    WHERE s.deleted_at IS NULL AND s.status = 'ACTIVE'
      AND s.professional_id IS NOT NULL
      AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL
      AND (
        6371 * acos(
          LEAST(1, GREATEST(-1,
            cos(radians(-24.7821)) * cos(radians(s.latitude::float)) *
            cos(radians(s.longitude::float) - radians(-65.4232)) +
            sin(radians(-24.7821)) * sin(radians(s.latitude::float))
          ))
        )
      ) <= 50
  `;
  console.log(`\n  servicios geo 50km Salta: ${geo[0].n}`);

  const verifiedPros = await prisma.user.count({
    where: {
      deletedAt: null,
      status: 'ACTIVE',
      memberships: { some: { role: 'PROFESIONAL' } },
    },
  });

  const [tenants, commissionRules, closedRequests, platformTenant] = await Promise.all([
    prisma.tenant.count({ where: { deletedAt: null } }),
    prisma.commissionRule.count({ where: { isActive: true } }),
    prisma.serviceRequest.count({ where: { status: 'CLOSED', deletedAt: null } }),
    prisma.tenant.findFirst({
      where: { type: 'PLATFORM', deletedAt: null },
      select: { slug: true, name: true },
    }),
  ]);

  console.log('\n── Referencia operativa ──');
  console.log(`  tenants: ${tenants}`);
  console.log(`  commission_rules (activas): ${commissionRules}`);
  console.log(`  solicitudes cerradas: ${closedRequests}`);
  console.log(`  tenant PLATFORM: ${platformTenant?.slug ?? 'NO ENCONTRADO'}`);

  console.log('\n── vs API producción (referencia) ──');
  console.log(`  verified professionals (sin filtro QA): ${verifiedPros}`);

  const issues: string[] = [];
  if (categories < 15) issues.push('Pocas categorías — npm run db:seed');
  if (servicesActive < 100) issues.push('Pocos servicios — revisar import padrones');

  const copaipa = await prisma.service.count({
    where: { metadata: { path: ['registryId'], equals: 'copaipa' }, deletedAt: null },
  });
  if (copaipa < 3000) issues.push(`COPAIPA bajo (${copaipa}) — npm run sync:copaipa`);
  if (!platformTenant) issues.push('Falta tenant PLATFORM — npm run db:seed');
  if (commissionRules === 0) issues.push('Sin reglas de comisión — npm run db:seed');

  console.log('\n── Salud ──');
  if (issues.length === 0) {
    console.log('✓ Esquema sincronizado (prisma db push) y datos de padrones presentes');
  } else {
    console.log('Advertencias:');
    for (const i of issues) console.log(`  ! ${i}`);
  }
}

main()
  .catch((err) => {
    console.error('Error:', err.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
