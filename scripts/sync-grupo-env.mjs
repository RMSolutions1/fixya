#!/usr/bin/env node
/**
 * Sincroniza credenciales Supabase de apps/web/.env.local → .env (raíz)
 * Uso: node scripts/sync-grupo-env.mjs
 * Requiere SUPABASE_DB_PASSWORD en apps/web/.env.local o como variable de entorno.
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
const supabaseUrl =
  web.VITE_SUPABASE_URL || web.NEXT_PUBLIC_SUPABASE_URL || web.SUPABASE_URL || '';
const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!ref) {
  console.error('No se encontró VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL en .env.local');
  process.exit(1);
}

const dbPassword = web.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
const region = web.SUPABASE_REGION || process.env.SUPABASE_REGION || 'us-east-2';
const poolerPrefix = web.SUPABASE_POOLER_PREFIX || process.env.SUPABASE_POOLER_PREFIX || 'aws-1';
const poolerHost = `${poolerPrefix}-${region}.pooler.supabase.com`;

let poolerUrl = web.DATABASE_URL || process.env.DATABASE_URL;
let directUrl = web.DIRECT_URL || process.env.DIRECT_URL;

if (!poolerUrl || !directUrl) {
  if (!dbPassword) {
    console.error(
      'Falta SUPABASE_DB_PASSWORD en apps/web/.env.local\n' +
        '  Supabase → Settings → Database → Database password\n' +
        '  O pegá DATABASE_URL y DIRECT_URL completos desde el dashboard.',
    );
    process.exit(1);
  }
  poolerUrl =
    poolerUrl ||
    `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@${poolerHost}:6543/postgres?pgbouncer=true`;
  directUrl =
    directUrl ||
    `postgresql://postgres.${ref}:${encodeURIComponent(dbPassword)}@${poolerHost}:5432/postgres`;
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
rootEnv = setVar(rootEnv, 'SUPABASE_URL', supabaseUrl);
if (web.SUPABASE_SERVICE_ROLE_KEY) {
  rootEnv = setVar(rootEnv, 'SUPABASE_SERVICE_ROLE_KEY', web.SUPABASE_SERVICE_ROLE_KEY);
}

writeFileSync(rootEnvPath, rootEnv);
console.log('✓ .env actualizado con Supabase Grupo Emprenor (ref:', ref + ')');
