#!/usr/bin/env tsx
/**
 * Importa matriculados COPAIPA (Salta) a FixYa desde JSON generado por scrape-copaipa-padron.mjs
 * Uso: npm run db:import:copaipa
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
import { mapCopaipaProfessionToCategory } from '../shared/copaipa-category-map';

const prisma = new PrismaClient();
const PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';
const args = process.argv.slice(2);
const ACTIVATE = args.includes('--activate');
const INPUT = args.find((a) => !a.startsWith('--')) ?? 'data/imports/copaipa-padron-full.json';

/** Centroide de la ciudad de Salta — coords del padrón provincial COPAIPA */
const SALTA_COORDS = { lat: -24.7821, lng: -65.4232 };
const COVERAGE_RADIUS_KM = 30;

interface CopaipaRecord {
  Matricula: string;
  nombre: string;
  profesion: string;
  otorgado_por?: string;
  email?: string;
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

function parseName(full: string): { firstName: string; lastName: string } {
  const clean = full.replace(/^\*/, '').trim();
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

function matriculaEmail(matricula: string) {
  const slug = slugify(matricula.replace(/[^a-zA-Z0-9-]/g, '-')) || 'sin-matricula';
  return `copaipa-${slug}@padron.fixya.local`;
}

function resolveEmail(raw: string | undefined, matricula: string, used: Set<string>): string {
  let email = (raw ?? '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    email = matriculaEmail(matricula);
  }
  if (used.has(email)) {
    email = matriculaEmail(matricula);
  }
  if (used.has(email)) {
    email = `copaipa-${slugify(matricula)}-${used.size}@padron.fixya.local`;
  }
  used.add(email);
  return email;
}

async function main() {
  const abs = resolve(process.cwd(), INPUT);
  if (!existsSync(abs)) {
    console.error('Archivo no encontrado. Ejecutá primero: npm run scrape:copaipa');
    console.error('Esperado:', abs);
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(abs, 'utf8')) as {
    meta?: Record<string, unknown>;
    records: CopaipaRecord[];
  };
  const records = payload.records ?? [];
  if (records.length === 0) {
    console.error('Sin registros en', abs);
    process.exit(1);
  }

  console.log(`COPAIPA → FixYa: ${records.length} matriculados\n`);
  console.log(`  Modo: ${ACTIVATE ? 'DIRECTORIO ACTIVO (visible en mapa)' : 'pendiente de aprobación'}`);
  if (payload.meta?.scrapedAt) {
    console.log(`  Origen scrapeado: ${payload.meta.scrapedAt}`);
  }

  const categories = await prisma.serviceCategory.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const usedEmails = new Set<string>();

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of records) {
    const matricula = String(row.Matricula ?? '').trim();
    if (!matricula || !row.nombre) {
      skipped++;
      continue;
    }

    const categorySlug = mapCopaipaProfessionToCategory(row.profesion ?? '');
    const category = catBySlug.get(categorySlug);
    if (!category) {
      console.warn('Rubro no encontrado:', categorySlug, row.profesion);
      skipped++;
      continue;
    }

    const email = resolveEmail(row.email, matricula, usedEmails);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      skipped++;
      continue;
    }

    const { firstName, lastName } = parseName(row.nombre);
    const matSlug = matricula.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    const tenantSlug = slugify(`copaipa-${matSlug}-${lastName}-${firstName}`).slice(0, 80);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            city: 'Salta',
            province: 'Salta',
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
            title: `${firstName} ${lastName} — ${category.name}`,
            slug: `${tenantSlug}-${category.slug}`.slice(0, 250),
            description: `Matriculado COPAIPA (${row.profesion}). Importado desde padrón público provincial de Salta.`,
            status: ACTIVATE ? ServiceStatus.ACTIVE : ServiceStatus.DRAFT,
            latitude: SALTA_COORDS.lat,
            longitude: SALTA_COORDS.lng,
            coverageRadiusKm: COVERAGE_RADIUS_KM,
            metadata: {
              licenseNumber: matricula,
              registryId: 'copaipa',
              copaipaProfession: row.profesion,
              grantedBy: row.otorgado_por ?? null,
              sourceEmail: row.email || null,
              importedFrom: 'copaipa-padron',
              directoryListing: true,
              pendingApproval: !ACTIVATE,
              province: 'Salta',
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
            issuer: 'COPAIPA',
            fileUrl: 'https://padrones.copaipa.org.ar/padron',
            reviewedAt: ACTIVATE ? new Date() : null,
            reviewNote: ACTIVATE ? 'Verificado contra padrón público COPAIPA (import directorio)' : null,
          },
        });
      });

      created++;
      if (created % 100 === 0) {
        process.stdout.write(`\r  Importados: ${created}...`);
      }
    } catch (err) {
      errors++;
      if (errors <= 5) {
        console.warn('\n  Error:', email, matricula, err instanceof Error ? err.message : err);
      }
    }
  }

  console.log(`\n\nImportación COPAIPA finalizada:`);
  console.log(`  ✓ Creados:  ${created}`);
  console.log(`  ○ Omitidos: ${skipped}`);
  console.log(`  ✗ Errores:  ${errors}`);
  console.log(`  Contraseña demo (cuentas sintéticas): ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
