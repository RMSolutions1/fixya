/**
 * Crea o actualiza el administrador de producción (SUPER_ADMIN).
 * Requiere ADMIN_EMAIL y ADMIN_PASSWORD en el entorno.
 *
 * Uso:
 *   ADMIN_EMAIL=admin@fixya.com.ar ADMIN_PASSWORD="..." npm run db:seed:admin
 */
import { PrismaClient, MemberRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error('Definí ADMIN_EMAIL y ADMIN_PASSWORD');
  }
  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres');
  }

  const platform = await prisma.tenant.findFirst({
    where: { slug: 'fixya-platform', deletedAt: null },
  });
  if (!platform) {
    throw new Error('No existe tenant fixya-platform — ejecutá npm run db:seed primero');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      status: 'ACTIVE',
      emailVerified: true,
      firstName: process.env.ADMIN_FIRST_NAME ?? 'Administrador',
      lastName: process.env.ADMIN_LAST_NAME ?? 'FixYa',
      deletedAt: null,
    },
    create: {
      email,
      passwordHash,
      firstName: process.env.ADMIN_FIRST_NAME ?? 'Administrador',
      lastName: process.env.ADMIN_LAST_NAME ?? 'FixYa',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: platform.id, userId: admin.id } },
    update: { role: MemberRole.SUPER_ADMIN, isActive: true, isDefault: true },
    create: {
      tenantId: platform.id,
      userId: admin.id,
      role: MemberRole.SUPER_ADMIN,
      isDefault: true,
      isActive: true,
    },
  });

  const credPath = join(root, '.admin-credentials.local');
  const lines = [
    `# FixYa — administrador de producción (${new Date().toISOString().slice(0, 10)})`,
    `# NO commitear este archivo`,
    `ADMIN_EMAIL=${email}`,
    `ADMIN_PASSWORD=${password}`,
    `URL=https://fixya.emprenor.com/login`,
  ].join('\n');
  writeFileSync(credPath, `${lines}\n`, 'utf8');

  console.log(`✓ Admin SUPER_ADMIN: ${email}`);
  console.log(`✓ Credenciales guardadas en .admin-credentials.local (gitignored)`);
}

main()
  .catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
