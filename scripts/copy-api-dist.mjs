#!/usr/bin/env node
/**
 * Empaqueta la API NestJS para el route handler de Next.js (/api/v1).
 * Salida: node_modules/@fixya/api-runtime (web + root del monorepo).
 */
import { buildSync } from 'esbuild';
import { existsSync, mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiDist = join(root, 'apps/api/dist/apps/api/src/create-app.js');

const pkgDirs = [
  join(root, 'apps/web/node_modules/@fixya/api-runtime'),
  join(root, 'node_modules/@fixya/api-runtime'),
];

if (!existsSync(apiDist)) {
  console.error('Falta apps/api/dist — ejecutá npm run api:build primero.');
  process.exit(1);
}

const apiDistMtime = statSync(apiDist).mtimeMs;

for (const pkgDir of pkgDirs) {
  const bundlePath = join(pkgDir, 'api-bundle.cjs');
  if (
    existsSync(bundlePath) &&
    statSync(bundlePath).mtimeMs >= apiDistMtime
  ) {
    continue;
  }

  rmSync(pkgDir, { recursive: true, force: true });
  mkdirSync(pkgDir, { recursive: true });

  buildSync({
    entryPoints: [apiDist],
    outfile: bundlePath,
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    sourcemap: false,
    external: [
      '@prisma/client',
      '.prisma/client',
      'bcrypt',
      '@mapbox/node-pre-gyp',
      'mock-aws-s3',
      'aws-sdk',
      'nock',
      '@nestjs/microservices',
      '@nestjs/microservices/microservices-module',
      '@nestjs/websockets',
      '@nestjs/websockets/socket-module',
      'class-transformer/storage',
    ],
  });

  writeFileSync(
    join(pkgDir, 'package.json'),
    JSON.stringify({ name: '@fixya/api-runtime', main: 'api-bundle.cjs' }, null, 2),
  );
}

console.log('✓ API bundle creado en @fixya/api-runtime');
