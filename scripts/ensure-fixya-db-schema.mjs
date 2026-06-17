#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = readFileSync(join(root, '.env'), 'utf8');
const url = env.match(/^DIRECT_URL="(.+)"$/m)?.[1];
const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 20000 });

await client.connect();
await client.query('CREATE SCHEMA IF NOT EXISTS fixya');

const extensions = ['postgis', 'pg_trgm', 'uuid-ossp', 'pgcrypto'];
for (const ext of extensions) {
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "${ext}"`);
    console.log('✓ extension', ext);
  } catch (e) {
    console.warn('⚠ extension', ext, '-', String(e.message).split('\n')[0]);
  }
}

console.log('✓ schema fixya listo');
await client.end();
