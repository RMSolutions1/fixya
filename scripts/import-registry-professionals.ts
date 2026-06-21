#!/usr/bin/env tsx
/**
 * Importa profesionales desde CSV exportado de padrones públicos (Gasnor, COPIME, etc.).
 * Uso: npm run db:import:registry -- data/imports/mi-padron.csv
 */
import { readFileSync } from 'node:fs';
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

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const file = process.argv[2] ?? 'data/imports/registry-professionals.sample.csv';
  const abs = resolve(process.cwd(), file);
  const rows = parseCsv(readFileSync(abs, 'utf8'));
  if (rows.length === 0) {
    console.error('CSV vacío o sin filas de datos:', abs);
    process.exit(1);
  }

  const categories = await prisma.serviceCategory.findMany();
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const category = catBySlug.get(row.categorySlug);
    if (!category) {
      console.warn('Rubro desconocido, omitido:', row.email, row.categorySlug);
      skipped++;
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email: row.email } });
    if (existing) {
      skipped++;
      continue;
    }

    const tenantSlug = slugify(`${row.firstName}-${row.lastName}-${row.registryId}`).slice(0, 80);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: row.email,
          passwordHash,
          firstName: row.firstName,
          lastName: row.lastName,
          phone: row.phone,
          city: row.city,
          province: row.province,
          status: UserStatus.PENDING_VERIFICATION,
          emailVerified: false,
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          slug: tenantSlug,
          name: `${row.firstName} ${row.lastName}`,
          type: TenantType.PROFESIONAL,
          status: TenantStatus.PENDING,
          email: row.email,
          phone: row.phone,
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
          title: `${row.firstName} ${row.lastName} — ${category.name}`,
          slug: `${tenantSlug}-${category.slug}`.slice(0, 250),
          description: `Profesional importado desde padrón ${row.registryId || 'externo'}.`,
          status: ServiceStatus.DRAFT,
          metadata: {
            licenseNumber: row.licenseNumber || null,
            registryId: row.registryId || null,
            importedFrom: 'registry-csv',
            pendingApproval: true,
          },
        },
      });

      if (row.documentNumber) {
        await tx.complianceDocument.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            docType: ComplianceDocType.CUIT_CONSTANCIA,
            status: ComplianceStatus.PENDING_REVIEW,
            documentNumber: row.documentNumber,
            issuer: row.registryId || 'IMPORT',
            fileUrl: 'pending://registry-import',
          },
        });
      }

      if (row.licenseNumber) {
        await tx.complianceDocument.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            docType: ComplianceDocType.MATRICULA,
            status: ComplianceStatus.PENDING_REVIEW,
            documentNumber: row.licenseNumber,
            issuer: row.registryId?.toUpperCase() || 'REGISTRO',
            fileUrl: 'pending://registry-import',
          },
        });
      }
    });

    created++;
    console.log('✓', row.email, row.registryId, row.licenseNumber);
  }

  console.log(`\nImportación finalizada: ${created} creados, ${skipped} omitidos.`);
  console.log('Contraseña demo:', PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
