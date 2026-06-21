#!/usr/bin/env node
/**
 * Contratación piloto E2E — solicitud → presupuesto → contratación → pago → liberación.
 *
 * Modos:
 *   API local + sandbox (recomendado sin MP):
 *     ENABLE_SANDBOX_PAYMENTS=true npm run api:dev
 *     npm run pilot:e2e
 *
 *   Producción (sin MP — confirma pago vía DB):
 *     API_URL=https://fixya.emprenor.com/api/v1 PILOT_CONFIRM_PAYMENT=1 npm run pilot:e2e
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const isProdApi = API.includes('fixya.emprenor.com');
const confirmPilotPayment = process.env.PILOT_CONFIRM_PAYMENT === '1';

const CLIENT_EMAIL = process.env.PILOT_CLIENT_EMAIL ?? 'piloto.cliente@fixya.com.ar';
const PRO_EMAIL = process.env.PILOT_PRO_EMAIL ?? 'piloto.profesional@fixya.com.ar';

function loadPilotPassword() {
  if (process.env.PILOT_PASSWORD) return process.env.PILOT_PASSWORD;
  const credPath = join(root, '.pilot-credentials.local');
  if (existsSync(credPath)) {
    for (const line of readFileSync(credPath, 'utf8').split('\n')) {
      const m = line.match(/^PILOT_PASSWORD=(.+)$/);
      if (m) return m[1].trim();
    }
  }
  throw new Error('Definí PILOT_PASSWORD o ejecutá npm run db:seed:pilot');
}

const PASS = loadPilotPassword();
const stamp = Date.now();
const failures = [];
const ok = [];

async function req(name, method, path, body, token, tenantId) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { res, data, name };
  } catch (err) {
    failures.push(`${name}: ${err.message}`);
    return { res: { ok: false, status: 0 }, data: {}, name };
  }
}

function expect(name, cond, detail = '') {
  if (cond) ok.push(name);
  else failures.push(`${name} ${detail}`);
}

console.log('FixYa — Contratación piloto E2E\n');
console.log(`API: ${API}`);
console.log(`Cliente: ${CLIENT_EMAIL}`);
console.log(`Profesional: ${PRO_EMAIL}\n`);

// ── Login ───────────────────────────────────────────────────────────
const clientLogin = await req('login-cliente', 'POST', '/auth/login', {
  email: CLIENT_EMAIL,
  password: PASS,
});
const proLogin = await req('login-pro', 'POST', '/auth/login', {
  email: PRO_EMAIL,
  password: PASS,
});

const clientToken = clientLogin.data.accessToken;
const proToken = proLogin.data.accessToken;
const clientTenant = clientLogin.data.tenantId;
const proTenant = proLogin.data.tenantId;

expect('login cliente piloto', !!clientToken, JSON.stringify(clientLogin.data).slice(0, 120));
expect('login profesional piloto', !!proToken, JSON.stringify(proLogin.data).slice(0, 120));

if (!clientToken || !proToken) {
  console.error('\n✗ Login falló — ejecutá: PILOT_SEED_CONFIRM=1 npm run db:seed:pilot');
  process.exit(1);
}

// ── Solicitud → presupuesto → contratación ──────────────────────────
const cats = await req('categorias', 'GET', '/marketplace/categories');
const plomeria = (cats.data || []).find((c) => c.slug === 'plomeria') ?? cats.data?.[0];
expect('categoría plomería', !!plomeria?.id);

const created = await req(
  'crear-solicitud',
  'POST',
  '/marketplace/requests',
  {
    categoryId: plomeria.id,
    title: `Piloto E2E ${stamp}`,
    description: 'Contratación piloto FixYa — validación operativa end-to-end',
    city: 'Salta',
    province: 'Salta',
    address: 'Av. Casiano Casas 3080',
  },
  clientToken,
  clientTenant,
);
expect('crear solicitud', !!created.data.id, JSON.stringify(created.data).slice(0, 120));

let engagementId = null;

if (created.data.id) {
  await req(
    'publicar',
    'POST',
    `/marketplace/requests/${created.data.id}/publish`,
    {},
    clientToken,
    clientTenant,
  );

  const quote = await req(
    'presupuesto',
    'POST',
    '/marketplace/quotations',
    {
      serviceRequestId: created.data.id,
      totalAmount: 18500,
      estimatedDays: 1,
      items: [{ description: 'Reparación de pérdida — piloto E2E', quantity: 1, unitPrice: 18500 }],
    },
    proToken,
    proTenant,
  );
  expect('presupuesto profesional', !!quote.data.id, JSON.stringify(quote.data).slice(0, 120));

  if (quote.data.id) {
    const eng = await req(
      'aceptar-presupuesto',
      'POST',
      `/engagements/accept-quotation/${quote.data.id}`,
      {},
      clientToken,
      clientTenant,
    );
    engagementId = eng.data.id ?? eng.data.engagementId;
    expect('contratación creada', !!engagementId, JSON.stringify(eng.data).slice(0, 120));
  }
}

// ── Pago ────────────────────────────────────────────────────────────
let paymentId = null;

if (engagementId) {
  const checkout = await req(
    'checkout',
    'POST',
    `/payments/engagements/${engagementId}/checkout`,
    {},
    clientToken,
    clientTenant,
  );

  const paymentsBlocked =
    checkout.data?.code === 'PAYMENTS_NOT_CONFIGURED' || checkout.res.status === 503;

  if (checkout.res.ok && checkout.data.paymentId) {
    paymentId = checkout.data.paymentId;

    if (checkout.data.mode === 'sandbox') {
      const confirm = await req(
        'confirmar-sandbox',
        'POST',
        `/payments/sandbox/${paymentId}/confirm`,
        {},
        clientToken,
        clientTenant,
      );
      expect('pago sandbox confirmado', confirm.res.ok, JSON.stringify(confirm.data).slice(0, 120));
    }
  } else if (paymentsBlocked && confirmPilotPayment) {
    console.log('  → MP no activo: confirmando pago piloto en DB...');
    execSync(`npx tsx scripts/confirm-pilot-payment.ts`, {
      cwd: root,
      env: { ...process.env, PILOT_CONFIRM: '1', ENGAGEMENT_ID: engagementId },
      stdio: 'inherit',
    });
    ok.push('pago piloto confirmado en DB');
  } else if (paymentsBlocked) {
    failures.push(
      'checkout bloqueado — MP no configurado. Reintentá con PILOT_CONFIRM_PAYMENT=1',
    );
  } else {
    expect('checkout', checkout.res.ok, JSON.stringify(checkout.data).slice(0, 150));
  }

  // ── Liberar fondos ──────────────────────────────────────────────
  const release = await req(
    'liberar-fondos',
    'POST',
    `/payments/engagements/${engagementId}/release`,
    {},
    clientToken,
    clientTenant,
  );
  if (release.res.ok) {
    ok.push('fondos liberados al profesional');
  } else if (release.res.status !== 400) {
    expect('liberar fondos', release.res.ok, JSON.stringify(release.data).slice(0, 120));
  }

  // ── Reseña ──────────────────────────────────────────────────────
  const review = await req(
    'reseña',
    'POST',
    '/marketplace/reviews',
    {
      engagementId,
      rating: 5,
      comment: 'Contratación piloto E2E completada correctamente.',
    },
    clientToken,
    clientTenant,
  );
  if (review.res.ok) ok.push('reseña publicada');
}

console.log(`\n✓ ${ok.length} checks OK`);
ok.forEach((o) => console.log(`  ✓ ${o}`));

if (engagementId) {
  console.log(`\n📋 Expediente: https://fixya.emprenor.com/engagements/${engagementId}`);
  console.log(`   Panel finanzas: https://fixya.emprenor.com/dashboard/finanzas`);
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} fallos:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}

console.log('\nContratación piloto E2E: OK');
