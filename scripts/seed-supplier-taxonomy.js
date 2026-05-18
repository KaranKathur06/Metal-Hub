/**
 * Seed supplier-taxonomy relationships + enrich company metadata
 * Maps each of 30 companies to industries, capabilities, and products
 */
const pg = require('pg');

const DB = 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres';

// Supplier slug → [industry slugs]
const INDUSTRY_MAP = {
  'apex-alloy': ['automotive', 'aerospace', 'defense'],
  'titanforge': ['defense', 'infrastructure', 'energy'],
  'novasteel': ['infrastructure', 'consumer-goods', 'marine'],
  'vertex-precision': ['aerospace', 'medical', 'electronics'],
  'bluepeak': ['infrastructure', 'energy', 'mining'],
  'irongrid': ['automotive', 'consumer-goods', 'electronics'],
  'bharat-heavy': ['infrastructure', 'energy', 'mining'],
  'steelcraft': ['automotive', 'consumer-goods', 'electronics'],
  'paramount': ['oil-gas', 'energy', 'marine'],
  'balaji-metal': ['infrastructure', 'automotive', 'consumer-goods'],
  'kiran-engg': ['automotive', 'electronics', 'consumer-goods'],
  'mahavir': ['oil-gas', 'energy', 'infrastructure'],
  'ashoka-precision': ['aerospace', 'defense', 'medical'],
  'rathi-steel': ['infrastructure', 'automotive', 'energy'],
  'jindal-mf': ['automotive', 'consumer-goods', 'electronics'],
  'godrej-tooling': ['infrastructure', 'energy', 'mining'],
  'lakshmi-precision': ['oil-gas', 'automotive', 'energy'],
  'krishna-forge': ['automotive', 'defense', 'infrastructure'],
  'ambica-engg': ['electronics', 'consumer-goods', 'energy'],
  'tata-allied': ['automotive', 'aerospace', 'defense'],
  'prashant-forgings': ['automotive', 'defense', 'infrastructure'],
  'meghna-steels': ['infrastructure', 'automotive', 'consumer-goods'],
  'precision-castparts': ['aerospace', 'medical', 'defense'],
  'haveli-engg': ['oil-gas', 'energy', 'infrastructure'],
  'sunrise-cnc': ['aerospace', 'defense', 'medical'],
  'bhagyalaxmi': ['electronics', 'consumer-goods', 'infrastructure'],
  'sanghvi-forging': ['oil-gas', 'energy', 'infrastructure'],
  'excel-precision': ['oil-gas', 'automotive', 'energy'],
  'jayshree-metals': ['infrastructure', 'consumer-goods', 'electronics'],
  'premier-alloys': ['aerospace', 'oil-gas', 'marine'],
};

// Supplier slug → [capability slugs]
const CAPABILITY_MAP = {
  'apex-alloy': ['cnc-machining', 'heat-treatment', 'precision-machining'],
  'titanforge': ['forging', 'heat-treatment', 'machining'],
  'novasteel': ['fabrication', 'laser-cutting', 'sheet-metal'],
  'vertex-precision': ['cnc-machining', 'precision-machining', 'grinding'],
  'bluepeak': ['fabrication', 'welding', 'structural-steel'],
  'irongrid': ['sheet-metal', 'laser-cutting', 'fabrication'],
  'bharat-heavy': ['casting', 'machining', 'heat-treatment'],
  'steelcraft': ['die-casting', 'casting', 'machining'],
  'paramount': ['forging', 'machining', 'heat-treatment'],
  'balaji-metal': ['wire-drawing', 'extrusion', 'machining'],
  'kiran-engg': ['cnc-machining', 'precision-machining', 'turning'],
  'mahavir': ['casting', 'machining', 'fabrication'],
  'ashoka-precision': ['cnc-machining', 'precision-machining', 'grinding'],
  'rathi-steel': ['sheet-metal', 'laser-cutting', 'fabrication'],
  'jindal-mf': ['die-casting', 'machining', 'grinding'],
  'godrej-tooling': ['fabrication', 'welding', 'machining'],
  'lakshmi-precision': ['cnc-machining', 'precision-machining', 'turning'],
  'krishna-forge': ['forging', 'heat-treatment', 'machining'],
  'ambica-engg': ['extrusion', 'machining', 'fabrication'],
  'tata-allied': ['cnc-machining', 'fabrication', 'welding'],
  'prashant-forgings': ['forging', 'heat-treatment', 'machining'],
  'meghna-steels': ['sheet-metal', 'laser-cutting', 'fabrication'],
  'precision-castparts': ['casting', 'cnc-machining', 'heat-treatment'],
  'haveli-engg': ['fabrication', 'welding', 'machining'],
  'sunrise-cnc': ['cnc-machining', 'precision-machining', 'grinding'],
  'bhagyalaxmi': ['casting', 'machining', 'extrusion'],
  'sanghvi-forging': ['forging', 'machining', 'heat-treatment'],
  'excel-precision': ['cnc-machining', 'precision-machining', 'turning'],
  'jayshree-metals': ['extrusion', 'fabrication', 'machining'],
  'premier-alloys': ['casting', 'forging', 'heat-treatment'],
};

