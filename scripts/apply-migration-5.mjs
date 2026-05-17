/**
 * Apply migration 0005 in two phases:
 *   Phase 1: Add enum values (must be outside transaction / committed separately)
 *   Phase 2: Everything else
 * 
 * Usage: node --env-file=.env scripts/apply-migration-5.mjs
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

const { Client } = pg;

const migrationPath = resolve('supabase', 'migrations', '202605110005_schema_consolidation.sql');
const fullSql = readFileSync(migrationPath, 'utf-8');

// Split: enum additions vs everything else
const enumSection = fullSql.split('-- ─── 2.')[0]; // Everything before section 2
const restSection = '-- ─── 2.' + fullSql.split('-- ─── 2.')[1]; // Section 2 onwards

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('✅ Connected\n');

  // Phase 1: Enum additions (each must commit separately)
  console.log('🔧 Phase 1: Adding enum values...');
  const enumStatements = enumSection.match(/DO \$\$ BEGIN ALTER TYPE.*?END \$\$;/gs) || [];
  
  for (const stmt of enumStatements) {
    try {
      await client.query(stmt);
    } catch (err) {
      // duplicate_object is fine
      if (!err.message.includes('already exists')) {
        console.log(`   ⚠️ ${err.message}`);
      }
    }
  }
  console.log(`   ✅ ${enumStatements.length} enum values processed\n`);

  // Phase 2: Everything else
  console.log('🚀 Phase 2: Tables, indexes, RLS, seeds...');
  try {
    await client.query(restSection);
    console.log('   ✅ Success\n');
  } catch (err) {
    console.error(`   ❌ ${err.message}`);
    if (err.detail) console.error(`      ${err.detail}`);
    if (err.position) {
      const lines = restSection.slice(0, parseInt(err.position)).split('\n');
      console.error(`      Near line ${lines.length}: ${lines[lines.length - 1].trim()}`);
    }
    process.exit(1);
  }

  console.log('🎉 Migration 0005 applied successfully!\n');
} finally {
  await client.end();
}
