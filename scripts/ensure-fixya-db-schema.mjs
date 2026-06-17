#!/usr/bin/env node
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = readFileSync(join(root, '.env'), 'utf8');
const url = env.match(/^DIRECT_URL="(.+)"$/m)?.[1];
const client = new pg.Client({ connectionString: url });
await client.connect();
await client.query('CREATE SCHEMA IF NOT EXISTS fixya');
await client.query('CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public');
await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA public');
await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public');
await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public');
console.log('✓ schema fixya + extensiones listos');
await client.end();
