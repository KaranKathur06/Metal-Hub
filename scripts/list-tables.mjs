import pg from 'pg';
const { Client } = pg;
const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

const tables = ['taxonomy', 'countries', 'states', 'platform_settings', 'listings', 'banners', 'profiles'];

for (const table of tables) {
  const rls = await c.query(`SELECT relrowsecurity FROM pg_class WHERE relname = $1 AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')`, [table]);
  const r = await c.query(`SELECT policyname, cmd FROM pg_policies WHERE tablename = $1 AND schemaname = 'public'`, [table]);
  const rlsOn = rls.rows[0]?.relrowsecurity ? '✅ RLS ON' : '❌ RLS OFF';
  const policies = r.rows.map(p => `${p.cmd}:${p.policyname}`).join(', ');
  console.log(`${rlsOn} ${table}: ${r.rows.length} policies → ${policies || 'none'}`);
}

// Check grants on taxonomy for anon role
const g = await c.query(`
  SELECT privilege_type FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name = 'taxonomy' AND grantee = 'anon'
`);
console.log(`\nanon grants on taxonomy: ${g.rows.map(x => x.privilege_type).join(', ') || 'NONE'}`);

await c.end();
