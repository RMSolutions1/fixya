#!/usr/bin/env node
/**
 * Aísla tablas FixYa en schema `fixya` (Supabase compartido con grupo.emprenor.com).
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const schemaPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'prisma', 'schema.prisma');
let content = readFileSync(schemaPath, 'utf8');

if (content.includes('@@schema("fixya")')) {
  console.log('Schema fixya ya configurado');
  process.exit(0);
}

content = content.replace(
  'previewFeatures = ["postgresqlExtensions"]',
  'previewFeatures = ["postgresqlExtensions", "multiSchema"]',
);

content = content.replace(
  /datasource db \{\n  provider   = "postgresql"\n  url        = env\("DATABASE_URL"\)\n  directUrl  = env\("DIRECT_URL"\)\n  extensions = \[postgis, pg_trgm, uuid_ossp\(map: "uuid-ossp"\), pgcrypto\]\n\}/,
  `datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  schemas    = ["fixya"]
  extensions = [postgis, pg_trgm, uuid_ossp(map: "uuid-ossp"), pgcrypto]
}`,
);

function addSchemaDirective(block) {
  if (block.includes('@@schema("fixya")')) return block;
  const lines = block.split('\n');
  const last = lines.length - 1;
  if (lines[last].trim() !== '}') return block;
  lines.splice(last, 0, '  @@schema("fixya")');
  return lines.join('\n');
}

content = content.replace(/enum \w+ \{[\s\S]*?\n\}/g, (m) => addSchemaDirective(m));
content = content.replace(/model \w+ \{[\s\S]*?\n\}/g, (m) => addSchemaDirective(m));

writeFileSync(schemaPath, content);
console.log('✓ prisma/schema.prisma actualizado con schema fixya');
