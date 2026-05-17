import pg from 'pg';

const DB = process.env.DATABASE_URL || 'postgresql://postgres:Supabase%402323@db.lrfvfvxfjpowskzqebar.supabase.co:5432/postgres';

const SUPPLIERS = [
  ['Apex Alloy Industries', 'apex-alloy', 'Rajkot', 'Gujarat', 'ISO 9001:2015 certified manufacturer of precision alloy components for automotive and aerospace.', 25, 250, 98, 2],
  ['TitanForge Engineering Pvt Ltd', 'titanforge', 'Pune', 'Maharashtra', 'Full-service forging house with 2,500 MT press capacity serving defence and railways.', 28, 500, 95, 4],
  ['NovaSteel Components', 'novasteel', 'Chennai', 'Tamil Nadu', 'Stainless steel fabrication specialists with laser cutting and TIG welding.', 8, 120, 92, 6],
  ['Vertex Precision Metals', 'vertex-precision', 'Coimbatore', 'Tamil Nadu', 'Precision CNC machining with ±0.005mm tolerance for semiconductor and medical.', 35, 180, 99, 1],
  ['BluePeak Industrial Systems', 'bluepeak', 'Mumbai', 'Maharashtra', 'Integrated industrial systems — structural steel, conveyors, material handling.', 15, 320, 96, 3],
  ['IronGrid Fabrication Works', 'irongrid', 'Ahmedabad', 'Gujarat', 'Custom sheet metal fabrication with Trumpf laser and Amada press brakes.', 22, 150, 88, 8],
  ['Bharat Heavy Metallics', 'bharat-heavy', 'Surat', 'Gujarat', 'Large-scale casting facility producing CI and SG iron castings up to 8 MT.', 45, 400, 97, 2],
  ['SteelCraft Manufacturing', 'steelcraft', 'Vadodara', 'Gujarat', 'Multi-process manufacturing — die casting, gravity casting, investment casting.', 6, 90, 94, 5],
  ['Paramount Castings & Forgings', 'paramount', 'Bengaluru', 'Karnataka', 'Ring rolling, open-die forging, and closed-die capability for flanges.', 18, 200, 93, 4],
  ['Shree Balaji Metal Tech', 'balaji-metal', 'Faridabad', 'Haryana', 'Wire drawing and wire products — GI wire, MS wire, HB wire, custom profiles.', 30, 75, 91, 3],
  ['Kiran Engineering Works', 'kiran-engg', 'Rajkot', 'Gujarat', 'Precision turned components and fasteners for automotive Tier-1 suppliers.', 12, 100, 96, 2],
  ['Mahavir Industrial Products', 'mahavir', 'Ahmedabad', 'Gujarat', 'Industrial valve and pipe fitting manufacturer. API 6A certified.', 20, 160, 95, 4],
  ['Ashoka Precision Components', 'ashoka-precision', 'Pune', 'Maharashtra', 'Aerospace-grade precision with NADCAP accreditation. Inconel and titanium.', 15, 85, 99, 1],
  ['Rathi Steel & Power Ltd', 'rathi-steel', 'Mumbai', 'Maharashtra', 'Integrated steel processing — slitting, shearing, cut-to-length, blanking.', 40, 350, 94, 6],
  ['Jindal Metalforming Solutions', 'jindal-mf', 'Chennai', 'Tamil Nadu', 'Tool and die manufacturing with EDM, wire-cut, and surface grinding.', 22, 130, 92, 3],
  ['Godrej Tooling Division', 'godrej-tooling', 'Mumbai', 'Maharashtra', 'Heavy engineering fabrication for cement, power, and mining sectors.', 50, 600, 98, 2],
  ['Lakshmi Precision Machining', 'lakshmi-precision', 'Coimbatore', 'Tamil Nadu', 'High-precision CNC machining for hydraulic components and pump housings.', 18, 110, 97, 3],
  ['Krishna Forge & Foundry', 'krishna-forge', 'Rajkot', 'Gujarat', 'Open-die and closed-die forging specialists in carbon and alloy steel.', 35, 200, 93, 5],
  ['Ambica Engineering Corp', 'ambica-engg', 'Surat', 'Gujarat', 'Multi-metal processing — aluminium extrusion, copper bus-bars, brass.', 10, 80, 90, 4],
  ['Tata Allied Industries', 'tata-allied', 'Bengaluru', 'Karnataka', 'Modular tooling and fixtures for automotive assembly lines.', 28, 450, 99, 1],
  ['Prashant Forgings Ltd', 'prashant-forgings', 'Pune', 'Maharashtra', 'Closed-die forging specialists for automotive drivetrain components.', 32, 280, 96, 3],
  ['Meghna Steels Pvt Ltd', 'meghna-steels', 'Ahmedabad', 'Gujarat', 'Steel stockholding and processing — HR coils, CR sheets, GP sheets.', 15, 60, 91, 8],
  ['Precision Castparts India', 'precision-castparts', 'Chennai', 'Tamil Nadu', 'Investment casting for aerospace turbine blades and medical implants.', 20, 150, 98, 2],
  ['Haveli Engineering', 'haveli-engg', 'Vadodara', 'Gujarat', 'Pressure vessel fabrication and heat exchanger manufacturing. ASME U stamp.', 25, 180, 95, 4],
  ['Sunrise CNC Technologies', 'sunrise-cnc', 'Bengaluru', 'Karnataka', '5-axis CNC machining center for complex aerospace and defense parts.', 8, 70, 97, 2],
  ['Bhagyalaxmi Metals', 'bhagyalaxmi', 'Rajkot', 'Gujarat', 'Brass and copper components — fittings, valves, electrical connectors.', 40, 120, 92, 6],
  ['Sanghvi Forging & Engg', 'sanghvi-forging', 'Mumbai', 'Maharashtra', 'Seamless rolled rings and forged flanges DN100-DN3000.', 30, 220, 96, 3],
  ['Excel Precision Engineering', 'excel-precision', 'Coimbatore', 'Tamil Nadu', 'Hydraulic cylinder manufacturing and precision boring services.', 14, 95, 94, 4],
  ['Jayshree Metals', 'jayshree-metals', 'Surat', 'Gujarat', 'Aluminium extrusion profiles for construction and industrial sectors.', 18, 140, 90, 5],
  ['Premier Alloys & Chemicals', 'premier-alloys', 'Faridabad', 'Haryana', 'Specialty alloy manufacturing — Inconel, Monel, Hastelloy products.', 22, 100, 95, 3],
];

