#!/usr/bin/env node
/** Asegura @fixya/api-runtime antes de web:dev / web:build */
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiDist = join(root, 'apps/api/dist/apps/api/src/create-app.js');

if (!existsSync(apiDist)) {
  console.log('→ Compilando API (primera vez o dist ausente)…');
  execSync('npm run api:build', { cwd: root, stdio: 'inherit' });
}

execSync('node scripts/copy-api-dist.mjs', { cwd: root, stdio: 'inherit' });
