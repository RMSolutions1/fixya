#!/usr/bin/env node
/**
 * Activa Resend en Vercel (production).
 *
 * Uso:
 *   RESEND_API_KEY=re_... npm run resend:enable
 *   npm run resend:enable -- --check
 *
 * Requisito previo: dominio fixya.emprenor.com.ar verificado en Resend
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
  for (const file of ['.env', '.env.vercel.prod.tmp', 'apps/web/.env.local']) {
    const path = join(root, file);
    if (existsSync(path)) Object.assign(merged, parseEnv(readFileSync(path, 'utf8')));
  }
  return merged;
}

const fileEnv = loadEnvFiles();
const apiKey = (process.env.RESEND_API_KEY || fileEnv.RESEND_API_KEY || '').trim();
const testTo = (process.env.RESEND_TEST_TO || fileEnv.RESEND_TEST_TO || process.env.ADMIN_EMAIL || '').trim();
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || fileEnv.RESEND_FROM_EMAIL || 'info@fixya.emprenor.com.ar';
const FROM_NAME = process.env.RESEND_FROM_NAME || fileEnv.RESEND_FROM_NAME || 'FixYa';
const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;

function validate() {
  const errors = [];
  const warnings = [];

  if (!apiKey) errors.push('Falta RESEND_API_KEY');
  else if (apiKey.includes('XXXXXXXX') || apiKey.includes('PLACEHOLDER')) {
    errors.push('RESEND_API_KEY parece un placeholder');
  } else if (!apiKey.startsWith('re_')) {
    warnings.push('RESEND_API_KEY debería empezar con re_');
  }

  return { errors, warnings };
}

const { errors, warnings } = validate();

console.log('FixYa — Resend (emails transaccionales)\n');
console.log(`Remitente: ${FROM_ADDRESS}`);
console.log('Dominio requerido: fixya.emprenor.com.ar (verificado en resend.com/domains)\n');

if (warnings.length) {
  console.log('Advertencias:');
  for (const w of warnings) console.log(`  ! ${w}`);
  console.log('');
}

if (errors.length) {
  console.log('Errores:');
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log('\n1. Creá cuenta en https://resend.com');
  console.log('2. Verificá el dominio fixya.emprenor.com.ar (registros DNS en Vercel)');
  console.log('3. Copiá la API Key y ejecutá:');
  console.log('   RESEND_API_KEY=re_... npm run resend:enable');
  process.exit(1);
}

async function testSend() {
  if (!testTo) {
    console.log('(Omitiendo email de prueba — definí RESEND_TEST_TO o ADMIN_EMAIL)');
    return true;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [testTo],
      subject: 'FixYa — prueba de email transaccional',
      html: `<p>Email de prueba desde FixYa (${new Date().toISOString()}).</p><p>Si recibís esto, Resend está operativo en producción.</p>`,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('✗ Envío de prueba falló:', JSON.stringify(data));
    return false;
  }
  console.log(`✓ Email de prueba enviado a ${testTo} (id: ${data.id ?? '—'})`);
  return true;
}

if (checkOnly) {
  console.log('✓ RESEND_API_KEY presente');
  process.exit(0);
}

const ok = await testSend();
if (!ok) process.exit(1);

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
  ['RESEND_API_KEY', apiKey],
  ['RESEND_FROM_EMAIL', FROM_EMAIL],
  ['RESEND_FROM_NAME', FROM_NAME],
]) {
  pushEnv(key, value);
}

console.log('\n✓ Resend configurado en Vercel.');
console.log('Próximos pasos:');
console.log('  1. npx vercel --prod');
console.log('  2. curl https://fixya.emprenor.com/api/v1/health  → integrations.email.configured: true');
