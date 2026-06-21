#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REGISTRIES = [
  ['copime', 'COPIME', '#003366'],
  ['copaipa', 'COPAIPA', '#0054A6'],
  ['enargas', 'ENARGAS', '#00843D'],
  ['gasnor', 'GASNOR', '#E87722'],
  ['metrogas', 'METRO', '#00A651'],
  ['naturgy-ban', 'NATURGY', '#E87722'],
  ['camuzzi', 'CAMUZZI', '#0066CC'],
  ['ecogas', 'ECOGAS', '#FF6600'],
  ['edesa', 'EDESA', '#0066B3'],
  ['aguas-del-norte', 'ADN', '#0099CC'],
  ['aafrio', 'AAF', '#006699'],
  ['carc', 'CARC', '#004B87'],
  ['carhaa', 'CARHAA', '#1A5276'],
  ['ca-frigoristas', 'CAF', '#2874A6'],
  ['senasa-vet', 'SENASA', '#2E7D32'],
  ['cmv', 'CMV', '#1565C0'],
  ['cacaaav', 'CACAAV', '#0277BD'],
  ['afip-habilitacion', 'AFIP', '#003DA5'],
  ['municipal-habilitacion', 'MUNI', '#546E7A'],
];

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/web/public/images/registries');
mkdirSync(outDir, { recursive: true });

for (const [id, acronym, color] of REGISTRIES) {
  const label = acronym.length > 6 ? acronym.slice(0, 5) : acronym;
  const fs = label.length > 5 ? 10 : 12;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="${acronym}">
  <rect width="64" height="64" rx="12" fill="${color}"/>
  <text x="32" y="38" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="${fs}" font-weight="700">${label}</text>
</svg>`;
  writeFileSync(resolve(outDir, `${id}.svg`), svg, 'utf8');
}

console.log(`OK ${REGISTRIES.length} logos -> ${outDir}`);
