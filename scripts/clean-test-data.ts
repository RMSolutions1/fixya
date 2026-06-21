/**
 * Elimina usuarios y datos asociados @fixya.test y @fixya.demo.
 * No toca padrones importados (COPAIPA, GASNOR, ADN).
 *
 * Uso: npm run db:clean-test
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_SUFFIXES = ['@fixya.test', '@fixya.demo'] as const;

const ORPHAN_TENANT_SLUGS = [
  'juan-perez-cliente',
  'marcos-rodriguez',
  'roberto-sanchez',
  'graciela-lopez',
  'carlos-mendoza',
  'ana-gutierrez',
  'patricia-vega',
  'carla-cliente',
  'pedro-profesional',
  'empresa-demo',
];

async function main() {
  const testUsers = await prisma.user.findMany({
    where: {
      OR: TEST_SUFFIXES.map((suffix) => ({
        email: { endsWith: suffix, mode: 'insensitive' as const },
      })),
    },
    select: { id: true, email: true },
  });

  if (testUsers.length === 0) {
    console.log('No hay usuarios de prueba (@fixya.test / @fixya.demo).');
  } else {
    const userIds = testUsers.map((u) => u.id);
    console.log(`Eliminando ${testUsers.length} usuario(s) de prueba...`);
    for (const u of testUsers) console.log(`  · ${u.email}`);

    const testServices = await prisma.service.findMany({
      where: { professionalId: { in: userIds } },
      select: { id: true },
    });
    const serviceIds = testServices.map((s) => s.id);

    const engagements = await prisma.engagement.findMany({
      where: {
        OR: [{ clientId: { in: userIds } }, { professionalId: { in: userIds } }],
      },
      select: { id: true, payment: { select: { id: true } } },
    });
    const engagementIds = engagements.map((e) => e.id);
    const paymentIds = engagements.map((e) => e.payment?.id).filter(Boolean) as string[];

    if (engagementIds.length > 0) {
      await prisma.engagementTimelineEvent.deleteMany({
        where: { engagementId: { in: engagementIds } },
      });

      const walletAccounts = await prisma.walletAccount.findMany({
        where: { engagementId: { in: engagementIds } },
        select: { id: true },
      });
      const walletIds = walletAccounts.map((w) => w.id);

      if (walletIds.length > 0) {
        await prisma.walletEvent.deleteMany({
          where: { walletAccountId: { in: walletIds } },
        });
        const ledgerEntries = await prisma.ledgerEntry.findMany({
          where: { walletAccountId: { in: walletIds } },
          select: { id: true },
        });
        const ledgerEntryIds = ledgerEntries.map((e) => e.id);
        if (ledgerEntryIds.length > 0) {
          await prisma.ledgerLine.deleteMany({
            where: { ledgerEntryId: { in: ledgerEntryIds } },
          });
          await prisma.ledgerEntry.deleteMany({ where: { id: { in: ledgerEntryIds } } });
        }
        await prisma.walletAccount.deleteMany({ where: { id: { in: walletIds } } });
      }

      if (paymentIds.length > 0) {
        await prisma.paymentRefund.deleteMany({ where: { paymentId: { in: paymentIds } } });
        await prisma.payment.deleteMany({ where: { id: { in: paymentIds } } });
      }
      await prisma.dispute.deleteMany({ where: { engagementId: { in: engagementIds } } });
      await prisma.engagement.deleteMany({ where: { id: { in: engagementIds } } });
    }

    await prisma.serviceReview.deleteMany({
      where: {
        OR: [
          { reviewerId: { in: userIds } },
          ...(serviceIds.length ? [{ serviceId: { in: serviceIds } }] : []),
        ],
      },
    });
    await prisma.favorite.deleteMany({ where: { userId: { in: userIds } } });

    if (serviceIds.length > 0) {
      await prisma.service.deleteMany({ where: { id: { in: serviceIds } } });
    }

    await prisma.quotation.deleteMany({
      where: { professionalId: { in: userIds } },
    });
    await prisma.serviceRequest.deleteMany({
      where: { clientId: { in: userIds } },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.emailVerificationToken.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.userSession.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.tenantMember.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  for (const slug of ORPHAN_TENANT_SLUGS) {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) continue;
    const members = await prisma.tenantMember.count({ where: { tenantId: tenant.id } });
    const services = await prisma.service.count({ where: { tenantId: tenant.id } });
    if (members === 0 && services === 0) {
      try {
        await prisma.outboxEvent.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.tenant.delete({ where: { id: tenant.id } });
        console.log(`  Tenant huérfano eliminado: ${slug}`);
      } catch {
        console.log(`  Tenant ${slug} omitido (referencias restantes)`);
      }
    }
  }

  console.log('\n✓ Limpieza de datos de prueba completada.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
