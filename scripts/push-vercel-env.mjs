#!/usr/bin/env node
/**
 * Sube variables de entorno a Vercel (production).
 * Lee apps/web/.env.local + .env raíz — no commitea secretos.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { randomBytes } from 'crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const webEnv = parseEnv(readFileSync(join(root, 'apps/web/.env.local'), 'utf8'));
const rootEnv = existsSync(join(root, '.env'))
  ? parseEnv(readFileSync(join(root, '.env'), 'utf8'))
  : {};

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

const jwt =
  process.env.JWT_SECRET ||
  rootEnv.JWT_SECRET ||
  webEnv.JWT_SECRET ||
  randomBytes(48).toString('base64url');

const dbUrl = webEnv.POSTGRES_PRISMA_URL || webEnv.DATABASE_URL || rootEnv.DATABASE_URL;
const directUrl = webEnv.DIRECT_URL || webEnv.DATABASE_URL_UNPOOLED || rootEnv.DIRECT_URL;

const vars = {
  NODE_ENV: 'production',
  NEXT_PUBLIC_SITE_URL: 'https://fixya.emprenor.com',
  NEXT_PUBLIC_API_URL: '',
  NEXT_PUBLIC_ENABLE_SANDBOX_PAYMENTS: 'false',
  NEXT_PUBLIC_SUPABASE_URL: webEnv.NEXT_PUBLIC_SUPABASE_URL || rootEnv.SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: webEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  JWT_SECRET: jwt,
  DATABASE_URL: dbUrl,
  DIRECT_URL: directUrl,
  APP_PUBLIC_URL: 'https://fixya.emprenor.com',
  // Base sin /api/v1 — el backend agrega el prefijo al armar notification_url de MP.
  API_PUBLIC_URL: 'https://fixya.emprenor.com',
  CORS_ORIGINS: 'https://fixya.emprenor.com,https://fixya-dun.vercel.app',
  ENABLE_SWAGGER: 'false',
  ENABLE_SANDBOX_PAYMENTS: 'false',
  MP_SANDBOX: 'false',
  MP_ACCESS_TOKEN:
    process.env.MP_ACCESS_TOKEN || rootEnv.MP_ACCESS_TOKEN || webEnv.MP_ACCESS_TOKEN || '',
  MP_WEBHOOK_SECRET:
    process.env.MP_WEBHOOK_SECRET || rootEnv.MP_WEBHOOK_SECRET || webEnv.MP_WEBHOOK_SECRET || '',
  RESEND_API_KEY:
    process.env.RESEND_API_KEY || rootEnv.RESEND_API_KEY || webEnv.RESEND_API_KEY || '',
  API_PREFIX: 'v1',
  SEED_DEMO_DATA: 'false',
};

const OPTIONAL_INTEGRATIONS = ['MP_ACCESS_TOKEN', 'MP_WEBHOOK_SECRET', 'RESEND_API_KEY'];

for (const key of OPTIONAL_INTEGRATIONS) {
  if (!vars[key]) {
    console.warn(
      `⚠ ${key} no configurado — omitido en Vercel (directorio OK; activar con npm run mp:enable cuando tengas credenciales).`,
    );
  }
}

for (const [key, value] of Object.entries(vars)) {
  if (value === undefined || value === null) continue;
  if (!value && key !== 'NEXT_PUBLIC_API_URL' && !key.startsWith('NEXT_PUBLIC_SUPABASE')) {
    if (OPTIONAL_INTEGRATIONS.includes(key)) continue;
    continue;
  }
  try {
    execSync(`npx vercel env rm ${key} production --yes`, { cwd: root, stdio: 'pipe' });
  } catch {
    /* no existía */
  }
  execSync(`npx vercel env add ${key} production`, {
    cwd: root,
    input: value,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  console.log(`✓ ${key}`);
}

console.log('\nJWT_SECRET (guardá en gestor de secretos):', jwt);
