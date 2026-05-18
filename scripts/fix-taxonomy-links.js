/**
 * Fix seed: Use correct taxonomy type 'material' and correct capability slugs
 */
const pg = require('pg');
const DB = 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres';

// Corrected capability slugs (matching actual DB)
const CAPABILITY_MAP = {
  'apex-alloy': ['cnc-machining', 'heat-treatment', 'precision-engineering'],
  'titanforge': ['forging', 'heat-treatment', 'cnc-machining'],
  'novasteel': ['fabrication', 'laser-cutting', 'sheet-metal'],
  'vertex-precision': ['cnc-machining', 'precision-engineering', 'surface-finishing'],
  'bluepeak': ['fabrication', 'welding', 'sheet-metal'],
  'irongrid': ['sheet-metal', 'laser-cutting', 'fabrication'],
  'bharat-heavy': ['casting', 'cnc-machining', 'heat-treatment'],
  'steelcraft': ['die-casting', 'casting', 'cnc-machining'],
  'paramount': ['forging', 'cnc-machining', 'heat-treatment'],
  'balaji-metal': ['wire-drawing', 'extrusion', 'cnc-machining'],
  'kiran-engg': ['cnc-machining', 'precision-engineering', 'fabrication'],
  'mahavir': ['casting', 'cnc-machining', 'fabrication'],
  'ashoka-precision': ['cnc-machining', 'precision-engineering', 'surface-finishing'],
  'rathi-steel': ['sheet-metal', 'laser-cutting', 'fabrication'],
  'jindal-mf': ['die-casting', 'cnc-machining', 'surface-finishing'],
  'godrej-tooling': ['fabrication', 'welding', 'cnc-machining'],
  'lakshmi-precision': ['cnc-machining', 'precision-engineering', 'fabrication'],
  'krishna-forge': ['forging', 'heat-treatment', 'cnc-machining'],
  'ambica-engg': ['extrusion', 'cnc-machining', 'fabrication'],
  'tata-allied': ['cnc-machining', 'fabrication', 'welding'],
  'prashant-forgings': ['forging', 'heat-treatment', 'cnc-machining'],
  'meghna-steels': ['sheet-metal', 'laser-cutting', 'fabrication'],
  'precision-castparts': ['casting', 'cnc-machining', 'heat-treatment'],
  'haveli-engg': ['fabrication', 'welding', 'cnc-machining'],
  'sunrise-cnc': ['cnc-machining', 'precision-engineering', 'surface-finishing'],
  'bhagyalaxmi': ['casting', 'cnc-machining', 'extrusion'],
  'sanghvi-forging': ['forging', 'cnc-machining', 'heat-treatment'],
  'excel-precision': ['cnc-machining', 'precision-engineering', 'fabrication'],
  'jayshree-metals': ['extrusion', 'fabrication', 'cnc-machining'],
  'premier-alloys': ['casting', 'forging', 'heat-treatment'],
};

// Corrected product slugs — use 'material' type
const PRODUCT_MAP = {
  'apex-alloy': ['stainless-steel', 'alloy-steel', 'carbon-steel'],
  'titanforge': ['alloy-steel', 'carbon-steel', 'stainless-steel'],
  'novasteel': ['stainless-steel', 'carbon-steel', 'aluminum'],
  'vertex-precision': ['stainless-steel', 'titanium', 'nickel-alloys'],
  'bluepeak': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'irongrid': ['stainless-steel', 'carbon-steel', 'aluminum'],
  'bharat-heavy': ['carbon-steel', 'alloy-steel', 'iron'],
  'steelcraft': ['aluminum', 'carbon-steel', 'alloy-steel'],
  'paramount': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'balaji-metal': ['carbon-steel', 'galvanized-steel', 'alloy-steel'],
  'kiran-engg': ['alloy-steel', 'stainless-steel', 'carbon-steel'],
  'mahavir': ['stainless-steel', 'carbon-steel', 'alloy-steel'],
  'ashoka-precision': ['titanium', 'nickel-alloys', 'stainless-steel'],
  'rathi-steel': ['carbon-steel', 'stainless-steel', 'galvanized-steel'],
  'jindal-mf': ['alloy-steel', 'carbon-steel', 'tool-steel'],
  'godrej-tooling': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'lakshmi-precision': ['stainless-steel', 'alloy-steel', 'carbon-steel'],
  'krishna-forge': ['carbon-steel', 'alloy-steel', 'stainless-steel'],
  'ambica-engg': ['aluminum', 'copper', 'brass'],
  'tata-allied': ['alloy-steel', 'stainless-steel', 'carbon-steel'],
  'prashant-forgings': ['alloy-steel', 'carbon-steel', 'stainless-steel'],
  'meghna-steels': ['carbon-steel', 'stainless-steel', 'galvanized-steel'],
  'precision-castparts': ['titanium', 'nickel-alloys', 'inconel'],
  'haveli-engg': ['carbon-steel', 'stainless-steel', 'alloy-steel'],
  'sunrise-cnc': ['titanium', 'stainless-steel', 'nickel-alloys'],
  'bhagyalaxmi': ['brass', 'copper', 'aluminum'],
  'sanghvi-forging': ['carbon-steel', 'alloy-steel', 'stainless-steel'],
  'excel-precision': ['stainless-steel', 'alloy-steel', 'carbon-steel'],
  'jayshree-metals': ['aluminum', 'carbon-steel', 'stainless-steel'],
  'premier-alloys': ['nickel-alloys', 'titanium', 'inconel'],
};

async function run() {
  const c = new pg.Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const { rows: companies } = await c.query('SELECT id, slug FROM companies');
  const companyMap = {};
  companies.forEach(co => { companyMap[co.slug] = co.id; });

  const { rows: taxonomy } = await c.query('SELECT id, slug, type FROM taxonomy WHERE is_active = true');
  const taxMap = {};
  taxonomy.forEach(t => { taxMap[`${t.type}:${t.slug}`] = t.id; });

  // Clear old links and re-seed
  await c.query('DELETE FROM company_capabilities');
  await c.query('DELETE FROM company_products');

  // Capabilities
  let linked = 0;
  for (const [slug, caps] of Object.entries(CAPABILITY_MAP)) {
    const companyId = companyMap[slug];
    if (!companyId) continue;
    for (const cap of caps) {
      const taxId = taxMap[`capability:${cap}`];
      if (!taxId) { console.log(`  Missing cap: ${cap}`); continue; }
      await c.query('INSERT INTO company_capabilities (company_id, taxonomy_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [companyId, taxId]);
      linked++;
    }
  }
  console.log(`✅ ${linked} capability links.`);

  // Products (using 'material' type)
  linked = 0;
  for (const [slug, products] of Object.entries(PRODUCT_MAP)) {
    const companyId = companyMap[slug];
    if (!companyId) continue;
    for (const prod of products) {
      const taxId = taxMap[`material:${prod}`];
      if (!taxId) { console.log(`  Missing material: ${prod}`); continue; }
      await c.query('INSERT INTO company_products (company_id, taxonomy_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [companyId, taxId]);
      linked++;
    }
  }
  console.log(`✅ ${linked} product/material links.`);

  await c.end();
  console.log('Done.');
}

run().catch(console.error);
