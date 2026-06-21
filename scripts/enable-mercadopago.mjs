#!/usr/bin/env node
/**
 * Activa Mercado Pago en Vercel (production).
 *
 * Uso:
 *   MP_ACCESS_TOKEN=APP_USR-... MP_WEBHOOK_SECRET=... npm run mp:enable
 *   npm run mp:enable -- --check
 *
 * Lee también .env / apps/web/.env.local si las variables no están en el entorno.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

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

function loadEnvFiles() {
  const merged = {};
  if (existsSync(join(root, '.env'))) {
    Object.assign(merged, parseEnv(readFileSync(join(root, '.env'), 'utf8')));
  }
  if (existsSync(join(root, 'apps/web/.env.local'))) {
    Object.assign(merged, parseEnv(readFileSync(join(root, 'apps/web/.env.local'), 'utf8')));
  }
  return merged;
}

const fileEnv = loadEnvFiles();
const token = (process.env.MP_ACCESS_TOKEN || fileEnv.MP_ACCESS_TOKEN || '').trim();
const secret = (process.env.MP_WEBHOOK_SECRET || fileEnv.MP_WEBHOOK_SECRET || '').trim();
const appUrl = (
  process.env.APP_PUBLIC_URL ||
  fileEnv.APP_PUBLIC_URL ||
  'https://fixya.emprenor.com'
).replace(/\/+$/, '');
const webhookUrl = `${appUrl}/api/v1/webhooks/mercadopago`;

function validate() {
  const errors = [];
  const warnings = [];

  if (!token) errors.push('Falta MP_ACCESS_TOKEN');
  else if (token.includes('PLACEHOLDER') || token.includes('CONFIGURE') || token.includes('XXXXXXXX')) {
    errors.push('MP_ACCESS_TOKEN parece un placeholder');
  } else if (!token.startsWith('APP_USR-')) {
    warnings.push('MP_ACCESS_TOKEN debería empezar con APP_USR- en producción');
  }

  if (!secret) errors.push('Falta MP_WEBHOOK_SECRET');
  else if (secret.length < 8) errors.push('MP_WEBHOOK_SECRET demasiado corto');

  return { errors, warnings };
}

const { errors, warnings } = validate();

console.log('FixYa — Mercado Pago\n');
console.log(`Webhook URL (registrar en panel MP): ${webhookUrl}\n`);

if (warnings.length) {
  console.log('Advertencias:');
  for (const w of warnings) console.log(`  ! ${w}`);
  console.log('');
}

if (errors.length) {
  console.log('Errores:');
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log('\nConfigurá las variables en .env y volvé a ejecutar, o:');
  console.log('  MP_ACCESS_TOKEN=APP_USR-... MP_WEBHOOK_SECRET=... npm run mp:enable');
  process.exit(1);
}

if (checkOnly) {
  console.log('✓ Credenciales de Mercado Pago presentes y válidas para producción');
  process.exit(0);
}

function pushEnv(key, value) {
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
  console.log(`✓ ${key} subido a Vercel (production)`);
}

for (const [key, value] of [
  ['MP_ACCESS_TOKEN', token],
  ['MP_WEBHOOK_SECRET', secret],
  ['MP_SANDBOX', 'false'],
  ['ENABLE_SANDBOX_PAYMENTS', 'false'],
]) {
  pushEnv(key, value);
}

console.log('\n✓ Mercado Pago configurado en Vercel.');
console.log('Próximos pasos:');
console.log('  1. Verificá el webhook en developers.mercadopago.com con la URL de arriba');
console.log('  2. npx vercel --prod   (o esperá el deploy automático desde main)');
console.log('  3. curl https://fixya.emprenor.com/api/v1/marketplace/integrations');
