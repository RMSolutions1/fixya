#!/usr/bin/env node
/**
 * Descarga instaladores matriculados Gasnor / Naturgy NOA.
 * Fuente: https://gasnor.idearit.com.ar/instaladores
 * API interna: POST instaladores/dame_instaladores (requiere cookies de sesión)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const BASE = 'https://gasnor.idearit.com.ar';
const OUT_DIR = resolve(process.cwd(), 'data/imports');
const OUT_JSON = resolve(OUT_DIR, 'gasnor-instaladores-full.json');
const OUT_CSV = resolve(OUT_DIR, 'gasnor-instaladores-full.csv');
const COOKIE = resolve(OUT_DIR, '.gasnor-cookies.txt');

const PROVINCES = [
  { api: 'JUJUY', label: 'Jujuy' },
  { api: 'SALTA', label: 'Salta' },
  { api: 'SANTIAGO-DEL-ESTERO', label: 'Santiago del Estero' },
  { api: 'TUCUMAN', label: 'Tucumán' },
];

function curl(args) {
  return execFileSync('curl.exe', args, {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  });
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function post(path, body) {
  return curl([
    '-sL',
    '-b',
    COOKIE,
    '-c',
    COOKIE,
    '-X',
    'POST',
    `${BASE}/instaladores/${path}`,
    '-H',
    'Content-Type: application/x-www-form-urlencoded',
    '-H',
    `Referer: ${BASE}/instaladores`,
    '-d',
    body,
    '--max-time',
    '60',
  ]);
}

function parseLocalidades(htmlOptions) {
  return [...htmlOptions.matchAll(/value="([^"]+)"/g)]
    .map((m) => m[1])
    .filter(Boolean);
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseEmail(cell) {
  const mailto = cell.match(/mailto:([^'">\s]+)/i);
  if (mailto) return mailto[1].trim().toLowerCase();
  const text = stripTags(cell);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return text.toLowerCase();
  return '';
}

function parseRows(html) {
  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbody) return [];
  const rows = [...tbody[1].matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
  return rows
    .map((row) => {
      const cells = [...row[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => c[1]);
      if (cells.length < 10) return null;
      return {
        matricula: stripTags(cells[0]),
        categoria: stripTags(cells[1]),
        apellido: stripTags(cells[2]),
        nombre: stripTags(cells[3]),
        domicilio: stripTags(cells[4]),
        localidad: stripTags(cells[5]),
        provincia: stripTags(cells[6]),
        telefono: stripTags(cells[7]),
        celular: stripTags(cells[8]),
        email: parseEmail(cells[9]),
      };
    })
    .filter(Boolean);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  curl(['-sL', '-c', COOKIE, '-b', COOKIE, `${BASE}/instaladores`, '--max-time', '30']);

  console.log('Gasnor — descargando instaladores matriculados (NOA)...\n');

  const byKey = new Map();

  for (const prov of PROVINCES) {
    const locRes = JSON.parse(post('dame_localidades', `provincia=${encodeURIComponent(prov.api)}`));
    const localidades = parseLocalidades(locRes.option ?? '');
    console.log(`${prov.label}: ${localidades.length} localidades`);

    let provCount = 0;
    for (let i = 0; i < localidades.length; i++) {
      const loc = localidades[i];
      const html = post(
        'dame_instaladores',
        `provincia=${encodeURIComponent(prov.api)}&localidad=${encodeURIComponent(loc)}&categoria=`,
      );
      const rows = parseRows(html);
      for (const r of rows) {
        const key = `${prov.api}:${r.matricula}`;
        if (!byKey.has(key)) {
          byKey.set(key, {
            ...r,
            provinciaApi: prov.api,
            provinciaLabel: prov.label,
          });
          provCount++;
        }
      }
      process.stdout.write(
        `\r  ${prov.label}: ${i + 1}/${localidades.length} locs, ${provCount} instaladores únicos`,
      );
      await new Promise((r) => setTimeout(r, 120));
    }
    console.log('');
  }

  const records = [...byKey.values()];
  console.log(`\nTotal instaladores únicos: ${records.length}`);

  const meta = {
    source: 'https://gasnor.idearit.com.ar/instaladores',
    registryId: 'gasnor',
    provinces: PROVINCES.map((p) => p.label),
    scrapedAt: new Date().toISOString(),
    recordsTotal: records.length,
  };

  writeFileSync(OUT_JSON, JSON.stringify({ meta, records }, null, 2), 'utf8');

  const headers = [
    'matricula',
    'categoria',
    'apellido',
    'nombre',
    'domicilio',
    'localidad',
    'provincia',
    'telefono',
    'celular',
    'email',
    'provinciaApi',
    'provinciaLabel',
  ];
  writeFileSync(
    OUT_CSV,
    [headers.join(','), ...records.map((r) => headers.map((h) => csvEscape(r[h])).join(','))].join(
      '\n',
    ),
    'utf8',
  );

  console.log(`\n✓ JSON: ${OUT_JSON}`);
  console.log(`✓ CSV:  ${OUT_CSV}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