// Supplier slug → [product/material slugs]
const PRODUCT_MAP = {
  'apex-alloy': ['stainless-steel', 'alloy-steel', 'carbon-steel'],
  'titanforge': ['alloy-steel', 'carbon-steel', 'stainless-steel'],
  'novasteel': ['stainless-steel', 'carbon-steel', 'aluminum'],
  'vertex-precision': ['stainless-steel', 'titanium', 'nickel-alloys'],
  'bluepeak': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'irongrid': ['stainless-steel', 'carbon-steel', 'aluminum'],
  'bharat-heavy': ['carbon-steel', 'alloy-steel', 'stainless-steel'],
  'steelcraft': ['aluminum', 'carbon-steel', 'alloy-steel'],
  'paramount': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'balaji-metal': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'kiran-engg': ['alloy-steel', 'stainless-steel', 'carbon-steel'],
  'mahavir': ['stainless-steel', 'carbon-steel', 'alloy-steel'],
  'ashoka-precision': ['titanium', 'nickel-alloys', 'stainless-steel'],
  'rathi-steel': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'jindal-mf': ['alloy-steel', 'carbon-steel', 'stainless-steel'],
  'godrej-tooling': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'lakshmi-precision': ['stainless-steel', 'alloy-steel', 'carbon-steel'],
  'krishna-forge': ['carbon-steel', 'alloy-steel', 'stainless-steel'],
  'ambica-engg': ['aluminum', 'copper', 'brass'],
  'tata-allied': ['alloy-steel', 'stainless-steel', 'carbon-steel'],
  'prashant-forgings': ['alloy-steel', 'carbon-steel', 'stainless-steel'],
  'meghna-steels': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'precision-castparts': ['titanium', 'nickel-alloys', 'stainless-steel'],
  'haveli-engg': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'sunrise-cnc': ['titanium', 'stainless-steel', 'nickel-alloys'],
  'bhagyalaxmi': ['brass', 'copper', 'aluminum'],
  'sanghvi-forging': ['carbon-steel', 'alloy-steel', 'stainless-steel'],
  'excel-precision': ['stainless-steel', 'alloy-steel', 'carbon-steel'],
  'jayshree-metals': ['aluminum', 'carbon-steel', 'stainless-steel'],
  'premier-alloys': ['nickel-alloys', 'titanium', 'stainless-steel'],
};