const LISTINGS = [
  ['SS 304 Flanges — ASTM A182, DN50–DN600', 'ss-304-flanges', 'Stainless Steel', 'SS 304', 42500, 65000, 'per MT', '50 pcs', '15-20 days', '{ISO 9001,PED}', true],
  ['Forged Crankshafts — EN8/EN19, up to 500 kg', 'forged-crankshafts', 'Alloy Steel', 'EN8/EN19', 185000, 320000, 'per piece', '5 pcs', '25-30 days', '{ISO 9001,IATF 16949}', true],
  ['Aluminium Die Cast Housings — ADC12/A380', 'aluminium-die-cast-housings', 'Aluminium', 'ADC12', 78000, 120000, 'per MT', '100 pcs', '20-25 days', '{ISO 9001}', false],
  ['CNC Machined Valve Bodies — SS 316L', 'cnc-machined-valve-bodies', 'Stainless Steel', 'SS 316L', 125000, 180000, 'per MT', '25 pcs', '10-15 days', '{ISO 9001,AS9100D}', true],
  ['Copper Bus Bars — ETP Grade, Custom Profiles', 'copper-bus-bars', 'Copper', 'ETP', 85000, 95000, 'per MT', '200 kg', '7-10 days', '{ISO 9001,BIS}', false],
  ['Ring Rolled Flanges DN100-DN3000', 'ring-rolled-flanges', 'Carbon Steel', 'ASTM A105', 55000, 75000, 'per MT', '10 pcs', '20-25 days', '{ISO 9001,PED}', true],
  ['Precision Turned Shafts — EN24 Hardened', 'precision-turned-shafts', 'Alloy Steel', 'EN24', 2800, 4500, 'per piece', '50 pcs', '15-20 days', '{ISO 9001,IATF 16949}', false],
  ['SG Iron Pump Housings — Grade 500/7', 'sg-iron-pump-housings', 'Iron', 'SG 500/7', 45000, 62000, 'per MT', '20 pcs', '30-35 days', '{ISO 9001}', false],
  ['Titanium Aerospace Brackets — Grade 5', 'titanium-aerospace-brackets', 'Titanium', 'Ti-6Al-4V', 450000, 680000, 'per MT', '10 pcs', '30-45 days', '{AS9100D,NADCAP}', true],
  ['Laser Cut Sheet Metal Enclosures', 'laser-cut-enclosures', 'Stainless Steel', 'SS 304', 3500, 8000, 'per piece', '25 pcs', '10-12 days', '{ISO 9001,CE}', false],
  ['Inconel 718 Turbine Disc Forgings', 'inconel-turbine-forgings', 'Nickel Alloys', 'Inconel 718', 950000, 1200000, 'per MT', '2 pcs', '45-60 days', '{NADCAP,AS9100D}', true],
  ['GI Binding Wire — 18 to 22 SWG', 'gi-binding-wire', 'Galvanized Steel', 'IS 280', 68000, 72000, 'per MT', '1 MT', '5-7 days', '{BIS,ISO 9001}', false],
  ['Brass Compression Fittings — 1/4" to 2"', 'brass-compression-fittings', 'Brass', 'CW617N', 420, 850, 'per piece', '500 pcs', '7-10 days', '{ISO 9001}', false],
  ['HR Coil Slitting — 1.6mm to 12mm', 'hr-coil-slitting', 'Carbon Steel', 'IS 2062 E250', 52000, 56000, 'per MT', '5 MT', '3-5 days', '{ISO 9001,BIS}', false],
  ['Injection Mold Tool Steel — H13 Blocks', 'h13-tool-steel-blocks', 'Tool Steel', 'H13', 280000, 320000, 'per MT', '100 kg', '5-7 days', '{ISO 9001}', false],
  ['Custom Forged Railway Couplers', 'forged-railway-couplers', 'Alloy Steel', 'AAR M-201', 28000, 45000, 'per piece', '20 pcs', '30-40 days', '{ISO 9001,RDSO}', true],
  ['Aluminium Extrusion Profiles — 6063 T6', 'aluminium-extrusion-6063', 'Aluminum', '6063 T6', 280000, 310000, 'per MT', '500 kg', '10-15 days', '{ISO 9001,BIS}', false],
  ['Pressure Vessel Shell Plates — SA516 Gr70', 'pressure-vessel-plates', 'Carbon Steel', 'SA516 Gr70', 72000, 85000, 'per MT', '2 MT', '7-10 days', '{ASME,ISO 9001}', false],
];

