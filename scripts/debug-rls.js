const pg = require('pg');
const fs = require('fs');
(async () => {
  const c = new pg.Client({ connectionString: 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres', ssl: { rejectUnauthorized: false } });
  await c.connect();
  const sql = fs.readFileSync('supabase/migrations/202605170010_fix_recursive_policies.sql', 'utf8');
  try { await c.query(sql); console.log('OK'); } catch(e) { console.error(e.message); }
  
  // Verify fix
  await c.query("SET ROLE anon");
  try {
    const r1 = await c.query("SELECT count(*) FROM public.listings WHERE is_active = true");
    console.log('Anon listings:', r1.rows[0].count);
  } catch(e) { console.log('Listings error:', e.message); }
  try {
    const r2 = await c.query("SELECT count(*) FROM public.companies WHERE verification_status = 'approved'");
    console.log('Anon companies:', r2.rows[0].count);
  } catch(e) { console.log('Companies error:', e.message); }
  await c.query("RESET ROLE");
  await c.end();
})();
