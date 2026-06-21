#!/usr/bin/env tsx
/**
 * Importa instaladores Gasnor (Naturgy NOA) desde JSON de scrape-gasnor-instaladores.mjs
 * Uso: npm run db:import:gasnor:directory
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
const PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';
const args = process.argv.slice(2);
const ACTIVATE = args.includes('--activate');
const INPUT = args.find((a) => !a.startsWith('--')) ?? 'data/imports/gasnor-instaladores-full.json';
const COVERAGE_RADIUS_KM = 25;

const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  jujuy: { lat: -24.1858, lng: -65.2995 },
  salta: { lat: -24.7821, lng: -65.4232 },
  'santiago del estero': { lat: -27.7951, lng: -64.2615 },
  tucumán: { lat: -26.8083, lng: -65.2176 },
  tucuman: { lat: -26.8083, lng: -65.2176 },
};

interface GasnorRecord {
  matricula: string;
  categoria: string;
  apellido: string;
  nombre: string;
  domicilio?: string;
  localidad: string;
  provincia: string;
  telefono?: string;
  celular?: string;
  email?: string;
  provinciaApi?: string;
  provinciaLabel?: string;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function coordsFor(provinceLabel: string, localidad: string) {
  const key = provinceLabel.trim().toLowerCase();
  const base = PROVINCE_COORDS[key] ?? PROVINCE_COORDS.salta;
  let h = 0;
  const seed = `${localidad}-${provinceLabel}`.toLowerCase();
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const jitterLat = ((h % 200) - 100) / 1000;
  const jitterLng = (((h >> 8) % 200) - 100) / 1000;
  return { lat: base.lat + jitterLat, lng: base.lng + jitterLng };
}

function matriculaEmail(matricula: string, provinciaApi: string) {
  const slug = slugify(`${provinciaApi}-${matricula}`) || 'sin-matricula';
  return `gasnor-${slug}@padron.fixya.local`;
}

function resolveEmail(
  raw: string | undefined,
  matricula: string,
  provinciaApi: string,
  used: Set<string>,
): string {
  let email = (raw ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    email = matriculaEmail(matricula, provinciaApi);
  }
  if (used.has(email)) {
    email = matriculaEmail(matricula, provinciaApi);
  }
  if (used.has(email)) {
    email = `gasnor-${slugify(matricula)}-${used.size}@padron.fixya.local`;
  }
  used.add(email);
  return email;
}

function resolvePhone(telefono?: string, celular?: string) {
  const raw = (celular || telefono || '').replace(/\.$/, '').trim();
  return raw || null;
}

function titleCaseName(s: string) {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function main() {
  const abs = resolve(process.cwd(), INPUT);
  if (!existsSync(abs)) {
    console.error('Archivo no encontrado. Ejecutá primero: npm run scrape:gasnor');
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(abs, 'utf8')) as {
    meta?: Record<string, unknown>;
    records: GasnorRecord[];
  };
  const records = payload.records ?? [];
  if (records.length === 0) {
    console.error('Sin registros en', abs);
    process.exit(1);
  }

  console.log(`Gasnor → FixYa: ${records.length} instaladores\n`);
  console.log(`  Modo: ${ACTIVATE ? 'DIRECTORIO ACTIVO (visible en mapa)' : 'pendiente de aprobación'}`);

  const category = await prisma.serviceCategory.findFirst({ where: { slug: 'gas', isActive: true } });
  if (!category) {
    console.error('Rubro "gas" no encontrado en la base.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const usedEmails = new Set<string>();

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of records) {
    const matricula = String(row.matricula ?? '').trim();
    const lastName = titleCaseName(row.apellido ?? '');
    const firstName = titleCaseName(row.nombre ?? '');
    const provinceLabel = row.provinciaLabel ?? row.provincia ?? 'Salta';
    const provinciaApi = row.provinciaApi ?? row.provincia ?? 'SALTA';

    if (!matricula || !lastName) {
      skipped++;
      continue;
    }

    const existingMat = await prisma.service.findFirst({
      where: {
        AND: [
          { metadata: { path: ['licenseNumber'], equals: matricula } },
          { metadata: { path: ['registryId'], equals: 'gasnor' } },
        ],
      },
      select: { id: true },
    });
    if (existingMat) {
      skipped++;
      continue;
    }

    const email = resolveEmail(row.email, matricula, provinciaApi, usedEmails);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      skipped++;
      continue;
    }

    const { lat, lng } = coordsFor(provinceLabel, row.localidad ?? '');
    const matSlug = matricula.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    const tenantSlug = slugify(`gasnor-${matSlug}-${lastName}-${firstName}`).slice(0, 80);
    const phone = resolvePhone(row.telefono, row.celular);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            city: row.localidad || provinceLabel,
            province: provinceLabel,
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
            title: `${firstName} ${lastName} — Gasista`,
            slug: `${tenantSlug}-gas`.slice(0, 250),
            description: `Instalador matriculado Gasnor (${row.categoria || 'habilitado'}). Importado desde padrón público Naturgy NOA.`,
            status: ACTIVATE ? ServiceStatus.ACTIVE : ServiceStatus.DRAFT,
            latitude: lat,
            longitude: lng,
            coverageRadiusKm: COVERAGE_RADIUS_KM,
            metadata: {
              licenseNumber: matricula,
              registryId: 'gasnor',
              gasCategory: row.categoria || null,
              importedFrom: 'gasnor-instaladores',
              directoryListing: true,
              pendingApproval: !ACTIVATE,
              province: provinceLabel,
              localidad: row.localidad,
              domicilio: row.domicilio || null,
              sourceEmail: row.email || null,
            },
          },
        });

        await tx.complianceDocument.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            docType: ComplianceDocType.MATRICULA,
            status: ACTIVATE ? ComplianceStatus.APPROVED : ComplianceStatus.PENDING_REVIEW,
            documentNumber: matricula,
            issuer: 'GASNOR',
            fileUrl: 'https://gasnor.idearit.com.ar/instaladores',
            reviewedAt: ACTIVATE ? new Date() : null,
            reviewNote: ACTIVATE
              ? 'Verificado contra padrón público Gasnor / Naturgy NOA (import directorio)'
              : null,
          },
        });
      });

      created++;
      if (created % 50 === 0) {
        process.stdout.write(`\r  Importados: ${created}...`);
      }
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.warn('\n  Error:', email, matricula, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`\n\nImportación Gasnor finalizada:`);
  console.log(`  ✓ Creados:  ${created}`);
  console.log(`  ○ Omitidos: ${skipped}`);
  console.log(`  ✗ Errores:  ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
