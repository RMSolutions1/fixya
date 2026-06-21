#!/usr/bin/env node
/**
 * Descarga el padrón completo de matriculados COPAIPA (Salta).
 * Fuente pública: https://copaipa.org.ar/profesiones-matriculadas/
 * API: https://padrones.copaipa.org.ar/padron/serverSide
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const API = 'https://padrones.copaipa.org.ar/padron/serverSide';
const PAGE_SIZE = 500;
const OUT_DIR = resolve(process.cwd(), 'data/imports');
const OUT_JSON = resolve(OUT_DIR, 'copaipa-padron-full.json');
const OUT_CSV = resolve(OUT_DIR, 'copaipa-padron-full.csv');

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fetchPage(start) {
  const params = new URLSearchParams({
    draw: '1',
    start: String(start),
    length: String(PAGE_SIZE),
    'search[value]': '',
    'search[regex]': 'false',
  });
  const url = `${API}?${params}`;
  const out = execFileSync(
    'curl.exe',
    ['-sL', '--max-time', '60', url],
    { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
  );
  return JSON.parse(out);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('COPAIPA — descargando padrón completo...\n');

  const first = fetchPage(0);
  const total = first.recordsTotal ?? first.recordsFiltered ?? 0;
  const all = [...(first.data ?? [])];

  console.log(`Total en origen: ${total} registros`);

  for (let start = PAGE_SIZE; start < total; start += PAGE_SIZE) {
    const page = fetchPage(start);
    all.push(...(page.data ?? []));
    process.stdout.write(`\r  Descargados: ${Math.min(start + PAGE_SIZE, total)} / ${total}`);
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\n  Registros obtenidos: ${all.length}`);

  const meta = {
    source: 'https://copaipa.org.ar/profesiones-matriculadas/',
    api: API,
    registryId: 'copaipa',
    province: 'Salta',
    scrapedAt: new Date().toISOString(),
    recordsTotal: total,
    recordsFetched: all.length,
  };

  writeFileSync(OUT_JSON, JSON.stringify({ meta, records: all }, null, 2), 'utf8');

  const headers = ['Matricula', 'nombre', 'profesion', 'otorgado_por', 'email'];
  const csvLines = [
    headers.join(','),
    ...all.map((r) =>
      headers.map((h) => csvEscape(r[h])).join(','),
    ),
  ];
  writeFileSync(OUT_CSV, csvLines.join('\n'), 'utf8');

  console.log(`\n✓ JSON: ${OUT_JSON}`);
  console.log(`✓ CSV:  ${OUT_CSV}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