const DESCRIPTIONS = {
  'apex-alloy': 'ISO 9001:2015 certified manufacturer of precision alloy components for automotive and aerospace. 25,000 sq ft facility with 5-axis CNC.',
  'titanforge': 'Full-service forging house with 2,500 MT press capacity serving defence, railways, and heavy engineering OEMs across South Asia.',
  'novasteel': 'Stainless steel fabrication specialists with laser cutting, TIG/MIG welding, and powder coating. Exporting to 12 countries.',
  'vertex-precision': 'Precision CNC machining with ±0.005mm tolerance for semiconductor, medical device, and instrumentation industries.',
  'bluepeak': 'Integrated industrial systems — structural steel, conveyors, material handling, and plant erection services.',
  'irongrid': 'Custom sheet metal fabrication with Trumpf laser cutting, Amada press brakes, and robotic welding cells.',
  'bharat-heavy': 'Large-scale casting facility producing CI, SG iron, and steel castings up to 8 MT single-piece weight.',
  'steelcraft': 'Multi-process manufacturing — die casting, gravity casting, sand casting, and investment casting under one roof.',
  'paramount': 'Ring rolling, open-die forging, and closed-die capability for flanges and fittings. API 6A certified.',
  'balaji-metal': 'Wire drawing and wire products — GI wire, MS wire, HB wire, and custom profiles for construction.',
  'kiran-engg': 'Precision turned components and fasteners for automotive Tier-1 suppliers. 200+ CNC turning centers.',
  'mahavir': 'Industrial valve and pipe fitting manufacturer. API 6A, API 600, and BS 1873 certified.',
  'ashoka-precision': 'Aerospace-grade precision with NADCAP accreditation. Inconel, titanium, and high-temp alloy machining.',
  'rathi-steel': 'Integrated steel processing — slitting, shearing, cut-to-length, and blanking for flat products.',
  'jindal-mf': 'Tool and die manufacturing with EDM, wire-cut, and surface grinding for injection molding and stamping.',
  'godrej-tooling': 'Heavy engineering fabrication for cement, power, and mining sectors. IS 2062 and ASME certified.',
  'lakshmi-precision': 'High-precision CNC machining for hydraulic components, pump housings, and valve bodies.',
  'krishna-forge': 'Open-die and closed-die forging specialists in carbon steel, alloy steel, and stainless steel.',
  'ambica-engg': 'Multi-metal processing — aluminium extrusion, copper bus-bars, and brass components.',
  'tata-allied': 'Modular tooling and fixtures for automotive assembly lines. Design-to-delivery in 4-6 weeks.',
  'prashant-forgings': 'Closed-die forging specialists for automotive drivetrain components. IATF 16949 certified.',
  'meghna-steels': 'Steel stockholding and processing — HR coils, CR sheets, GP sheets with quick turnaround.',
  'precision-castparts': 'Investment casting for aerospace turbine blades and medical implants. AS9100D certified.',
  'haveli-engg': 'Pressure vessel fabrication and heat exchanger manufacturing. ASME U stamp holder.',
  'sunrise-cnc': '5-axis CNC machining center for complex aerospace and defense parts with full traceability.',
  'bhagyalaxmi': 'Brass and copper components — fittings, valves, electrical connectors for 40+ years.',
  'sanghvi-forging': 'Seamless rolled rings and forged flanges DN100-DN3000 for oil & gas sector.',
  'excel-precision': 'Hydraulic cylinder manufacturing and precision boring services for fluid power industry.',
  'jayshree-metals': 'Aluminium extrusion profiles for construction, industrial, and solar sectors.',
  'premier-alloys': 'Specialty alloy manufacturing — Inconel, Monel, Hastelloy products for corrosion-resistant applications.',
};

const ENRICHMENT = {
  'apex-alloy': { est: 1999, emp: 250, iso: true, exp: true, rr: 98, cr: 96, arh: 2 },
  'titanforge': { est: 1996, emp: 500, iso: true, exp: true, rr: 95, cr: 94, arh: 4 },
  'novasteel': { est: 2016, emp: 120, iso: true, exp: true, rr: 92, cr: 90, arh: 6 },
  'vertex-precision': { est: 1989, emp: 180, iso: true, exp: true, rr: 99, cr: 98, arh: 1 },
  'bluepeak': { est: 2009, emp: 320, iso: true, exp: false, rr: 96, cr: 93, arh: 3 },
  'irongrid': { est: 2002, emp: 150, iso: true, exp: false, rr: 88, cr: 85, arh: 8 },
  'bharat-heavy': { est: 1979, emp: 400, iso: true, exp: true, rr: 97, cr: 95, arh: 2 },
  'steelcraft': { est: 2018, emp: 90, iso: true, exp: false, rr: 94, cr: 91, arh: 5 },
  'paramount': { est: 2006, emp: 200, iso: true, exp: true, rr: 93, cr: 92, arh: 4 },
  'balaji-metal': { est: 1994, emp: 75, iso: true, exp: false, rr: 91, cr: 88, arh: 3 },
  'kiran-engg': { est: 2012, emp: 100, iso: true, exp: false, rr: 96, cr: 94, arh: 2 },
  'mahavir': { est: 2004, emp: 160, iso: true, exp: true, rr: 95, cr: 93, arh: 4 },
  'ashoka-precision': { est: 2009, emp: 85, iso: true, exp: true, rr: 99, cr: 97, arh: 1 },
  'rathi-steel': { est: 1984, emp: 350, iso: true, exp: true, rr: 94, cr: 92, arh: 6 },
  'jindal-mf': { est: 2002, emp: 130, iso: true, exp: false, rr: 92, cr: 89, arh: 3 },
  'godrej-tooling': { est: 1974, emp: 600, iso: true, exp: true, rr: 98, cr: 96, arh: 2 },
  'lakshmi-precision': { est: 2006, emp: 110, iso: true, exp: false, rr: 97, cr: 95, arh: 3 },
  'krishna-forge': { est: 1989, emp: 200, iso: true, exp: true, rr: 93, cr: 91, arh: 5 },
  'ambica-engg': { est: 2014, emp: 80, iso: false, exp: false, rr: 90, cr: 87, arh: 4 },
  'tata-allied': { est: 1996, emp: 450, iso: true, exp: true, rr: 99, cr: 97, arh: 1 },
  'prashant-forgings': { est: 1992, emp: 280, iso: true, exp: true, rr: 96, cr: 94, arh: 3 },
  'meghna-steels': { est: 2009, emp: 60, iso: false, exp: false, rr: 91, cr: 88, arh: 8 },
  'precision-castparts': { est: 2004, emp: 150, iso: true, exp: true, rr: 98, cr: 96, arh: 2 },
  'haveli-engg': { est: 1999, emp: 180, iso: true, exp: true, rr: 95, cr: 93, arh: 4 },
  'sunrise-cnc': { est: 2016, emp: 70, iso: true, exp: true, rr: 97, cr: 95, arh: 2 },
  'bhagyalaxmi': { est: 1984, emp: 120, iso: true, exp: true, rr: 92, cr: 90, arh: 6 },
  'sanghvi-forging': { est: 1994, emp: 220, iso: true, exp: true, rr: 96, cr: 94, arh: 3 },
  'excel-precision': { est: 2010, emp: 95, iso: true, exp: false, rr: 94, cr: 92, arh: 4 },
  'jayshree-metals': { est: 2006, emp: 140, iso: true, exp: true, rr: 90, cr: 88, arh: 5 },
  'premier-alloys': { est: 2002, emp: 100, iso: true, exp: true, rr: 95, cr: 93, arh: 3 },
};

