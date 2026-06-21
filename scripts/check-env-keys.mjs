#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

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

const web = parseEnv(readFileSync(join(root, 'apps/web/.env.local'), 'utf8'));
const rootEnv = existsSync(join(root, '.env')) ? parseEnv(readFileSync(join(root, '.env'), 'utf8')) : {};

const keys = [
  'DATABASE_URL',
  'DIRECT_URL',
  'POSTGRES_PRISMA_URL',
  'JWT_SECRET',
  'MP_ACCESS_TOKEN',
  'MP_WEBHOOK_SECRET',
  'RESEND_API_KEY',
];

console.log('FixYa — env keys (local)\n');

for (const k of keys) {
  const v = web[k] || rootEnv[k];
  const ok = v && v.length > 3 && !v.includes('CAMBIAR') && !v.includes('XXXXXXXX');
  const optional = ['MP_ACCESS_TOKEN', 'MP_WEBHOOK_SECRET', 'RESEND_API_KEY'].includes(k);
  const label = optional && !ok ? 'PENDING' : ok ? 'OK' : 'MISSING';
  console.log(`${label.padEnd(8)} ${k}${optional && !ok ? ' (opcional — npm run mp:enable)' : ''}`);
}
