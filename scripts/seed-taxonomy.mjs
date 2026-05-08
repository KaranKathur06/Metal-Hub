// Run: node scripts/seed-taxonomy.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lrfvfvxfjpowskzqebar.supabase.co';
// Use service role key or anon key — for seeding public tables, anon is fine if RLS allows inserts
// Fallback: use the database URL directly
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('ERROR: Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY env var');
  console.log('Usage: $env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"; node scripts/seed-taxonomy.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CAPABILITIES = [
  { name: 'Casting', slug: 'casting', type: 'capability', icon: 'Factory', description: 'Sand casting, die casting, investment casting, and precision cast components.', sort_order: 10 },
  { name: 'Forging', slug: 'forging', type: 'capability', icon: 'Wrench', description: 'Open die forging, closed die forging, and high-strength forged parts.', sort_order: 20 },
  { name: 'CNC Machining', slug: 'cnc-machining', type: 'capability', icon: 'Cog', description: 'CNC turning, milling, grinding, and precision machining services.', sort_order: 30 },
  { name: 'Fabrication', slug: 'fabrication', type: 'capability', icon: 'Building2', description: 'Custom sheet metal, structural, and industrial fabrication services.', sort_order: 40 },
  { name: 'Extrusion', slug: 'extrusion', type: 'capability', icon: 'GitBranch', description: 'Aluminum extrusion, plastic extrusion, and custom profile manufacturing.', sort_order: 50 },
  { name: 'Heat Treatment', slug: 'heat-treatment', type: 'capability', icon: 'Zap', description: 'Annealing, hardening, tempering, carburizing, and surface hardening.', sort_order: 60 },
  { name: 'Surface Finishing', slug: 'surface-finishing', type: 'capability', icon: 'ShieldCheck', description: 'Plating, coating, painting, anodizing, and surface treatment services.', sort_order: 70 },
  { name: 'Assembly', slug: 'assembly', type: 'capability', icon: 'Package', description: 'Sub-assembly, final assembly, and turnkey manufacturing solutions.', sort_order: 80 },
  { name: 'Precision Engineering', slug: 'precision-engineering', type: 'capability', icon: 'Cog', description: 'Tight tolerance machining, gauge making, and precision components.', sort_order: 90 },
  { name: 'Sheet Metal', slug: 'sheet-metal', type: 'capability', icon: 'Building2', description: 'Laser cutting, bending, punching, and sheet metal fabrication.', sort_order: 100 },
  { name: 'Welding', slug: 'welding', type: 'capability', icon: 'Zap', description: 'MIG, TIG, arc, spot welding, and certified welding services.', sort_order: 110 },
  { name: 'Wire Drawing', slug: 'wire-drawing', type: 'capability', icon: 'GitBranch', description: 'Industrial wire drawing for diverse metal grades and specifications.', sort_order: 120 },
];

const CATEGORIES = [
  { name: 'Raw Materials', slug: 'raw-materials', type: 'category', icon: 'Package', description: 'Billets, ingots, bars, and raw metal stock for industrial manufacturing.', sort_order: 10 },
  { name: 'Steel Products', slug: 'steel-products', type: 'category', icon: 'Factory', description: 'Structural steel, stainless steel, tool steel, and specialty alloys.', sort_order: 20 },
  { name: 'Aluminum Products', slug: 'aluminum-products', type: 'category', icon: 'Building2', description: 'Aluminum sheets, profiles, extrusions, and lightweight alloy products.', sort_order: 30 },
  { name: 'Pipes & Tubes', slug: 'pipes-tubes', type: 'category', icon: 'GitBranch', description: 'Seamless pipes, welded tubes, ERW pipes, and tubular products.', sort_order: 40 },
  { name: 'Fasteners', slug: 'fasteners', type: 'category', icon: 'Wrench', description: 'Bolts, nuts, screws, washers, and industrial fastening systems.', sort_order: 50 },
  { name: 'Industrial Components', slug: 'industrial-components', type: 'category', icon: 'Cog', description: 'Gears, shafts, bearings, bushings, and precision components.', sort_order: 60 },
  { name: 'Fabricated Parts', slug: 'fabricated-parts', type: 'category', icon: 'Building2', description: 'Custom fabricated assemblies, weldments, and structural parts.', sort_order: 70 },
  { name: 'Castings', slug: 'castings', type: 'category', icon: 'Factory', description: 'Sand castings, die castings, investment castings, and precision castings.', sort_order: 80 },
  { name: 'Forgings', slug: 'forgings', type: 'category', icon: 'Wrench', description: 'Open die forgings, closed die forgings, and custom forged components.', sort_order: 90 },
  { name: 'Industrial Machinery', slug: 'industrial-machinery-products', type: 'category', icon: 'Truck', description: 'CNC machines, presses, lathes, and manufacturing equipment.', sort_order: 100 },
  { name: 'Electrical Components', slug: 'electrical-components', type: 'category', icon: 'Zap', description: 'Transformers, panels, connectors, and electrical infrastructure.', sort_order: 110 },
  { name: 'Safety Equipment', slug: 'safety-equipment', type: 'category', icon: 'ShieldCheck', description: 'PPE, safety systems, fire protection, and industrial safety gear.', sort_order: 120 },
];

async function seed() {
  console.log('🏭 Seeding Capabilities...');
  for (const cap of CAPABILITIES) {
    const { error } = await supabase.from('taxonomy').upsert(cap, { onConflict: 'slug' });
    if (error) console.error(`  ❌ ${cap.name}: ${error.message}`);
    else console.log(`  ✅ ${cap.name}`);
  }

  console.log('\n📦 Seeding Product Categories...');
  for (const cat of CATEGORIES) {
    const { error } = await supabase.from('taxonomy').upsert(cat, { onConflict: 'slug' });
    if (error) console.error(`  ❌ ${cat.name}: ${error.message}`);
    else console.log(`  ✅ ${cat.name}`);
  }

  console.log('\n✅ Taxonomy seed complete!');
}

seed().catch(console.error);