async function run() {
  const c = new pg.Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();
  console.log('Connected.');

  // Apply migration first
  const fs = require('fs');
  const migrationSql = fs.readFileSync('supabase/migrations/202605180011_relational_filter_engine.sql', 'utf8');
  try { await c.query(migrationSql); console.log('✅ Migration applied.'); } catch(e) { console.log('Migration note:', e.message); }

  // Get all companies
  const { rows: companies } = await c.query('SELECT id, slug FROM companies');
  const companyMap = {};
  companies.forEach(co => { companyMap[co.slug] = co.id; });

  // Get all taxonomy items
  const { rows: taxonomy } = await c.query('SELECT id, slug, type FROM taxonomy WHERE is_active = true');
  const taxMap = {};
  taxonomy.forEach(t => { taxMap[`${t.type}:${t.slug}`] = t.id; });

  console.log(`Companies: ${companies.length}, Taxonomy: ${taxonomy.length}`);

  // Seed junction tables
  let linked = 0;
  for (const [slug, industries] of Object.entries(INDUSTRY_MAP)) {
    const companyId = companyMap[slug];
    if (!companyId) continue;
    for (const ind of industries) {
      const taxId = taxMap[`industry:${ind}`];
      if (!taxId) { console.log(`  Missing industry: ${ind}`); continue; }
      await c.query('INSERT INTO company_industries (company_id, taxonomy_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [companyId, taxId]);
      linked++;
    }
  }
  console.log(`✅ ${linked} industry links.`);

  linked = 0;
  for (const [slug, caps] of Object.entries(CAPABILITY_MAP)) {
    const companyId = companyMap[slug];
    if (!companyId) continue;
    for (const cap of caps) {
      const taxId = taxMap[`capability:${cap}`];
      if (!taxId) { console.log(`  Missing capability: ${cap}`); continue; }
      await c.query('INSERT INTO company_capabilities (company_id, taxonomy_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [companyId, taxId]);
      linked++;
    }
  }
  console.log(`✅ ${linked} capability links.`);

  linked = 0;
  for (const [slug, products] of Object.entries(PRODUCT_MAP)) {
    const companyId = companyMap[slug];
    if (!companyId) continue;
    for (const prod of products) {
      const taxId = taxMap[`product_category:${prod}`];
      if (!taxId) { console.log(`  Missing product: ${prod}`); continue; }
      await c.query('INSERT INTO company_products (company_id, taxonomy_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [companyId, taxId]);
      linked++;
    }
  }
  console.log(`✅ ${linked} product links.`);

  // Enrich company metadata
  let enriched = 0;
  for (const [slug, data] of Object.entries(ENRICHMENT)) {
    const companyId = companyMap[slug];
    if (!companyId) continue;
    const desc = DESCRIPTIONS[slug] || '';
    await c.query(
      `UPDATE companies SET description=$1, established_year=$2, employee_count=$3, iso_certified=$4, export_capability=$5, response_rate=$6, completion_rate=$7, avg_response_hours=$8 WHERE id=$9`,
      [desc, data.est, data.emp, data.iso, data.exp, data.rr, data.cr, data.arh, companyId]
    );
    enriched++;
  }
  console.log(`✅ ${enriched} companies enriched.`);

  await c.end();
  console.log('Done.');
}

run().catch(console.error);
