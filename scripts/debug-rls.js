const pg = require('pg');
(async () => {
  const c = new pg.Client({ connectionString: 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres', ssl: { rejectUnauthorized: false } });
  await c.connect();

  const userId = '5be78de3-d6f7-470d-a8ee-430ba8ca69da';
  const email = 'kathurkaran077@gmail.com';

  // Check if profile already exists
  const { rows: existing } = await c.query('SELECT id, role FROM profiles WHERE id = $1', [userId]);
  
  if (existing.length > 0) {
    // Update existing
    await c.query('UPDATE profiles SET role = $1 WHERE id = $2', ['super_admin', userId]);
    console.log('✅ Updated existing profile to super_admin');
  } else {
    // Check table structure
    const { rows: cols } = await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND table_schema = 'public' ORDER BY ordinal_position`);
    console.log('Profile columns:', cols.map(c => c.column_name).join(', '));
    
    // Insert with user_id + timestamps
    await c.query(`
      INSERT INTO profiles (id, user_id, email, role, full_name, created_at, updated_at) 
      VALUES ($1, $1, $2, 'super_admin', 'Karan Kathur', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET role = 'super_admin', updated_at = NOW()
    `, [userId, email]);
    console.log('✅ Profile created with super_admin');
  }

  // Verify final state
  const { rows: verify } = await c.query(`
    SELECT p.role as db_role, au.raw_user_meta_data->>'role' as meta_role, au.raw_app_meta_data->>'role' as app_role
    FROM auth.users au LEFT JOIN profiles p ON p.id = au.id WHERE au.id = $1
  `, [userId]);
  console.log('Final state:', verify[0]);

  await c.end();
})();
