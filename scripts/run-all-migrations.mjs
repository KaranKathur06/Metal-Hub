/**
 * Migration Runner — Applies ALL pending SQL migrations to Supabase.
 * Runs migrations in filename order (chronological).
 * 
 * Usage: node --env-file=.env scripts/run-all-migrations.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import pg from 'pg';

const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not set.');
  process.exit(1);
}

const migrationsDir = resolve('supabase', 'migrations');
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`\n📦 Found ${files.length} migration files:\n`);
files.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('\n✅ Connected to database\n');

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`🚀 Applying: ${file} (${sql.length} chars)...`);

    try {
      await client.query(sql);
      console.log(`   ✅ Success\n`);
    } catch (err) {
      // If error is "already exists", that's OK — skip it
      if (
        err.message.includes('already exists') ||
        err.message.includes('duplicate key') ||
        err.message.includes('relation') && err.message.includes('already exists')
      ) {
        console.log(`   ⚠️  Skipped (already applied): ${err.message.slice(0, 80)}\n`);
        continue;
      }

      console.error(`   ❌ Failed: ${err.message}`);
      if (err.detail) console.error(`      Detail: ${err.detail}`);
      if (err.hint) console.error(`      Hint: ${err.hint}`);
      if (err.position) {
        const lines = sql.slice(0, parseInt(err.position)).split('\n');
        console.error(`      Near line ${lines.length}: ${lines[lines.length - 1].trim()}`);
      }

      console.error(`\n⛔ Stopping at ${file}. Fix the issue and re-run.\n`);
      process.exit(1);
    }
  }

  console.log('🎉 All migrations applied successfully!\n');
} finally {
  await client.end();
}
