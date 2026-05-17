/**
 * Run migrations 0007 + 0008 against live Supabase
 */
import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres';

const files = [
  '202605170007_auth_fix_and_superadmin.sql',
  '202605170008_seed_marketplace_ecosystem.sql',
];

async function run() {
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase.');

  for (const file of files) {
    const sql = readFileSync(join(__dirname, '..', 'supabase', 'migrations', file), 'utf8');
    console.log(`\n── Running ${file} ──`);
    try {
      await client.query(sql);
      console.log(`✅ ${file} applied.`);
    } catch (err) {
      console.error(`❌ ${file} failed:`, err.message);
      // Continue with next migration
    }
  }

  await client.end();
  console.log('\nDone.');
}

run().catch(console.error);
