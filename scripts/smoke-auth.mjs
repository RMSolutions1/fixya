#!/usr/bin/env node
/**
 * Smoke test autenticado — flujos API protegidos.
 * Requiere API en ejecución con DB seeded.
 */
const API = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const failures = [];
const stamp = Date.now();
const email = `smoke-${stamp}@test.fixya.local`;
const password = 'SmokeTest123!';

async function post(name, path, body, token) {
  try {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      failures.push(`${name}: HTTP ${res.status} — ${JSON.stringify(data).slice(0, 120)}`);
      return null;
    }
    return data;
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function get(name, path, token) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      failures.push(`${name}: HTTP ${res.status}`);
      return null;
    }
    return data;
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

console.log('FixYa smoke test (auth flows)');

const registered = await post('register', '/auth/register', {
  email,
  password,
  firstName: 'Smoke',
  lastName: 'Test',
  role: 'CLIENTE',
});

const token = registered?.accessToken;
if (!token) {
  console.error('\nFALLÓ registro — no se puede continuar');
  process.exit(1);
}

await get('me/requests', '/marketplace/requests', token);
await get('wallet', '/wallet/balance', token);
await get('wallet-ledger', '/wallet/ledger?page=1&limit=5', token);
await get('favorites', '/marketplace/favorites', token);

const categories = await get('categories', '/marketplace/categories');
const categoryId = categories?.[0]?.id;

let requestId;
let quotationId;

if (categoryId) {
  const created = await post(
    'create-request',
    '/marketplace/requests',
    {
      categoryId,
      title: `Smoke test ${stamp}`,
      description: 'Solicitud generada por smoke test automatizado',
      city: 'Salta',
      province: 'Salta',
    },
    token,
  );

  if (created?.id) {
    requestId = created.id;
    await get('request-detail', `/marketplace/requests/${created.id}`, token);
    await post('publish-request', `/marketplace/requests/${created.id}/publish`, {}, token);
  }
}

// Flujo profesional → presupuesto → contratación → expediente
const proEmail = `smoke-pro-${stamp}@test.fixya.local`;
const proRegistered = await post('register-pro', '/auth/register', {
  email: proEmail,
  password,
  firstName: 'Pro',
  lastName: 'Smoke',
  role: 'PROFESIONAL',
});

const proToken = proRegistered?.accessToken;

if (proToken && requestId) {
  const quotation = await post(
    'submit-quotation',
    '/marketplace/quotations',
    {
      serviceRequestId: requestId,
      totalAmount: 15000,
      estimatedDays: 3,
      items: [{ description: 'Servicio smoke test', quantity: 1, unitPrice: 15000 }],
    },
    proToken,
  );

  if (quotation?.id) {
    quotationId = quotation.id;
    await get('compare-quotations', `/marketplace/requests/${requestId}/compare`, token);
  }
}

if (quotationId) {
  const engagement = await post(
    'accept-quotation',
    `/engagements/accept-quotation/${quotationId}`,
    {},
    token,
  );

  if (engagement?.id) {
    await get('engagement-expediente', `/engagements/${engagement.id}/expediente`, token);
  }
}

if (failures.length > 0) {
  console.error('\nFALLÓ:');
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}

console.log('\nOK — smoke auth completado');
