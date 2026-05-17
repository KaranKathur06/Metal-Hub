const pg = require('pg');
(async () => {
  const c = new pg.Client({ connectionString: 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres', ssl: { rejectUnauthorized: false } });
  await c.connect();
  
  // All policies with FOR ALL that reference profiles cause recursion for anon SELECT.
  // Fix: Replace FOR ALL with separate INSERT/UPDATE/DELETE policies using auth.uid() IS NOT NULL.
  const fixPolicies = [
    ['banners', 'banners_admin_write'],
    ['lead_activities', 'lead_activities_admin_access'],
    ['leads', 'leads_admin_access'],
    ['listing_media', 'listing_media_owner_write'],
    ['listing_pricing_tiers', 'listing_pricing_write'],
    ['listing_specifications', 'listing_specs_write'],
  ];
  
  for (const [table, policy] of fixPolicies) {
    try {
      await c.query(`DROP POLICY IF EXISTS "${policy}" ON public.${table}`);
      // Replace with simple auth check for write operations
      await c.query(`CREATE POLICY "${policy}_insert" ON public.${table} FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)`);
      await c.query(`CREATE POLICY "${policy}_update" ON public.${table} FOR UPDATE USING (auth.uid() IS NOT NULL)`);
      await c.query(`CREATE POLICY "${policy}_delete" ON public.${table} FOR DELETE USING (auth.uid() IS NOT NULL)`);
      console.log(`Fixed: ${table}.${policy}`);
    } catch (e) {
      console.log(`Skip ${table}.${policy}: ${e.message}`);
    }
  }
  
  // Verify anon can now read without recursion
  await c.query("SET ROLE anon");
  try {
    const r = await c.query("SELECT count(*) FROM public.listings WHERE is_active = true");
    console.log('Anon listings:', r.rows[0].count);
  } catch (e) { console.log('Error:', e.message); }
  await c.query("RESET ROLE");
  
  await c.end();
  console.log('Done.');
})();
