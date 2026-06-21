#!/usr/bin/env node
/**
 * Descarga plomeros/sanitaristas matriculados — Aguas del Norte COSAySA (Salta / NOA).
 * Fuente: https://www.aguasdelnortesalta.com.ar/consulta_matriculados.php
 * API: GET https://www.aguasdelnortesalta.com.ar/api/v1/web/matriculados
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const API = 'https://www.aguasdelnortesalta.com.ar/api/v1/web/matriculados';
const OUT_DIR = resolve(process.cwd(), 'data/imports');
const OUT_JSON = resolve(OUT_DIR, 'aguas-del-norte-matriculados-full.json');
const OUT_CSV = resolve(OUT_DIR, 'aguas-del-norte-matriculados-full.csv');

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function normalizeRecord(row) {
  const license =
    (row.matricula && String(row.matricula).trim()) ||
    (row.matriculaProfesional && String(row.matriculaProfesional).trim()) ||
    `ADN-${row.id}`;

  return {
    adnId: String(row.id),
    matricula: row.matricula ? String(row.matricula).trim() : null,
    matriculaProfesional: row.matriculaProfesional
      ? String(row.matriculaProfesional).trim()
      : null,
    licenseNumber: license,
    categoria: String(row.categoria ?? ''),
    apellidonombre: String(row.apellidonombre ?? '').trim(),
    domicilio: row.domicilio ? String(row.domicilio).trim() : '',
    localidad: row.localidad ? String(row.localidad).trim() : '',
    barrio: row.barrio ? String(row.barrio).trim() : '',
    uop: row.uop ? String(row.uop).trim() : 'Salta',
    provincia: 'Salta',
    telefono: row.nroTel ? String(row.nroTel).trim() : '',
    telefono2: row.nroTel2 ? String(row.nroTel2).trim() : '',
    email: row.email ? String(row.email).trim().toLowerCase() : '',
    cuit: row.cuit ? String(row.cuit).trim() : '',
    fchUltRenovacion: row.fchUltRenovacion ?? null,
    fchUltVto: row.fchUltVto ?? null,
    observaciones: row.observaciones ? String(row.observaciones).trim() : '',
    estado: String(row.estado ?? '1'),
  };
}

async function fetchAll() {
  const res = await fetch(API, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} al consultar ${API}`);
  }
  const payload = await res.json();
  if (payload.status !== 'success' || !Array.isArray(payload.data)) {
    throw new Error(`Respuesta inesperada: ${JSON.stringify(payload).slice(0, 200)}`);
  }
  return {
    meta: {
      source: 'aguas-del-norte-matriculados',
      sourceUrl: 'https://www.aguasdelnortesalta.com.ar/consulta_matriculados.php',
      apiUrl: API,
      scrapedAt: new Date().toISOString(),
      totalItems: payload.total_items ?? payload.data.length,
    },
    records: payload.data.map(normalizeRecord),
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log('Aguas del Norte — descargando matriculados (plomeros/sanitaristas)...\n');

  const payload = await fetchAll();
  const active = payload.records.filter((r) => r.estado === '1' && r.apellidonombre);
  payload.records = active;
  payload.meta.activeRecords = active.length;

  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), 'utf8');

  const headers = [
    'adnId',
    'licenseNumber',
    'categoria',
    'apellidonombre',
    'localidad',
    'uop',
    'telefono',
    'email',
  ];
  const csv = [
    headers.join(','),
    ...active.map((r) => headers.map((h) => csvEscape(r[h])).join(',')),
  ].join('\n');
  writeFileSync(OUT_CSV, csv, 'utf8');

  console.log(`Total matriculados activos: ${active.length}`);
  console.log(`\n✓ JSON: ${OUT_JSON}`);
  console.log(`✓ CSV:  ${OUT_CSV}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
