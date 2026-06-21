#!/usr/bin/env tsx
/**
 * Importa / sincroniza matriculados Aguas del Norte desde scrape-aguas-del-norte-matriculados.mjs
 * Uso: npm run db:import:adn:directory
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  PrismaClient,
  MemberRole,
  TenantType,
  TenantStatus,
  ServiceStatus,
  ComplianceDocType,
  ComplianceStatus,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const REGISTRY_ID = 'aguas-del-norte';
const PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';
const args = process.argv.slice(2);
const ACTIVATE = args.includes('--activate');
const INPUT =
  args.find((a) => !a.startsWith('--')) ??
  'data/imports/aguas-del-norte-matriculados-full.json';
const COVERAGE_RADIUS_KM = 25;

const SALTA_COORDS = { lat: -24.7821, lng: -65.4232 };

interface AdnRecord {
  adnId: string;
  matricula: string | null;
  matriculaProfesional: string | null;
  licenseNumber: string;
  categoria: string;
  apellidonombre: string;
  domicilio?: string;
  localidad: string;
  barrio?: string;
  uop: string;
  provincia: string;
  telefono?: string;
  telefono2?: string;
  email?: string;
  cuit?: string;
  fchUltRenovacion?: string | null;
  fchUltVto?: string | null;
  observaciones?: string;
  estado: string;
}

const CATEGORIA_LABEL: Record<string, string> = {
  '1': '1ra',
  '2': '2da',
  '3': '3ra',
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function parseName(full: string): { firstName: string; lastName: string } {
  const clean = full.trim();
  const comma = clean.indexOf(',');
  if (comma > 0) {
    return {
      lastName: clean.slice(0, comma).trim(),
      firstName: clean.slice(comma + 1).trim() || 'Profesional',
    };
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return { firstName: 'Profesional', lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts.at(-1)! };
}

function titleCaseName(s: string) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function coordsFor(uop: string, localidad: string) {
  const seed = `${uop}-${localidad}`.toLowerCase();
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const jitterLat = ((h % 200) - 100) / 1000;
  const jitterLng = (((h >> 8) % 200) - 100) / 1000;
  return { lat: SALTA_COORDS.lat + jitterLat, lng: SALTA_COORDS.lng + jitterLng };
}

function padronEmail(adnId: string) {
  return `adn-${adnId}@padron.fixya.local`;
}

function resolveEmail(
  raw: string | undefined,
  adnId: string,
  used: Set<string>,
  directoryMode: boolean,
): string {
  if (directoryMode) {
    let email = padronEmail(adnId);
    if (used.has(email)) email = `adn-${adnId}-${used.size}@padron.fixya.local`;
    used.add(email);
    return email;
  }
  let email = (raw ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    email = padronEmail(adnId);
  }
  if (used.has(email)) email = padronEmail(adnId);
  if (used.has(email)) email = `adn-${adnId}-${used.size}@padron.fixya.local`;
  used.add(email);
  return email;
}

function resolvePhone(telefono?: string, telefono2?: string) {
  const raw = (telefono2 || telefono || '').trim();
  return raw || null;
}

function buildMetadata(row: AdnRecord) {
  return {
    adnId: row.adnId,
    licenseNumber: row.licenseNumber,
    registryId: REGISTRY_ID,
    adnCategory: CATEGORIA_LABEL[row.categoria] ?? row.categoria,
    importedFrom: 'aguas-del-norte-matriculados',
    directoryListing: true,
    pendingApproval: !ACTIVATE,
    province: row.provincia,
    uop: row.uop,
    localidad: row.localidad,
    barrio: row.barrio || null,
    domicilio: row.domicilio || null,
    sourceEmail: row.email || null,
    fchUltRenovacion: row.fchUltRenovacion,
    fchUltVto: row.fchUltVto,
    syncedAt: new Date().toISOString(),
  };
}

async function findExistingService(adnId: string) {
  return prisma.service.findFirst({
    where: {
      AND: [
        { metadata: { path: ['adnId'], equals: adnId } },
        { metadata: { path: ['registryId'], equals: REGISTRY_ID } },
      ],
    },
    select: {
      id: true,
      professionalId: true,
      status: true,
      metadata: true,
      tenantId: true,
    },
  });
}

async function main() {
  const abs = resolve(process.cwd(), INPUT);
  if (!existsSync(abs)) {
    console.error('Archivo no encontrado. Ejecutá primero: npm run scrape:adn');
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(abs, 'utf8')) as {
    meta?: Record<string, unknown>;
    records: AdnRecord[];
  };
  const records = payload.records ?? [];
  if (records.length === 0) {
    console.error('Sin registros en', abs);
    process.exit(1);
  }

  console.log(`Aguas del Norte → FixYa: ${records.length} matriculados\n`);
  console.log(
    `  Modo: ${ACTIVATE ? 'DIRECTORIO ACTIVO + sincronización' : 'pendiente de aprobación'}`,
  );

  const category = await prisma.serviceCategory.findFirst({
    where: { slug: 'plomeria', isActive: true },
  });
  if (!category) {
    console.error('Rubro "plomeria" no encontrado en la base.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const usedEmails = new Set<string>();

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of records) {
    const adnId = String(row.adnId ?? '').trim();
    const { firstName: fn, lastName: ln } = parseName(row.apellidonombre ?? '');
    const firstName = titleCaseName(fn);
    const lastName = titleCaseName(ln);

    if (!adnId || !lastName) {
      skipped++;
      continue;
    }

    const existing = await findExistingService(adnId);
    const phone = resolvePhone(row.telefono, row.telefono2);
    const { lat, lng } = coordsFor(row.uop, row.localidad);
    const metadata = buildMetadata(row);
    const catLabel = CATEGORIA_LABEL[row.categoria] ?? row.categoria;
    const description = `Plomero/sanitarista matriculado Aguas del Norte (${catLabel}). Sincronizado desde padrón oficial COSAySA.`;

    if (existing?.professionalId) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: existing.professionalId! },
            data: {
              phone,
              city: row.localidad || row.uop,
              province: row.provincia,
              address: row.domicilio || null,
              status: ACTIVATE ? UserStatus.ACTIVE : undefined,
            },
          });

          await tx.service.update({
            where: { id: existing.id },
            data: {
              description,
              latitude: lat,
              longitude: lng,
              status: ACTIVATE ? ServiceStatus.ACTIVE : existing.status,
              metadata: { ...(existing.metadata as object), ...metadata },
            },
          });

          const compliance = await tx.complianceDocument.findFirst({
            where: {
              userId: existing.professionalId!,
              docType: ComplianceDocType.MATRICULA,
              issuer: 'AGUAS DEL NORTE',
            },
          });
          if (compliance) {
            await tx.complianceDocument.update({
              where: { id: compliance.id },
              data: {
                documentNumber: row.licenseNumber,
                status: ACTIVATE ? ComplianceStatus.APPROVED : compliance.status,
                reviewedAt: ACTIVATE ? new Date() : compliance.reviewedAt,
              },
            });
          }
        });
        updated++;
        if ((created + updated) % 50 === 0) {
          process.stdout.write(`\r  Procesados: ${created + updated}...`);
        }
      } catch (err) {
        errors++;
        if (errors <= 5) {
          console.warn('\n  Error update:', adnId, err instanceof Error ? err.message : err);
        }
      }
      continue;
    }

    const email = resolveEmail(row.email, adnId, usedEmails, ACTIVATE);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      skipped++;
      continue;
    }

    const matSlug = slugify(row.licenseNumber);
    const tenantSlug = slugify(`adn-${adnId}-${lastName}-${firstName}`).slice(0, 80);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            city: row.localidad || row.uop,
            province: row.provincia,
            address: row.domicilio || null,
            status: ACTIVATE ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION,
            emailVerified: false,
          },
        });

        const tenant = await tx.tenant.create({
          data: {
            slug: tenantSlug,
            name: `${firstName} ${lastName}`,
            type: TenantType.PROFESIONAL,
            status: ACTIVATE ? TenantStatus.ACTIVE : TenantStatus.PENDING,
            email,
            phone,
          },
        });

        await tx.tenantMember.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            role: MemberRole.PROFESIONAL,
            isDefault: true,
          },
        });

        await tx.service.create({
          data: {
            tenantId: tenant.id,
            categoryId: category.id,
            professionalId: user.id,
            title: `${firstName} ${lastName} — Plomero`,
            slug: `${tenantSlug}-plomeria`.slice(0, 250),
            description,
            status: ACTIVATE ? ServiceStatus.ACTIVE : ServiceStatus.DRAFT,
            latitude: lat,
            longitude: lng,
            coverageRadiusKm: COVERAGE_RADIUS_KM,
            metadata,
          },
        });

        await tx.complianceDocument.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            docType: ComplianceDocType.MATRICULA,
            status: ACTIVATE ? ComplianceStatus.APPROVED : ComplianceStatus.PENDING_REVIEW,
            documentNumber: row.licenseNumber,
            issuer: 'AGUAS DEL NORTE',
            fileUrl:
              'https://www.aguasdelnortesalta.com.ar/consulta_matriculados.php',
            reviewedAt: ACTIVATE ? new Date() : null,
            reviewNote: ACTIVATE
              ? 'Verificado contra padrón público Aguas del Norte COSAySA (import directorio)'
              : null,
          },
        });
      });

      created++;
      if ((created + updated) % 50 === 0) {
        process.stdout.write(`\r  Procesados: ${created + updated}...`);
      }
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.warn('\n  Error create:', email, adnId, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`\n\nImportación Aguas del Norte finalizada:`);
  console.log(`  ✓ Creados:    ${created}`);
  console.log(`  ↻ Actualizados: ${updated}`);
  console.log(`  ○ Omitidos:   ${skipped}`);
  console.log(`  ✗ Errores:    ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
