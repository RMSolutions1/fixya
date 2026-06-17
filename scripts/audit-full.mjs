#!/usr/bin/env node
/**
 * Auditoría E2E exhaustiva — rutas, redirects, APIs, links, flujos.
 * Requiere: API + Web + usuarios (npm run db:seed:users)
 */
const API = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const WEB = (process.env.WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';

const failures = [];
const warnings = [];
const passes = [];

function pass(name) {
  passes.push(name);
}

function fail(name, detail) {
  failures.push(`${name}: ${detail}`);
}

function warn(name, detail) {
  warnings.push(`${name}: ${detail}`);
}

async function fetchOk(name, url, opts = {}) {
  const { expectStatus = 200, expectStatuses, method = 'GET', headers = {}, body } = opts;
  const allowed = expectStatuses ?? [expectStatus];
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      redirect: opts.followRedirect === false ? 'manual' : 'follow',
    });
    if (opts.followRedirect === false) {
      if (!allowed.includes(res.status)) {
        fail(name, `HTTP ${res.status} (esperado ${allowed.join('|')}) — ${url}`);
        return null;
      }
      return res;
    }
    if (!allowed.includes(res.status)) {
      fail(name, `HTTP ${res.status} (esperado ${allowed.join('|')}) — ${url}`);
      return null;
    }
    pass(name);
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('json')) return res.json();
    return res.text();
  } catch (err) {
    fail(name, `${err instanceof Error ? err.message : String(err)} — ${url}`);
    return null;
  }
}

async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  return data;
}

console.log('═══════════════════════════════════════════');
console.log('  FixYa — Auditoría E2E exhaustiva');
console.log('═══════════════════════════════════════════\n');

// ─── 1. Rutas web estáticas ─────────────────────────────────────────
const WEB_ROUTES = [
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
  '/register?role=PROFESIONAL',
  '/register?role=CLIENTE',
  '/register?role=EMPRESA',
  '/dashboard',
  '/dashboard/solicitudes',
  '/marketplace',
  '/marketplace/requests/new',
  '/wallet',
  '/favorites',
];

console.log('▸ Rutas web');
for (const path of WEB_ROUTES) {
  await fetchOk(`web ${path}`, `${WEB}${path}`);
}

// ─── 2. Redirects ─────────────────────────────────────────────────────
console.log('\n▸ Redirects');
const REDIRECTS = [
  { from: '/registro', to: '/register' },
  { from: '/ingresar', to: '/login' },
  { from: '/mis-solicitudes', to: '/dashboard/solicitudes' },
];
for (const { from, to } of REDIRECTS) {
  const res = await fetchOk(`redirect ${from}`, `${WEB}${from}`, {
    followRedirect: false,
    expectStatus: 308,
  });
  if (res) {
    const loc = res.headers.get('location') ?? '';
    if (!loc.includes(to)) {
      fail(`redirect ${from}`, `location=${loc} (esperado contiene ${to})`);
    } else {
      pass(`redirect ${from} → ${to}`);
    }
  }
}

