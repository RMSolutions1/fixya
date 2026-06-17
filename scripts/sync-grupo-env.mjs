#!/usr/bin/env node
/**
 * Sincroniza DATABASE_URL / DIRECT_URL de apps/web/.env.local → .env (raíz)
 * Soporta Neon (Vercel) o Supabase (legacy).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const webEnvPath = join(root, 'apps/web/.env.local');
const rootEnvPath = join(root, '.env');

function parseEnv(content) {
  const vars = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

if (!existsSync(webEnvPath)) {
  console.error('No existe apps/web/.env.local');
  process.exit(1);
}

const web = parseEnv(readFileSync(webEnvPath, 'utf8'));

let poolerUrl =
  web.POSTGRES_PRISMA_URL ||
  web.DATABASE_URL ||
  web.POSTGRES_URL ||
  process.env.DATABASE_URL;
let directUrl =
  web.DIRECT_URL ||
  web.DATABASE_URL_UNPOOLED ||
  web.POSTGRES_URL_NON_POOLING ||
  process.env.DIRECT_URL;

// Legacy Supabase
if (!poolerUrl || !directUrl) {
  const supabaseUrl =
    web.VITE_SUPABASE_URL || web.NEXT_PUBLIC_SUPABASE_URL || web.SUPABASE_URL || '';
  const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const dbPassword = web.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
  const region = web.SUPABASE_REGION || 'us-east-2';
  const poolerPrefix = web.SUPABASE_POOLER_PREFIX || 'aws-1';
  const poolerHost = `${poolerPrefix}-${region}.pooler.supabase.com`;

  if (ref && dbPassword) {
    poolerUrl =
      poolerUrl ||
      `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@${poolerHost}:6543/postgres?pgbouncer=true`;
    directUrl =
      directUrl ||
      `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@${poolerHost}:5432/postgres`;
  }
}

if (!poolerUrl || !directUrl) {
  console.error(
    'Falta DATABASE_URL y DIRECT_URL en apps/web/.env.local (Neon o Supabase).',
  );
  process.exit(1);
}

let rootEnv = existsSync(rootEnvPath) ? readFileSync(rootEnvPath, 'utf8') : '';

function setVar(content, key, value) {
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(content)) return content.replace(re, line);
  return content.trimEnd() + `\n${line}\n`;
}

rootEnv = setVar(rootEnv, 'DATABASE_URL', poolerUrl);
rootEnv = setVar(rootEnv, 'DIRECT_URL', directUrl);

const supabaseUrl = web.NEXT_PUBLIC_SUPABASE_URL || web.SUPABASE_URL;
if (supabaseUrl) rootEnv = setVar(rootEnv, 'SUPABASE_URL', supabaseUrl);
if (web.SUPABASE_SERVICE_ROLE_KEY) {
  rootEnv = setVar(rootEnv, 'SUPABASE_SERVICE_ROLE_KEY', web.SUPABASE_SERVICE_ROLE_KEY);
}

writeFileSync(rootEnvPath, rootEnv);
const host = poolerUrl.match(/@([^/]+)/)?.[1] ?? 'postgres';
console.log('✓ .env actualizado →', host);
