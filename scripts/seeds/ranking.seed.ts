import { pool } from "./client";

export async function seedRankingSettings() {
    await pool.query(`
    insert into public.marketplace_settings_versions (
      version_name,
      status,
      is_active,
      activated_at,
      notes,
      seeded_supplier_weight,
      seeded_rfq_weight,
      real_supplier_boost,
      real_rfq_boost
    )
    select
      'Default Marketplace Ranking v1',
      'active',
      true,
      now(),
      'Seeded ranking configuration for MetalHub discovery.',
      0.7,
      0.7,
      1.5,
      1.5
    where not exists (
      select 1 from public.marketplace_settings_versions where is_active = true
    );
  `);
}
