// Run: node scripts/setup-taxonomy-direct.mjs
// Creates taxonomy table and seeds data using direct PostgreSQL connection
import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL
  || 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres';

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  console.log('✅ Connected to database\n');

  // ── 1. Create taxonomy table ──
  console.log('📋 Creating taxonomy table...');
  await client.query(`
    create table if not exists public.taxonomy (
      id uuid default gen_random_uuid() primary key,
      name text not null,
      slug text not null unique,
      type text not null check (type in ('industry','capability','category','subcategory','process','material')),
      parent_id uuid references public.taxonomy(id),
      industry_code text,
      icon text,
      description text,
      seo_title text,
      seo_description text,
      sort_order int default 0,
      is_active boolean default true,
      deleted_at timestamptz,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
  `);
  console.log('  ✅ taxonomy table ready\n');

  // ── 2. Create indexes ──
  console.log('📋 Creating indexes...');
  await client.query(`create index if not exists idx_taxonomy_type on public.taxonomy(type);`);
  await client.query(`create index if not exists idx_taxonomy_parent on public.taxonomy(parent_id);`);
  await client.query(`create index if not exists idx_taxonomy_active on public.taxonomy(is_active) where is_active = true;`);
  console.log('  ✅ indexes ready\n');

  // ── 3. Enable RLS + add read policy ──
  console.log('🔒 Setting up RLS...');
  await client.query(`alter table public.taxonomy enable row level security;`);
  await client.query(`
    do $$ begin
      if not exists (select 1 from pg_policies where tablename = 'taxonomy' and policyname = 'taxonomy_public_read') then
        create policy taxonomy_public_read on public.taxonomy for select using (is_active = true and deleted_at is null);
      end if;
    end $$;
  `);
  console.log('  ✅ RLS enabled with public read policy\n');

  // ── 4. Seed Industries ──
  console.log('🏭 Seeding Industries...');
  const industries = [
    { name: 'Aerospace', slug: 'aerospace', icon: 'Factory', desc: 'High-strength fasteners, landing gear parts, and structural assemblies.', code: 'AERO', sort: 10 },
    { name: 'Defense', slug: 'defense', icon: 'ShieldCheck', desc: 'Forged housings, armor brackets, and mission-critical structural parts.', code: 'DEF', sort: 20 },
    { name: 'Automotive', slug: 'automotive', icon: 'Truck', desc: 'Engine components, chassis parts, and precision automotive assemblies.', code: 'AUTO', sort: 30 },
    { name: 'Oil & Gas', slug: 'oil-gas', icon: 'GitBranch', desc: 'Valve bodies, flange blocks, and downhole drilling components.', code: 'OG', sort: 40 },
    { name: 'Energy', slug: 'energy', icon: 'Zap', desc: 'Solar mounting parts, wind turbine brackets, and battery enclosures.', code: 'ENRG', sort: 50 },
    { name: 'Construction', slug: 'construction', icon: 'Building2', desc: 'Structural steel, reinforcement bars, and construction hardware.', code: 'CONST', sort: 60 },
    { name: 'Railways', slug: 'railways', icon: 'Truck', desc: 'Rail fasteners, bogies, couplings, and railway infrastructure components.', code: 'RAIL', sort: 70 },
    { name: 'Marine & Shipbuilding', slug: 'marine-shipbuilding', icon: 'Factory', desc: 'Marine-grade alloys, hull components, and shipboard equipment.', code: 'MAR', sort: 80 },
    { name: 'Infrastructure', slug: 'infrastructure', icon: 'Building2', desc: 'Large welded frames, PEB structures, and assemblies for infrastructure.', code: 'INFRA', sort: 90 },
    { name: 'Industrial Equipment', slug: 'industrial-equipment', icon: 'Cog', desc: 'Heavy machinery components, hydraulic systems, and industrial tools.', code: 'INDEQ', sort: 100 },
    { name: 'Consumer Goods', slug: 'consumer-goods', icon: 'Package', desc: 'Metal frames, brackets, and assemblies for appliances and home equipment.', code: 'CG', sort: 110 },
    { name: 'Mining', slug: 'mining', icon: 'Wrench', desc: 'Crushing equipment, conveyor parts, and mining infrastructure components.', code: 'MINE', sort: 120 },
  ];

  for (const ind of industries) {
    await client.query(`
      insert into public.taxonomy (name, slug, type, icon, description, industry_code, sort_order)
      values ($1, $2, 'industry', $3, $4, $5, $6)
      on conflict (slug) do update set name=excluded.name, icon=excluded.icon, description=excluded.description, industry_code=excluded.industry_code, sort_order=excluded.sort_order, updated_at=now()
    `, [ind.name, ind.slug, ind.icon, ind.desc, ind.code, ind.sort]);
    console.log(`  ✅ ${ind.name}`);
  }

  // ── 5. Seed Capabilities ──
  console.log('\n⚙️ Seeding Capabilities...');
  const capabilities = [
    { name: 'Casting', slug: 'casting', icon: 'Factory', desc: 'Sand casting, die casting, investment casting, and precision cast components.', sort: 10 },
    { name: 'Forging', slug: 'forging', icon: 'Wrench', desc: 'Open die forging, closed die forging, and high-strength forged parts.', sort: 20 },
    { name: 'CNC Machining', slug: 'cnc-machining', icon: 'Cog', desc: 'CNC turning, milling, grinding, and precision machining services.', sort: 30 },
    { name: 'Fabrication', slug: 'fabrication', icon: 'Building2', desc: 'Custom sheet metal, structural, and industrial fabrication services.', sort: 40 },
    { name: 'Extrusion', slug: 'extrusion', icon: 'GitBranch', desc: 'Aluminum extrusion, plastic extrusion, and custom profile manufacturing.', sort: 50 },
    { name: 'Heat Treatment', slug: 'heat-treatment', icon: 'Zap', desc: 'Annealing, hardening, tempering, carburizing, and surface hardening.', sort: 60 },
    { name: 'Surface Finishing', slug: 'surface-finishing', icon: 'ShieldCheck', desc: 'Plating, coating, painting, anodizing, and surface treatment services.', sort: 70 },
    { name: 'Assembly', slug: 'assembly', icon: 'Package', desc: 'Sub-assembly, final assembly, and turnkey manufacturing solutions.', sort: 80 },
    { name: 'Precision Engineering', slug: 'precision-engineering', icon: 'Cog', desc: 'Tight tolerance machining, gauge making, and precision components.', sort: 90 },
    { name: 'Sheet Metal', slug: 'sheet-metal', icon: 'Building2', desc: 'Laser cutting, bending, punching, and sheet metal fabrication.', sort: 100 },
    { name: 'Welding', slug: 'welding', icon: 'Zap', desc: 'MIG, TIG, arc, spot welding, and certified welding services.', sort: 110 },
    { name: 'Wire Drawing', slug: 'wire-drawing', icon: 'GitBranch', desc: 'Industrial wire drawing for diverse metal grades and specifications.', sort: 120 },
  ];

  for (const cap of capabilities) {
    await client.query(`
      insert into public.taxonomy (name, slug, type, icon, description, sort_order)
      values ($1, $2, 'capability', $3, $4, $5)
      on conflict (slug) do update set name=excluded.name, icon=excluded.icon, description=excluded.description, sort_order=excluded.sort_order, updated_at=now()
    `, [cap.name, cap.slug, cap.icon, cap.desc, cap.sort]);
    console.log(`  ✅ ${cap.name}`);
  }

  // ── 6. Seed Product Categories ──
  console.log('\n📦 Seeding Product Categories...');
  const categories = [
    { name: 'Raw Materials', slug: 'raw-materials', icon: 'Package', desc: 'Billets, ingots, bars, and raw metal stock for industrial manufacturing.', sort: 10 },
    { name: 'Steel Products', slug: 'steel-products', icon: 'Factory', desc: 'Structural steel, stainless steel, tool steel, and specialty alloys.', sort: 20 },
    { name: 'Aluminum Products', slug: 'aluminum-products', icon: 'Building2', desc: 'Aluminum sheets, profiles, extrusions, and lightweight alloy products.', sort: 30 },
    { name: 'Pipes & Tubes', slug: 'pipes-tubes', icon: 'GitBranch', desc: 'Seamless pipes, welded tubes, ERW pipes, and tubular products.', sort: 40 },
    { name: 'Fasteners', slug: 'fasteners', icon: 'Wrench', desc: 'Bolts, nuts, screws, washers, and industrial fastening systems.', sort: 50 },
    { name: 'Industrial Components', slug: 'industrial-components', icon: 'Cog', desc: 'Gears, shafts, bearings, bushings, and precision components.', sort: 60 },
    { name: 'Fabricated Parts', slug: 'fabricated-parts', icon: 'Building2', desc: 'Custom fabricated assemblies, weldments, and structural parts.', sort: 70 },
    { name: 'Castings', slug: 'castings', icon: 'Factory', desc: 'Sand castings, die castings, investment castings, and precision castings.', sort: 80 },
    { name: 'Forgings', slug: 'forgings', icon: 'Wrench', desc: 'Open die forgings, closed die forgings, and custom forged components.', sort: 90 },
    { name: 'Industrial Machinery', slug: 'industrial-machinery-products', icon: 'Truck', desc: 'CNC machines, presses, lathes, and manufacturing equipment.', sort: 100 },
    { name: 'Electrical Components', slug: 'electrical-components', icon: 'Zap', desc: 'Transformers, panels, connectors, and electrical infrastructure.', sort: 110 },
    { name: 'Safety Equipment', slug: 'safety-equipment', icon: 'ShieldCheck', desc: 'PPE, safety systems, fire protection, and industrial safety gear.', sort: 120 },
  ];

  for (const cat of categories) {
    await client.query(`
      insert into public.taxonomy (name, slug, type, icon, description, sort_order)
      values ($1, $2, 'category', $3, $4, $5)
      on conflict (slug) do update set name=excluded.name, icon=excluded.icon, description=excluded.description, sort_order=excluded.sort_order, updated_at=now()
    `, [cat.name, cat.slug, cat.icon, cat.desc, cat.sort]);
    console.log(`  ✅ ${cat.name}`);
  }

  // ── 7. Verify ──
  const { rows } = await client.query(`select type, count(*) as cnt from public.taxonomy where is_active = true group by type order by type`);
  console.log('\n📊 Taxonomy Summary:');
  rows.forEach(r => console.log(`  ${r.type}: ${r.cnt} items`));

  await client.end();
  console.log('\n✅ Database setup complete!');
}

run().catch((err) => { console.error('❌ Fatal:', err.message); process.exit(1); });