// ─── 3. Links internos en HTML ────────────────────────────────────────
console.log('\n▸ Links en HTML (muestra principal)');
const homeHtml = await fetchOk('html /', `${WEB}/`);
if (typeof homeHtml === 'string') {
  const hrefs = [...homeHtml.matchAll(/href="(\/[^"#?]*[^"]*)"/g)].map((m) => m[1]);
  const unique = [...new Set(hrefs)].filter((h) => h.startsWith('/') && !h.startsWith('//'));
  for (const href of unique.slice(0, 40)) {
    await fetchOk(`link ${href}`, `${WEB}${href}`);
  }
}

// ─── 4. Contenido básico ──────────────────────────────────────────────
console.log('\n▸ Validación de contenido');
const CONTENT_PAGES = ['/', '/nosotros', '/terminos', '/privacidad', '/faq'];
for (const path of CONTENT_PAGES) {
  const html = await fetch(`${WEB}${path}`).then((r) => r.text()).catch(() => '');
  if (!html.includes('FixYa') && !html.includes('Fix Ya')) {
    fail(`content ${path}`, 'no contiene marca FixYa');
  } else {
    pass(`content ${path} marca`);
  }
  if (/lorem ipsum|\bFIXME\b|(?:^|\s)TODO:|@todo\b/i.test(html)) {
    warn(`content ${path}`, 'posible placeholder en HTML');
  }
  // "undefined" en bundles JS de Next es falso positivo — omitir
  if (html.includes('Av. Casiano Casas') || html.includes('387 352')) {
    pass(`content ${path} contacto`);
  }
}

// ─── 5. API pública ───────────────────────────────────────────────────
console.log('\n▸ API pública');
await fetchOk('api health', `${API}/health`);
const categories = await fetchOk('api categories', `${API}/marketplace/categories`);
await fetchOk('api stats', `${API}/marketplace/stats`);
await fetchOk('api ranking', `${API}/marketplace/services/ranking?limit=5`);
await fetchOk('api services', `${API}/marketplace/services?limit=5`);
const pros = await fetchOk('api professionals', `${API}/marketplace/professionals?limit=5`);

if (categories?.[0]?.id) {
  pass('api categories non-empty');
} else {
  fail('api categories', 'vacío');
}

// Profesional detalle dinámico
if (pros?.items?.[0]?.id) {
  const proId = pros.items[0].id;
  await fetchOk(`api professional ${proId}`, `${API}/marketplace/professionals/${proId}`);
  await fetchOk(`web profesional/${proId}`, `${WEB}/profesionales/${proId}`);
  if (pros.items[0].services?.[0]?.id) {
    await fetchOk(`api service`, `${API}/marketplace/services/${pros.items[0].services[0].id}`);
  }
}

// ─── 6. Auth + roles ──────────────────────────────────────────────────
console.log('\n▸ API autenticada (9 roles)');
const USERS = [
  'admin@fixya.test',
  'cliente@fixya.test',
  'profesional@fixya.test',
  'empresa@fixya.test',
  'contador@fixya.test',
  'supervisor@fixya.test',
  'operador@fixya.test',
  'auditor@fixya.test',
  'gestor@fixya.test',
];

let clientToken;
let proToken;
let requestId;
let quotationId;
let engagementId;

for (const email of USERS) {
  const session = await login(email);
  if (!session?.accessToken) {
    fail(`login ${email}`, 'falló');
    continue;
  }
  pass(`login ${email}`);
  const token = session.accessToken;
  const h = { Authorization: `Bearer ${token}` };

  const me = await fetch(`${API}/auth/me`, { headers: h }).then((r) => r.json());
  if (me?.email === email) pass(`me ${email}`);
  else fail(`me ${email}`, 'email no coincide');

  await fetchOk(`requests ${email}`, `${API}/marketplace/requests`, {
    headers: { ...h, 'Content-Type': 'application/json' },
  });

  if (email === 'cliente@fixya.test') {
    clientToken = token;
    const w = await fetch(`${API}/wallet/balance`, { headers: h });
    if (w.ok) pass('wallet CLIENTE');
    else fail('wallet CLIENTE', w.status);

    if (categories?.[0]?.id) {
      const created = await fetch(`${API}/marketplace/requests`, {
        method: 'POST',
        headers: { ...h, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: categories[0].id,
          title: `Audit ${Date.now()}`,
          description: 'Solicitud auditoría E2E',
          city: 'Salta',
          province: 'Salta',
        }),
      });
      const req = await created.json();
      if (created.ok && req.id) {
        requestId = req.id;
        pass('create request');
        await fetchOk('publish request', `${API}/marketplace/requests/${req.id}/publish`, {
          method: 'POST',
          headers: h,
          body: {},
          expectStatuses: [200, 201],
        });
        await fetchOk('request detail', `${API}/marketplace/requests/${req.id}`, { headers: h });
      } else {
        fail('create request', created.status);
      }
    }
  }

  if (email === 'profesional@fixya.test') proToken = token;

  if (email === 'gestor@fixya.test') {
    const w = await fetch(`${API}/wallet/balance`, { headers: h });
    if (w.status === 403) pass('wallet GESTOR denied');
    else warn('wallet GESTOR', `status ${w.status}`);
  }
}

// ─── 7. Flujo negocio completo ────────────────────────────────────────
console.log('\n▸ Flujo negocio E2E');
if (proToken && requestId) {
  const quote = await fetch(`${API}/marketplace/quotations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${proToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceRequestId: requestId,
      totalAmount: 12000,
      estimatedDays: 2,
      items: [{ description: 'Servicio audit', quantity: 1, unitPrice: 12000 }],
    }),
  });
  const q = await quote.json();
  if (quote.ok && q.id) {
    quotationId = q.id;
    pass('submit quotation');
    await fetchOk('compare', `${API}/marketplace/requests/${requestId}/compare`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
  } else {
    fail('submit quotation', quote.status);
  }
}

if (clientToken && quotationId) {
  const eng = await fetch(`${API}/engagements/accept-quotation/${quotationId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const e = await eng.json();
  if (eng.ok && e.id) {
    engagementId = e.id;
    pass('accept quotation');
    await fetchOk('expediente', `${API}/engagements/${e.id}/expediente`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    await fetchOk(`web engagement/${e.id}`, `${WEB}/engagements/${e.id}`);
    await fetchOk(`web request/${requestId}`, `${WEB}/marketplace/requests/${requestId}`);
  } else {
    fail('accept quotation', eng.status);
  }
}

// ─── Resumen ──────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════');
console.log(`  OK:       ${passes.length}`);
console.log(`  Warnings: ${warnings.length}`);
console.log(`  FAIL:     ${failures.length}`);
console.log('═══════════════════════════════════════════');

if (warnings.length) {
  console.log('\nAdvertencias:');
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}

if (failures.length) {
  console.error('\nFallos:');
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}

console.log('\n✓ Auditoría E2E completada sin fallos críticos');
