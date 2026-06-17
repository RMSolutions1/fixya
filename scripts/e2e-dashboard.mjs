#!/usr/bin/env node
/**
 * E2E por rol — login, API protegida y rutas del dashboard.
 * Requiere: API + Web corriendo, usuarios creados con npm run db:seed:users
 */
const API = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const WEB = (process.env.WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';

const USERS = [
  { role: 'SUPER_ADMIN', email: 'admin@fixya.test' },
  { role: 'CLIENTE', email: 'cliente@fixya.test' },
  { role: 'PROFESIONAL', email: 'profesional@fixya.test' },
  { role: 'EMPRESA', email: 'empresa@fixya.test' },
  { role: 'CONTADOR', email: 'contador@fixya.test' },
  { role: 'SUPERVISOR', email: 'supervisor@fixya.test' },
  { role: 'OPERADOR', email: 'operador@fixya.test' },
  { role: 'AUDITOR', email: 'auditor@fixya.test' },
  { role: 'GESTOR_DOCUMENTAL', email: 'gestor@fixya.test' },
];

const ROUTES_BY_ROLE = {
  CLIENTE: ['/dashboard', '/dashboard/solicitudes', '/favorites', '/marketplace/requests/new'],
  PROFESIONAL: ['/dashboard', '/dashboard/solicitudes', '/marketplace', '/wallet'],
  EMPRESA: ['/dashboard', '/marketplace', '/dashboard/solicitudes', '/wallet'],
  SUPER_ADMIN: ['/dashboard', '/marketplace', '/dashboard/solicitudes', '/wallet'],
  CONTADOR: ['/dashboard', '/marketplace', '/dashboard/solicitudes', '/wallet'],
  SUPERVISOR: ['/dashboard', '/marketplace', '/dashboard/solicitudes', '/wallet'],
  OPERADOR: ['/dashboard', '/marketplace', '/dashboard/solicitudes', '/wallet'],
  AUDITOR: ['/dashboard', '/dashboard/solicitudes', '/wallet'],
  GESTOR_DOCUMENTAL: ['/dashboard', '/dashboard/solicitudes'],
};

const WALLET_ROLES = new Set([
  'CLIENTE',
  'PROFESIONAL',
  'EMPRESA',
  'CONTADOR',
  'SUPERVISOR',
  'OPERADOR',
  'AUDITOR',
  'SUPER_ADMIN',
]);

const failures = [];
const passes = [];

async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    failures.push(`login ${email}: HTTP ${res.status}`);
    return null;
  }
  return data;
}

async function apiGet(name, path, token, expectOk = true) {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (expectOk && !res.ok) {
    failures.push(`${name}: HTTP ${res.status}`);
    return null;
  }
  if (!expectOk && res.ok) {
    failures.push(`${name}: se esperaba error pero respondió ${res.status}`);
    return null;
  }
  passes.push(name);
  return res.ok ? res.json().catch(() => ({})) : null;
}

async function webGet(name, path) {
  try {
    const res = await fetch(`${WEB}${path}`, { redirect: 'follow' });
    if (res.status !== 200) {
      failures.push(`${name}: HTTP ${res.status}`);
      return false;
    }
    passes.push(name);
    return true;
  } catch (err) {
    failures.push(`${name}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

console.log('FixYa E2E Dashboard — todos los roles\n');

for (const { role, email } of USERS) {
  console.log(`▸ ${role} (${email})`);

  const session = await login(email);
  if (!session?.accessToken) continue;

  const token = session.accessToken;

  await apiGet(`${role}/auth/me`, '/auth/me', token);
  await apiGet(`${role}/requests`, '/marketplace/requests', token);
  await apiGet(`${role}/favorites`, '/marketplace/favorites', token);

  if (WALLET_ROLES.has(role)) {
    await apiGet(`${role}/wallet`, '/wallet/balance', token);
    await apiGet(`${role}/ledger`, '/wallet/ledger?page=1&limit=5', token);
  } else {
    await apiGet(`${role}/wallet-denied`, '/wallet/balance', token, false);
  }

  if (role === 'CLIENTE') {
    const cats = await apiGet(`${role}/categories`, '/marketplace/categories', token);
    if (cats?.[0]?.id) {
      const created = await fetch(`${API}/marketplace/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: cats[0].id,
          title: `E2E ${role} ${Date.now()}`,
          description: 'Solicitud E2E dashboard test',
          city: 'Salta',
          province: 'Salta',
        }),
      });
      if (created.ok) {
        const req = await created.json();
        passes.push(`${role}/create-request`);
        await apiGet(`${role}/request/${req.id}`, `/marketplace/requests/${req.id}`, token);
      } else {
        failures.push(`${role}/create-request: HTTP ${created.status}`);
      }
    }
  }

  if (role === 'PROFESIONAL' || role === 'EMPRESA') {
    await apiGet(`${role}/marketplace-stats`, '/marketplace/stats', token);
  }

  const routes = ROUTES_BY_ROLE[role] ?? ['/dashboard'];
  for (const path of routes) {
    await webGet(`${role} web ${path}`, path);
  }
}

console.log(`\n${passes.length} checks OK`);

if (failures.length > 0) {
  console.error(`\nFALLÓ (${failures.length}):`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}

console.log('\nOK — E2E dashboard completado para todos los roles');
