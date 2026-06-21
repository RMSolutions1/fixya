#!/usr/bin/env node
/**
 * Valida variables mínimas para despliegue en producción.
 * Uso: npm run check:production-env
 */
const required = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'APP_PUBLIC_URL',
  'API_PUBLIC_URL',
  'RESEND_API_KEY',
  'CORS_ORIGINS',
];

const mpRequired = ['MP_ACCESS_TOKEN', 'MP_WEBHOOK_SECRET'];

const warnings = [];
const errors = [];

for (const key of required) {
  const v = process.env[key];
  if (!v || !String(v).trim()) errors.push(`Falta ${key}`);
}

for (const key of mpRequired) {
  const v = process.env[key];
  if (!v || !String(v).trim()) warnings.push(`Falta ${key} (pagos)`);
}

const jwt = process.env.JWT_SECRET ?? '';
if (jwt && jwt.length < 32) errors.push('JWT_SECRET debe tener al menos 32 caracteres');

const mp = process.env.MP_ACCESS_TOKEN ?? '';
if (mp.startsWith('TEST-')) warnings.push('MP_ACCESS_TOKEN es de prueba (TEST-) — usar APP_USR- en producción');

if (process.env.ENABLE_SANDBOX_PAYMENTS === 'true') {
  warnings.push('ENABLE_SANDBOX_PAYMENTS=true — desactivar en producción');
}

if (process.env.NODE_ENV !== 'production') {
  warnings.push('NODE_ENV no es "production"');
}

console.log('FixYa — check production env\n');

if (errors.length) {
  console.log('ERRORES:');
  for (const e of errors) console.log(`  ✗ ${e}`);
}

if (warnings.length) {
  console.log('\nADVERTENCIAS:');
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (!errors.length && !warnings.length) {
  console.log('✓ Variables de producción OK');
}

process.exit(errors.length ? 1 : 0);
