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
const cats = await client.query('SELECT COUNT(*)::int AS n FROM fixya."ServiceCategory"');
const users = await client.query('SELECT COUNT(*)::int AS n FROM fixya."User"');
console.log('ServiceCategory:', cats.rows[0].n);
console.log('Users:', users.rows[0].n);
await client.end();
