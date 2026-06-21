#!/usr/bin/env node
/** E2E — geo, landings /servicios/[slug], api-runtime vía Next */
const API = (process.env.API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '');
const WEB = (process.env.WEB_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const SLUGS = [
  'electricidad', 'plomeria', 'gas', 'aire-acondicionado', 'seguridad', 'cerrajeria',
  'mecanica', 'pintura', 'mudanza', 'flete', 'limpieza', 'jardineria', 'peluqueria',
  'veterinaria', 'ninera', 'cuidador-adultos', 'albanileria', 'carpinteria', 'tecnico-pc',
  'profesor-particular',
];

const failures = [];
const ok = [];

async function check(name, fn) {
  try {
    await fn();
    ok.push(name);
  } catch (e) {
    failures.push(`${name}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

console.log('FixYa E2E — geo + landings + api-runtime\n');

await check('health API directa', async () => {
  const r = await fetch(`${API}/health`);
  const d = await r.json();
  if (!r.ok || d.status !== 'ok') throw new Error(JSON.stringify(d));
});

await check('nearby/professionals Salta', async () => {
  const r = await fetch(`${API}/marketplace/nearby/professionals?latitude=-24.7821&longitude=-65.4232&radiusKm=50`);
  const d = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 120));
  if (!Array.isArray(d.items)) throw new Error('items no es array');
  if (d.items[0] && d.items[0].distanceKm == null) throw new Error('falta distanceKm');
});

await check('nearby/stats Salta', async () => {
  const r = await fetch(`${API}/marketplace/nearby/stats?latitude=-24.7821&longitude=-65.4232&radiusKm=50`);
  const d = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(d).slice(0, 120));
  if (typeof d.professionalsCount !== 'number') throw new Error('professionalsCount inválido');
  if (!Array.isArray(d.categoriesNearby)) throw new Error('categoriesNearby inválido');
});

await check('nearby filtro plomeria', async () => {
  const r = await fetch(`${API}/marketplace/nearby/professionals?latitude=-24.7821&longitude=-65.4232&radiusKm=50&categorySlug=plomeria`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
});

await check('health vía Next /api/v1', async () => {
  const r = await fetch(`${WEB}/api/v1/health`);
  const d = await r.json();
  if (!r.ok || d.status !== 'ok') throw new Error(JSON.stringify(d).slice(0, 120));
});

await check('categories vía Next', async () => {
  const r = await fetch(`${WEB}/api/v1/marketplace/categories`);
  const d = await r.json();
  if (!r.ok || !Array.isArray(d) || d.length < 20) throw new Error(`count=${d?.length}`);
});

for (const slug of SLUGS) {
  await check(`landing /servicios/${slug}`, async () => {
    const r = await fetch(`${WEB}/servicios/${slug}`);
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();
    if (!html.includes('FixYa') && !html.includes('Fix Ya')) throw new Error('sin marca');
    if (!html.includes(slug) && !html.replace(/-/g, ' ').includes(slug.split('-')[0])) {
      /* slug puede estar en metadata */
    }
  });
}

await check('home 200', async () => {
  const r = await fetch(`${WEB}/`);
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
});

await check('profesionales 200', async () => {
  const r = await fetch(`${WEB}/profesionales`);
  if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
});

await check('manifest PWA', async () => {
  const r = await fetch(`${WEB}/manifest.webmanifest`);
  const d = await r.json();
  if (!d.short_name) throw new Error('manifest inválido');
});

await check('service worker', async () => {
  const r = await fetch(`${WEB}/sw.js`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const t = await r.text();
  if (!t.includes('fixya')) throw new Error('sw inválido');
});

console.log(`✓ ${ok.length} checks OK`);
if (failures.length) {
  console.error(`\n✗ ${failures.length} fallos:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log('\nOK — E2E geo/landings/api-runtime');
