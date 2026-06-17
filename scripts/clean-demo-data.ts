/**
 * Elimina usuarios, servicios y datos asociados del dominio @fixya.demo
 * Ejecutar: npm run db:clean-demo
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: '@fixya.demo' } },
    select: { id: true, email: true },
  });

  if (demoUsers.length === 0) {
    console.log('No hay usuarios demo para eliminar.');
    return;
  }

  const userIds = demoUsers.map((u) => u.id);
  console.log(`Eliminando ${demoUsers.length} usuario(s) demo...`);

  await prisma.serviceReview.deleteMany({ where: { reviewerId: { in: userIds } } });

  const demoServices = await prisma.service.findMany({
    where: { professionalId: { in: userIds } },
    select: { id: true },
  });
  const serviceIds = demoServices.map((s) => s.id);

  if (serviceIds.length > 0) {
    await prisma.serviceReview.deleteMany({ where: { serviceId: { in: serviceIds } } });
    await prisma.service.deleteMany({ where: { id: { in: serviceIds } } });
  }

  await prisma.tenantMember.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  const orphanTenants = await prisma.tenant.findMany({
    where: {
      slug: {
        in: [
          'juan-perez-cliente',
          'marcos-rodriguez',
          'roberto-sanchez',
          'graciela-lopez',
          'carlos-mendoza',
          'ana-gutierrez',
          'patricia-vega',
        ],
      },
    },
  });

  for (const tenant of orphanTenants) {
    const members = await prisma.tenantMember.count({ where: { tenantId: tenant.id } });
    if (members === 0) {
      await prisma.tenant.delete({ where: { id: tenant.id } });
      console.log(`  Tenant eliminado: ${tenant.slug}`);
    }
  }

  console.log('Limpieza de datos demo completada.');

  const legacyAdmin = await prisma.user.findUnique({
    where: { email: 'admin@fixya.com.ar' },
  });
  if (legacyAdmin) {
    await prisma.tenantMember.deleteMany({ where: { userId: legacyAdmin.id } });
    await prisma.user.delete({ where: { id: legacyAdmin.id } });
    console.log('  Admin legacy (admin@fixya.com.ar) eliminado — creá uno con ADMIN_EMAIL en el seed.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