const RFQS = [
  ['CNC Machined Shafts — EN19, Qty 500', 'Need 500 pcs CNC machined shafts in EN19 material, tolerance ±0.01mm. Annual contract possible.', 'Alloy Steel', '500 pieces', '₹2,500-4,000/pc', 'Pune', 'open'],
  ['SS 316L Flanges for Pharma Plant', 'Require ASTM A182 flanges in SS 316L for pharmaceutical plant expansion. Need MTCs.', 'Stainless Steel', '200 pieces', '₹45,000-65,000/MT', 'Ahmedabad', 'open'],
  ['Aluminium Die Cast Housing for EV Motor', 'Looking for ADC12 die cast motor housings for electric vehicle application. Prototype + production.', 'Aluminium', '10,000 pieces', '₹180-250/pc', 'Bengaluru', 'open'],
  ['Forged Crankshafts for Diesel Generators', 'EN8 forged crankshafts for 25KVA-100KVA diesel generators. Machined and balanced.', 'Alloy Steel', '100 pieces', '₹18,000-28,000/pc', 'Chennai', 'open'],
  ['Laser Cut SS Sheets — 1mm to 6mm', 'Need laser cutting services for SS 304 sheets. Multiple designs, repeat orders.', 'Stainless Steel', '500 sheets/month', '₹80-150/kg', 'Mumbai', 'open'],
  ['Copper Busbar for Transformer Manufacturer', 'ETP grade copper busbars, custom profiles, tinned finish. Regular monthly requirement.', 'Copper', '2 MT/month', '₹750-850/kg', 'Vadodara', 'open'],
  ['Titanium Aerospace Brackets — Grade 5', 'Ti-6Al-4V brackets per AS9100D, full traceability required. Defense project.', 'Titanium', '50 pieces', '₹8,000-15,000/pc', 'Bengaluru', 'open'],
  ['CI Manhole Covers — IS 1726', 'Ductile iron manhole covers for municipal water supply project. BIS certified.', 'Iron', '5,000 pieces', '₹800-1,200/pc', 'Pune', 'open'],
  ['Inconel 625 Weld Overlay Pipes', 'CRA clad pipes with Inconel 625 weld overlay for offshore platform.', 'Nickel Alloys', '200 meters', '₹15,000-22,000/m', 'Mumbai', 'open'],
  ['Precision Gears Module 2-6', 'Spur and helical gears in EN36 material, case hardened. For gearbox assembly.', 'Alloy Steel', '1,000 pieces', '₹500-2,000/pc', 'Rajkot', 'open'],
  ['Galvanized Steel Cable Trays', 'Hot-dip galvanized cable trays for solar power plant. IS 2062 material.', 'Galvanized Steel', '10,000 meters', '₹350-500/m', 'Chennai', 'open'],
  ['Brass Valve Bodies — Investment Cast', 'Lead-free brass valve bodies, investment cast, for plumbing fittings.', 'Brass', '20,000 pieces', '₹120-200/pc', 'Rajkot', 'open'],
  ['EN8 Round Bars Dia 50-200mm', 'Bright drawn EN8 round bars for CNC machining shop. Monthly requirement.', 'Carbon Steel', '10 MT/month', '₹52,000-58,000/MT', 'Faridabad', 'open'],
  ['Tool Steel D2 Plates — Ground & Polished', 'D2 tool steel plates, pre-hardened to 58-60 HRC. For press tool dies.', 'Tool Steel', '500 kg', '₹350-450/kg', 'Pune', 'open'],
  ['Stainless Steel Pharmaceutical Vessels', 'SS 316L vessels with mirror polish for API manufacturing plant.', 'Stainless Steel', '8 vessels', '₹5,00,000-8,00,000/pc', 'Ahmedabad', 'open'],
  ['Bronze Bushings — Phosphor Bronze', 'CuSn8 phosphor bronze bushings for heavy machinery bearings.', 'Bronze', '2,000 pieces', '₹200-500/pc', 'Coimbatore', 'open'],
  ['Carbon Steel Pipe Fittings — ASTM A234', 'WPB grade butt-weld fittings for oil refinery piping project.', 'Carbon Steel', '500 pieces', '₹500-3,000/pc', 'Surat', 'open'],
  ['Aluminium Heatsink Extrusions', 'Custom finned heatsink profiles in 6063 T5. For LED lighting and electronics.', 'Aluminum', '5,000 kg/month', '₹300-380/kg', 'Bengaluru', 'open'],
  ['Alloy Steel Bolts Grade 10.9', 'High tensile hex bolts M16-M36 in Grade 10.9 for structural application.', 'Alloy Steel', '50,000 pieces', '₹15-80/pc', 'Faridabad', 'open'],
  ['SS 304 Wire Mesh — Industrial Grade', 'Woven wire mesh 10-100 mesh in SS 304 for filtration applications.', 'Stainless Steel', '500 sq.m', '₹800-2,000/sq.m', 'Mumbai', 'open'],
];

