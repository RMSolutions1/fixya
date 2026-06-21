#!/usr/bin/env tsx
/**
 * Activa en bloque los profesionales importados del padrón COPAIPA para que figuren
 * como "directorio referencial" en el mapa público (status ACTIVE + servicios ACTIVE
 * + coords de Salta si faltan). No envía emails ni toca cuentas registradas a mano.
 *
 * Uso:
 *   npm run db:approve:copaipa           # activa todos los importados COPAIPA
 *   npm run db:approve:copaipa -- --dry  # solo informa, no escribe
 */
import {
  PrismaClient,
  ServiceStatus,
  TenantStatus,
  UserStatus,
  ComplianceStatus,
} from '@prisma/client';

const prisma = new PrismaClient();
const DRY = process.argv.includes('--dry');

const SALTA_COORDS = { lat: -24.7821, lng: -65.4232 };
const COVERAGE_RADIUS_KM = 30;

async function main() {
  const services = await prisma.service.findMany({
    where: {
      deletedAt: null,
      metadata: { path: ['importedFrom'], equals: 'copaipa-padron' },
    },
    select: { id: true, professionalId: true, tenantId: true, latitude: true, longitude: true },
  });

  if (services.length === 0) {
    console.log('No hay servicios importados de COPAIPA. Corré primero: npm run sync:copaipa');
    return;
  }

  const proIds = [...new Set(services.map((s) => s.professionalId).filter(Boolean) as string[])];
  const tenantIds = [...new Set(services.map((s) => s.tenantId))];

  console.log(`Directorio COPAIPA: ${services.length} servicios · ${proIds.length} profesionales`);
  if (DRY) {
    console.log('Modo --dry: no se escribe nada.');
    return;
  }

  // Coordenadas faltantes (imports antiguos sin geolocalización)
  const sinCoords = services.filter((s) => s.latitude == null || s.longitude == null);
  if (sinCoords.length > 0) {
    await prisma.service.updateMany({
      where: { id: { in: sinCoords.map((s) => s.id) } },
      data: {
        latitude: SALTA_COORDS.lat,
        longitude: SALTA_COORDS.lng,
        coverageRadiusKm: COVERAGE_RADIUS_KM,
      },
    });
    console.log(`  Coordenadas Salta asignadas a ${sinCoords.length} servicios`);
  }

  const [svc, usr, tnt, doc] = await prisma.$transaction([
    prisma.service.updateMany({
      where: { id: { in: services.map((s) => s.id) } },
      data: { status: ServiceStatus.ACTIVE },
    }),
    prisma.user.updateMany({
      where: { id: { in: proIds }, status: UserStatus.PENDING_VERIFICATION },
      data: { status: UserStatus.ACTIVE },
    }),
    prisma.tenant.updateMany({
      where: { id: { in: tenantIds }, status: TenantStatus.PENDING },
      data: { status: TenantStatus.ACTIVE },
    }),
    prisma.complianceDocument.updateMany({
      where: { userId: { in: proIds }, status: ComplianceStatus.PENDING_REVIEW },
      data: {
        status: ComplianceStatus.APPROVED,
        reviewedAt: new Date(),
        reviewNote: 'Verificado contra padrón público COPAIPA (directorio referencial)',
      },
    }),
  ]);

  console.log('\nDirectorio COPAIPA activado:');
  console.log(`  Servicios ACTIVE:   ${svc.count}`);
  console.log(`  Usuarios ACTIVE:    ${usr.count}`);
  console.log(`  Tenants ACTIVE:     ${tnt.count}`);
  console.log(`  Matrículas APPROVED: ${doc.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
