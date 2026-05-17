/**
 * Run specific migrations by index — skips already-applied ones.
 * Usage: node --env-file=.env scripts/run-remaining.mjs [start-index]
 */
import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import pg from 'pg';

const { Client } = pg;
const startIndex = parseInt(process.argv[2] || '0');

const migrationsDir = resolve('supabase', 'migrations');
const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

console.log(`\n📦 Running migrations starting from index ${startIndex}:\n`);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('✅ Connected\n');

  for (let i = startIndex; i < files.length; i++) {
    const file = files[i];
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    console.log(`🚀 [${i}] ${file} (${sql.length} chars)...`);

    try {
      await client.query(sql);
      console.log(`   ✅ Success\n`);
    } catch (err) {
      console.error(`   ❌ ${err.message}`);
      if (err.detail) console.error(`      ${err.detail}`);
      
      // Ask whether to continue or stop
      console.error(`\n⛔ Failed at index ${i}: ${file}\n`);
      process.exit(1);
    }
  }

  console.log('🎉 All remaining migrations applied!\n');
} finally {
  await client.end();
}