async function run() {
  const client = new pg.Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected.');

  // Get India country/state/city IDs
  const { rows: [india] } = await client.query(`SELECT id FROM countries WHERE iso2='IN' LIMIT 1`);
  if (!india) { console.error('India not found'); process.exit(1); }

  // Get city-to-state mapping
  const { rows: cities } = await client.query(`SELECT c.id, c.name, s.name as state_name, s.id as state_id FROM cities c JOIN states s ON c.state_id=s.id WHERE c.country_id=$1`, [india.id]);
  const cityMap = {};
  cities.forEach(c => { cityMap[c.name] = { id: c.id, stateId: c.state_id }; });

  // Ensure a system user exists for demo data ownership
  let systemUserId;
  const { rows: existingUsers } = await client.query(`SELECT id FROM auth.users LIMIT 1`);
  if (existingUsers.length > 0) {
    systemUserId = existingUsers[0].id;
  } else {
    // Create a placeholder system user for demo data
    const sysId = '00000000-0000-0000-0000-000000000001';
    await client.query(
      `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
       VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'system@metalhub.in', crypt('SystemDemo2024!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb, '{"full_name":"MetalHub System","role":"admin"}'::jsonb, now(), now(), '', '')
       ON CONFLICT (id) DO NOTHING`,
      [sysId]
    );
    systemUserId = sysId;
    console.log('Created system user for demo data.');
  }

  // Insert demo companies
  let companyIds = [];
  for (let i = 0; i < SUPPLIERS.length; i++) {
    const [name, slug, city, state, desc, years, empCount, compRate, respHours] = SUPPLIERS[i];
    const cityInfo = cityMap[city];
    
    const { rows } = await client.query(
      `INSERT INTO companies (name, slug, owner_id, verification_status, trust_level, years_in_business, company_size, country_id, state_id, city_id)
       VALUES ($1, $2, $3, 'approved', $4, $5, $6, $7, $8, $9)
       ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, verification_status='approved', updated_at=now()
       RETURNING id`,
      [name, slug, systemUserId, 50 + i * 2, years, empCount + ' employees', india.id, cityInfo?.stateId || null, cityInfo?.id || null]
    );
    companyIds.push(rows[0]?.id);
    console.log(`Company: ${name}`);
  }

  // Insert listings
  for (let i = 0; i < LISTINGS.length; i++) {
    const [title, slug, metalType, grade, priceMin, priceMax, priceUnit, moq, leadTime, certs, featured] = LISTINGS[i];
    const companyId = companyIds[i % companyIds.length];
    
    await client.query(
      `INSERT INTO listings (title, slug, metal_type, grade, price_min, price_max, price_unit, currency, moq, lead_time, certifications, is_featured, is_active, company_id, moderation_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'INR', $8, $9, $10, $11, true, $12, 'approved')
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, metal_type=EXCLUDED.metal_type, is_active=true, updated_at=now()`,
      [title, slug, metalType, grade, priceMin, priceMax, priceUnit, moq, leadTime, certs, featured, companyId]
    );
    console.log(`Listing: ${title}`);
  }

  // Insert RFQs
  for (let i = 0; i < RFQS.length; i++) {
    const [title, desc, material, qty, budget, city, status] = RFQS[i];
    const rfqSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    
    await client.query(
      `INSERT INTO rfqs (title, slug, description, quantity, target_price, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, status='open', updated_at=now()`,
      [title, rfqSlug, desc, qty, budget, status]
    );
    console.log(`RFQ: ${title}`);
  }

  await client.end();
  console.log('\n✅ Marketplace seeded with', SUPPLIERS.length, 'suppliers,', LISTINGS.length, 'listings,', RFQS.length, 'RFQs.');
}

run().catch(console.error);
