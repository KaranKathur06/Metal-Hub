/**
 * Migration Runner — Applies SQL migration files to Supabase via direct connection.
 * 
 * Usage: node scripts/run-migration.mjs [migration-filename]
 * Example: node scripts/run-migration.mjs 202605110005_schema_consolidation.sql
 */

import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set. Load from .env or set it manually.');
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('❌ Usage: node scripts/run-migration.mjs <migration-filename>');
  console.error('   Example: node scripts/run-migration.mjs 202605110005_schema_consolidation.sql');
  process.exit(1);
}

const migrationPath = resolve(join('supabase', 'migrations', migrationFile));

let sql;
try {
  sql = readFileSync(migrationPath, 'utf-8');
} catch {
  console.error(`❌ Could not read migration file: ${migrationPath}`);
  process.exit(1);
}

console.log(`\n🚀 Applying migration: ${migrationFile}`);
console.log(`   File: ${migrationPath}`);
console.log(`   SQL length: ${sql.length} characters\n`);

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('✅ Connected to database');

  await client.query(sql);
  console.log('✅ Migration applied successfully!\n');
} catch (err) {
  console.error('❌ Migration failed:');
  console.error(err.message);
  if (err.detail) console.error('   Detail:', err.detail);
  if (err.hint) console.error('   Hint:', err.hint);
  if (err.position) {
    const lines = sql.slice(0, parseInt(err.position)).split('\n');
    console.error(`   Near line ${lines.length}: ${lines[lines.length - 1].trim()}`);
  }
  process.exit(1);
} finally {
  await client.end();
}
