#!/usr/bin/env node
/**
 * Valida variables mínimas para despliegue en producción.
 * Mercado Pago y Resend son opcionales hasta activar pagos/emails.
 * Uso: npm run check:production-env
 */
const required = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_SECRET',
  'APP_PUBLIC_URL',
  'API_PUBLIC_URL',
  'CORS_ORIGINS',
];

const optionalIntegrations = [
  ['MP_ACCESS_TOKEN', 'Mercado Pago — pagos'],
  ['MP_WEBHOOK_SECRET', 'Mercado Pago — webhooks'],
  ['RESEND_API_KEY', 'Emails transaccionales'],
];

const warnings = [];
const errors = [];

for (const key of required) {
  const v = process.env[key];
  if (!v || !String(v).trim()) errors.push(`Falta ${key}`);
}

for (const [key, label] of optionalIntegrations) {
  const v = process.env[key];
  if (!v || !String(v).trim()) warnings.push(`Pendiente: ${key} (${label})`);
}

const jwt = process.env.JWT_SECRET ?? '';
if (jwt && jwt.length < 32) errors.push('JWT_SECRET debe tener al menos 32 caracteres');

const mp = process.env.MP_ACCESS_TOKEN?.trim() ?? '';
const mpWebhook = process.env.MP_WEBHOOK_SECRET?.trim() ?? '';

if (mp && !mpWebhook) {
  errors.push('MP_WEBHOOK_SECRET es obligatorio cuando MP_ACCESS_TOKEN está configurado');
}

if (mp.startsWith('TEST-')) {
  errors.push('MP_ACCESS_TOKEN de prueba (TEST-) no permitido en producción');
}

if (mp && mp.includes('PLACEHOLDER')) {
  errors.push('MP_ACCESS_TOKEN contiene un placeholder');
}

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
  console.log('\nPENDIENTE (opcional hasta go-live comercial):');
  for (const w of warnings) console.log(`  · ${w}`);
}

if (!errors.length) {
  if (mp && mpWebhook) {
    console.log('\n✓ Core + Mercado Pago listos para producción');
  } else {
    console.log('\n✓ Core de producción OK — directorio operativo sin pagos aún');
    console.log('  Activar MP: MP_ACCESS_TOKEN=... MP_WEBHOOK_SECRET=... npm run mp:enable');
  }
}

process.exit(errors.length ? 1 : 0);
