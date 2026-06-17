#!/usr/bin/env node
import { buildSync } from 'esbuild';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const apiDist = join(root, 'apps/api/dist/apps/api/src/create-app.js');
const pkgDir = join(root, 'apps/web/node_modules/@fixya/api-runtime');
const bundlePath = join(pkgDir, 'api-bundle.cjs');

if (!existsSync(apiDist)) {
  console.error('Falta apps/api/dist — ejecutá npm run api:build primero.');
  process.exit(1);
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
  JSON.stringify({ name: '@fixya/api-runtime', main: 'api-bundle.cjs' }),
);

console.log('✓ API bundle creado en node_modules/@fixya/api-runtime');
