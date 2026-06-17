#!/usr/bin/env node
/**
 * E2E de funciones nuevas: recuperación de contraseña + reseñas post-servicio.
 * Requiere API local con usuarios de prueba (npm run db:seed:users) y
 * ENABLE_SANDBOX_PAYMENTS=true para el flujo completo de pago→liberación→reseña.
 */
const API = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const PASS = process.env.SEED_DEMO_PASSWORD ?? 'FixYa2026!';
const failures = [];
const ok = [];

async function req(name, method, path, body, token) {
  try {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { res, data };
  } catch (err) {
    failures.push(`${name}: ${err.message}`);
    return { res: { ok: false, status: 0 }, data: {} };
  }
}

function expect(name, cond, detail = '') {
  if (cond) ok.push(name);
  else failures.push(`${name} ${detail}`);
}

console.log('FixYa E2E — funciones nuevas\n');

// ── 1. Recuperación de contraseña (cuenta descartable) ──────────────
const stamp = Date.now();
const tmpEmail = `e2e-reset-${stamp}@test.fixya.local`;
const reg = await req('register-tmp', 'POST', '/auth/register', {
  email: tmpEmail,
  password: PASS,
  firstName: 'Reset',
  lastName: 'Test',
  phone: '+54 387 555-0000',
  city: 'Salta',
  province: 'Salta',
  role: 'CLIENTE',
});
expect('registro cuenta temporal', !!reg.data.accessToken);

const forgot = await req('forgot', 'POST', '/auth/forgot-password', { email: tmpEmail });
expect('forgot-password responde', forgot.res.ok, JSON.stringify(forgot.data).slice(0, 120));
expect('forgot devuelve devToken (dev)', !!forgot.data.devToken);

const newPass = 'NuevaClave2026!';
if (forgot.data.devToken) {
  const reset = await req('reset', 'POST', '/auth/reset-password', {
    token: forgot.data.devToken,
    password: newPass,
  });
  expect('reset-password OK', reset.res.ok, JSON.stringify(reset.data).slice(0, 120));

  const loginNew = await req('login-new-pass', 'POST', '/auth/login', {
    email: tmpEmail,
    password: newPass,
  });
  expect('login con nueva contraseña', !!loginNew.data.accessToken);

  const loginOld = await req('login-old-pass', 'POST', '/auth/login', {
    email: tmpEmail,
    password: PASS,
  });
  expect('contraseña vieja rechazada', !loginOld.data.accessToken && loginOld.res.status === 401);

  const reuse = await req('reuse-token', 'POST', '/auth/reset-password', {
    token: forgot.data.devToken,
    password: 'OtraMas2026!',
  });
  expect('token de reset no reutilizable', !reuse.res.ok);
}

// ── 2. Reseñas post-servicio (flujo completo con sandbox) ───────────
const clientLogin = await req('login-cliente', 'POST', '/auth/login', {
  email: 'cliente@fixya.test',
  password: PASS,
});
const proLogin = await req('login-pro', 'POST', '/auth/login', {
  email: 'profesional@fixya.test',
  password: PASS,
});
const clientToken = clientLogin.data.accessToken;
const proToken = proLogin.data.accessToken;
expect('login cliente prueba', !!clientToken);
expect('login profesional prueba', !!proToken);

if (clientToken && proToken) {
  const cats = await req('cats', 'GET', '/marketplace/categories');
  const plomeria = (cats.data || []).find((c) => c.slug === 'plomeria') ?? cats.data?.[0];

  const created = await req('crear-solicitud', 'POST', '/marketplace/requests', {
    categoryId: plomeria.id,
    title: `E2E reseña ${stamp}`,
    description: 'Solicitud para validar flujo de reseñas',
    city: 'Salta',
    province: 'Salta',
  }, clientToken);
  expect('crear solicitud', !!created.data.id);

  if (created.data.id) {
    await req('publicar', 'POST', `/marketplace/requests/${created.data.id}/publish`, {}, clientToken);

    const quote = await req('presupuesto', 'POST', '/marketplace/quotations', {
      serviceRequestId: created.data.id,
      totalAmount: 12000,
      estimatedDays: 2,
      items: [{ description: 'Reparación E2E', quantity: 1, unitPrice: 12000 }],
    }, proToken);
    expect('profesional verificado puede presupuestar', !!quote.data.id, JSON.stringify(quote.data).slice(0, 120));

    if (quote.data.id) {
      const eng = await req('aceptar', 'POST', `/engagements/accept-quotation/${quote.data.id}`, {}, clientToken);
      expect('aceptar presupuesto → engagement', !!eng.data.id);

      if (eng.data.id) {
        // Reseña antes de completar → debe fallar
        const early = await req('resena-temprana', 'POST', '/marketplace/reviews', {
          engagementId: eng.data.id,
          rating: 5,
        }, clientToken);
        expect('reseña bloqueada si no completado', !early.res.ok);

        // Pago sandbox → liberar fondos → reseñable
        const checkout = await req('checkout', 'POST', `/payments/engagements/${eng.data.id}/checkout`, {}, clientToken);
        if (checkout.data.paymentId) {
          await req('confirmar-sandbox', 'POST', `/payments/sandbox/${checkout.data.paymentId}/confirm`, {}, clientToken);
          const release = await req('liberar', 'POST', `/payments/engagements/${eng.data.id}/release`, {}, clientToken);
          expect('liberar fondos', release.res.ok, JSON.stringify(release.data).slice(0, 120));

          const review = await req('crear-resena', 'POST', '/marketplace/reviews', {
            engagementId: eng.data.id,
            rating: 5,
            comment: 'Excelente trabajo, muy recomendable (E2E)',
          }, clientToken);
          expect('crear reseña tras liberar', review.res.ok, JSON.stringify(review.data).slice(0, 150));

          const dup = await req('resena-duplicada', 'POST', '/marketplace/reviews', {
            engagementId: eng.data.id,
            rating: 3,
          }, clientToken);
          expect('reseña duplicada bloqueada', !dup.res.ok);
        } else {
          console.log('  (sandbox de pagos no habilitado — se omite reseña exitosa)');
        }
      }
    }
  }
}

console.log(`\n✓ ${ok.length} checks OK`);
ok.forEach((o) => console.log(`  ✓ ${o}`));
if (failures.length) {
  console.error(`\n✗ ${failures.length} fallos:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('\nE2E funciones nuevas: OK');
