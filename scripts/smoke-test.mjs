#!/usr/bin/env node
/**
 * Smoke test — requiere API (y opcionalmente web) en ejecución.
 * Uso: node scripts/smoke-test.mjs
 * Env: API_URL, WEB_URL, SMOKE_SKIP_WEB=true
 */
const API = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const WEB = (process.env.WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const CHECK_WEB = process.env.SMOKE_SKIP_WEB !== 'true';

const failures = [];

async function check(name, url, options = {}) {
  const { expectStatus = 200, expectJson } = options;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (res.status !== expectStatus) {
      failures.push(`${name}: HTTP ${res.status} (esperado ${expectStatus}) — ${url}`);
      return null;
    }
    if (expectJson) {
      const data = await res.json();
      if (!expectJson(data)) {
        failures.push(`${name}: respuesta JSON inválida — ${url}`);
      }
      return data;
    }
    return true;
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)} — ${url}`);
    return null;
  }
}

console.log('FixYa smoke test');
console.log(`API: ${API}`);
if (CHECK_WEB) console.log(`WEB: ${WEB}`);

await check('health', `${API}/health`, {
  expectJson: (d) => d.status === 'ok' && d.services?.database === 'up',
});

await check('categories', `${API}/marketplace/categories`, {
  expectJson: (d) => Array.isArray(d) && d.length > 0,
});

await check('stats', `${API}/marketplace/stats`, {
  expectJson: (d) => typeof d.categoriesCount === 'number',
});

await check('professionals', `${API}/marketplace/professionals?limit=1`, {
  expectJson: (d) => d.items !== undefined && Array.isArray(d.items),
});

if (CHECK_WEB) {
  const pages = [
    '/',
    '/nosotros',
    '/para-quienes',
    '/servicios',
    '/profesionales',
    '/faq',
    '/prensa',
    '/terminos',
    '/privacidad',
    '/login',
    '/register',
    '/dashboard',
    '/dashboard/solicitudes',
    '/marketplace',
    '/marketplace/requests/new',
    '/wallet',
    '/favorites',
  ];
  for (const path of pages) {
    await check(`web ${path}`, `${WEB}${path}`, { expectStatus: 200 });
  }
}

if (failures.length > 0) {
  console.error('\nFALLÓ:');
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}

console.log('\nOK — smoke test completado');
