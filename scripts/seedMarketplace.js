/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const db = prisma;

const CATEGORIES = [
  { slug: 'casting', label: 'Casting' },
  { slug: 'forging', label: 'Forging' },
  { slug: 'fabrication', label: 'Fabrication' },
  { slug: 'machining', label: 'Machining' },
  { slug: 'wire-drawing', label: 'Wire Drawing' },
];

const BUYER_INQUIRIES = [
  {
    product_name: 'Ductile Iron Pump Housing Castings',
    category: 'casting',
    description:
      '[DEMO] Need Ductile Iron Grade 500/7 castings for irrigation pump housing. Require dimensional inspection and anti-rust primer coating.',
    quantity: '2,500 units / month',
    budget_range: 'INR 1,250 - 1,550 per unit',
    location: 'Ahmedabad, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Aluminium Gravity Die Casting for Compressor Brackets',
    category: 'casting',
    description:
      '[DEMO] Looking for ADC12 gravity die cast brackets for HVAC compressors with leak-test readiness and machining allowance.',
    quantity: '1,800 units',
    budget_range: 'INR 780 - 980 per unit',
    location: 'Pune, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Investment Cast Stainless Valve Body',
    category: 'casting',
    description:
      '[DEMO] Seeking SS316 investment cast valve bodies for export orders. Supplier should support hydro-test certification and heat number traceability.',
    quantity: '900 units',
    budget_range: 'USD 22 - 28 per unit',
    location: 'Hamburg, Germany',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Cast Iron Counterweight Blocks',
    category: 'casting',
    description:
      '[DEMO] Requirement for GG25 cast iron counterweights used in compact construction equipment. Need shot blasting and batch marking.',
    quantity: '120 tons',
    budget_range: 'INR 62,000 - 68,000 per ton',
    location: 'Chennai, India',
    urgency: 'LOW',
  },
  {
    product_name: 'Forged Carbon Steel Flanges (ANSI B16.5)',
    category: 'forging',
    description:
      '[DEMO] Looking for A105 forged flanges for petrochemical line expansion. Must include PMI report and ultrasonic test records.',
    quantity: '14,000 pieces',
    budget_range: 'INR 310 - 420 per piece',
    location: 'Jamnagar, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Hot Forged Connecting Rod Blanks',
    category: 'forging',
    description:
      '[DEMO] Need forged EN8 connecting rod blanks for heavy-duty diesel engines. Require normalized condition and near-net geometry.',
    quantity: '4,200 units',
    budget_range: 'INR 540 - 690 per unit',
    location: 'Ludhiana, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Ring Forging for Wind Turbine Yaw Bearing',
    category: 'forging',
    description:
      '[DEMO] Seeking forged alloy steel rings up to 1.8m diameter for wind yaw systems. Need hardening readiness and dimensional PPAP.',
    quantity: '320 rings',
    budget_range: 'USD 420 - 560 per ring',
    location: 'Houston, USA',
    urgency: 'HIGH',
  },
  {
    product_name: 'Forged Brass Plumbing Fittings',
    category: 'forging',
    description:
      '[DEMO] Require hot forged brass fittings for OEM plumbing kits. Lead-free compliance and thread quality checks are mandatory.',
    quantity: '30,000 pieces',
    budget_range: 'INR 45 - 62 per piece',
    location: 'Dubai, UAE',
    urgency: 'LOW',
  },
  {
    product_name: 'Laser-Cut Fabricated Enclosure Panels',
    category: 'fabrication',
    description:
      '[DEMO] Need CRCA fabricated electrical enclosure panels with powder coating and captive nut insertion for control cabinets.',
    quantity: '6,500 sets',
    budget_range: 'INR 1,900 - 2,250 per set',
    location: 'Noida, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Mild Steel Structural Fabrication for Warehouse',
    category: 'fabrication',
    description:
      '[DEMO] Looking for structural fabrication partner for 2,000 sqm warehouse expansion. Need blast + epoxy finish and installation support.',
    quantity: '280 tons',
    budget_range: 'INR 74,000 - 82,000 per ton',
    location: 'Surat, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Stainless Fabricated Duct Assemblies',
    category: 'fabrication',
    description:
      '[DEMO] Requirement for SS304 duct assemblies for food processing line. Must comply with hygienic weld quality and smooth passivation.',
    quantity: '1,200 assemblies',
    budget_range: 'USD 48 - 65 per assembly',
    location: 'Ho Chi Minh City, Vietnam',
    urgency: 'LOW',
  },
  {
    product_name: 'Fabricated Conveyor Frames with Galvanization',
    category: 'fabrication',
    description:
      '[DEMO] Need fabricated conveyor support frames with hot dip galvanization and palletized dispatch for multi-site rollout.',
    quantity: '940 frames',
    budget_range: 'INR 3,600 - 4,300 per frame',
    location: 'Coimbatore, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'CNC Machined Aluminium Motor End-Caps',
    category: 'machining',
    description:
      '[DEMO] Need CNC machined end-caps from 6061 billet for EV auxiliary motors. Tight tolerance and leak-path groove profile required.',
    quantity: '9,000 units',
    budget_range: 'INR 210 - 290 per unit',
    location: 'Bengaluru, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Precision Machined SS316 Valve Stem',
    category: 'machining',
    description:
      '[DEMO] Looking for VMC + turning supplier for SS316 valve stems with 0.01 mm tolerance and full CMM report.',
    quantity: '5,500 units',
    budget_range: 'INR 310 - 390 per unit',
    location: 'Mumbai, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: '5-Axis Machined Titanium Mounting Bracket',
    category: 'machining',
    description:
      '[DEMO] Aerospace buyer looking for 5-axis machining partner for Ti-6Al-4V brackets with shot peen and FAI documentation.',
    quantity: '420 units',
    budget_range: 'USD 95 - 130 per unit',
    location: 'Seattle, USA',
    urgency: 'HIGH',
  },
  {
    product_name: 'Machined Brass Nozzle Components',
    category: 'machining',
    description:
      '[DEMO] Need turned and milled brass nozzle components for spraying equipment OEM. Require burr-free finish and assembly fit test.',
    quantity: '16,000 units',
    budget_range: 'INR 54 - 70 per unit',
    location: 'Rajkot, India',
    urgency: 'LOW',
  },
  {
    product_name: 'Copper Wire Drawing for 1.2 mm Conductors',
    category: 'wire-drawing',
    description:
      '[DEMO] Seeking wire drawing supplier for oxygen-free copper conductors with high conductivity and spool packing for automation line.',
    quantity: '180 tons',
    budget_range: 'INR 790 - 860 per kg',
    location: 'Dubai, UAE',
    urgency: 'HIGH',
  },
  {
    product_name: 'Stainless Wire Drawing for Fastener Grade',
    category: 'wire-drawing',
    description:
      '[DEMO] Need SS wire drawing partner for fastener wire rods in 2.5-6 mm sizes with controlled surface finish and tensile test records.',
    quantity: '95 tons',
    budget_range: 'INR 230 - 285 per kg',
    location: 'Delhi NCR, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Low Carbon Steel Wire for Mesh Production',
    category: 'wire-drawing',
    description:
      '[DEMO] Looking for drawn low carbon steel wire suitable for welded mesh production. Uniform diameter consistency is critical.',
    quantity: '260 tons',
    budget_range: 'INR 68,000 - 74,000 per ton',
    location: 'Istanbul, Turkey',
    urgency: 'LOW',
  },
  {
    product_name: 'Aluminium Wire Drawing for EV Harness',
    category: 'wire-drawing',
    description:
      '[DEMO] Requirement for drawn aluminium wire for EV harness sub-assemblies with annealed temper and conductivity certification.',
    quantity: '140 tons',
    budget_range: 'USD 2,450 - 2,900 per ton',
    location: 'San Jose, USA',
    urgency: 'MEDIUM',
  },

  // ===== NEW BATCH: 15 buyer inquiries =====
  {
    product_name: 'CNC Machined Aluminum Parts for Automotive',
    category: 'machining',
    description:
      '[DEMO] Looking for precision CNC machined aluminum components (6061-T6) for automotive assembly. Surface finish and tight tolerances required.',
    quantity: '5,000 units/month',
    budget_range: '$2.5 - $4 per unit',
    location: 'Pune, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Ductile Iron Casting for Pump Housing',
    category: 'casting',
    description:
      '[DEMO] Need ductile iron casting (Grade 500/7) for industrial pump housings with machining allowance.',
    quantity: '2,000 units',
    budget_range: '$15 - $22 per unit',
    location: 'Ahmedabad, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Hot Forged Steel Crankshafts',
    category: 'forging',
    description:
      '[DEMO] Seeking suppliers for hot forged alloy steel crankshafts for heavy-duty engines.',
    quantity: '1,200 units',
    budget_range: '$80 - $120 per unit',
    location: 'Chennai, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Sheet Metal Fabrication for Electrical Panels',
    category: 'fabrication',
    description:
      '[DEMO] Custom sheet metal enclosures with powder coating for industrial control panels.',
    quantity: '800 units',
    budget_range: '$25 - $40 per unit',
    location: 'Bangalore, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Copper Wire Drawing (Electrical Grade)',
    category: 'wire-drawing',
    description:
      '[DEMO] Require continuous copper wire drawing service for 99.9% purity electrical wires.',
    quantity: '10 tons/month',
    budget_range: '$8,500 - $9,000 per ton',
    location: 'Delhi, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Stainless Steel Laser Cut Parts',
    category: 'fabrication',
    description:
      '[DEMO] Laser cutting services required for SS304 sheets with complex geometries.',
    quantity: '3,000 parts',
    budget_range: '$3 - $6 per part',
    location: 'Mumbai, India',
    urgency: 'LOW',
  },
  {
    product_name: 'Precision Brass Turned Components',
    category: 'machining',
    description:
      '[DEMO] Looking for brass precision turned parts for electrical connectors.',
    quantity: '10,000 units',
    budget_range: '$0.5 - $1.2 per unit',
    location: 'Rajkot, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Aluminum Die Casting for LED Housing',
    category: 'casting',
    description:
      '[DEMO] Need high-pressure die casting for LED light housings with smooth finish.',
    quantity: '6,000 units',
    budget_range: '$4 - $7 per unit',
    location: 'Surat, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Mild Steel Fabricated Frames',
    category: 'fabrication',
    description:
      '[DEMO] Fabricated MS frames for warehouse racking systems.',
    quantity: '150 units',
    budget_range: '$120 - $200 per frame',
    location: 'Hyderabad, India',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'High Tensile Steel Fasteners',
    category: 'forging',
    description:
      '[DEMO] Require forged high tensile bolts and nuts (Grade 8.8 & 10.9).',
    quantity: '20,000 units',
    budget_range: '$0.2 - $0.5 per unit',
    location: 'Ludhiana, India',
    urgency: 'HIGH',
  },
  {
    product_name: 'Custom CNC Titanium Parts',
    category: 'machining',
    description:
      '[DEMO] Looking for aerospace-grade titanium machining with strict tolerances.',
    quantity: '500 units',
    budget_range: '$50 - $120 per unit',
    location: 'Berlin, Germany',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Cast Iron Valve Bodies',
    category: 'casting',
    description:
      '[DEMO] Need grey iron castings for industrial valve production.',
    quantity: '2,500 units',
    budget_range: '$10 - $18 per unit',
    location: 'Houston, USA',
    urgency: 'MEDIUM',
  },
  {
    product_name: 'Forged Steel Flanges',
    category: 'forging',
    description:
      '[DEMO] Looking for ANSI standard forged flanges for oil & gas pipeline.',
    quantity: '1,800 units',
    budget_range: '$30 - $60 per unit',
    location: 'Dubai, UAE',
    urgency: 'HIGH',
  },
  {
    product_name: 'Aluminum Extrusion Profiles',
    category: 'fabrication',
    description:
      '[DEMO] Custom aluminum extrusion for construction applications.',
    quantity: '5 tons',
    budget_range: '$3,000 - $3,500 per ton',
    location: 'Singapore',
    urgency: 'LOW',
  },
  {
    product_name: 'Spring Steel Wire Drawing',
    category: 'wire-drawing',
    description:
      '[DEMO] Require high carbon spring steel wire drawing services.',
    quantity: '8 tons',
    budget_range: '$1,200 - $1,500 per ton',
    location: 'UK',
    urgency: 'MEDIUM',
  },
];

const SUPPLIERS = [
  {
    company_name: '[DEMO] Apex Foundry Works Pvt Ltd',
    description: 'Small-batch and medium-volume ferrous casting partner serving pump and valve OEMs with in-house pattern development.',
    location: 'Coimbatore, India',
    is_verified: true,
    rating: 4.7,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] Meridian Forgings International',
    description: 'Export-focused forging house with EN and ASTM grade capability for energy and process industries.',
    location: 'Faridabad, India',
    is_verified: true,
    rating: 4.8,
    profile_type: 'Export-focused company',
  },
  {
    company_name: '[DEMO] Northern Alloy CastTech',
    description: 'Large foundry setup specialized in ductile and gray iron castings with automated molding lines.',
    location: 'Ludhiana, India',
    is_verified: false,
    rating: 4.2,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] Bharat Precision Machining LLP',
    description: 'CNC machining partner for automotive and industrial assemblies with PPAP-ready quality documentation.',
    location: 'Pune, India',
    is_verified: true,
    rating: 4.6,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] Gulf Metal Fabricators FZE',
    description: 'Fabrication and module assembly supplier serving GCC infrastructure and MEP contractors.',
    location: 'Dubai, UAE',
    is_verified: true,
    rating: 4.5,
    profile_type: 'Export-focused company',
  },
  {
    company_name: '[DEMO] Zenith WireDraw Systems',
    description: 'High-volume wire drawing mill for copper, aluminium, and stainless grades with tailored packing formats.',
    location: 'Vadodara, India',
    is_verified: false,
    rating: 4.1,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] Atlas Fabrication & Structurals',
    description: 'Heavy fabrication house with rolling, cutting, and weld assembly capability for EPC contracts.',
    location: 'Surat, India',
    is_verified: true,
    rating: 4.4,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] IndoEuro Casting Solutions',
    description: 'Investment and sand casting specialist shipping precision components to EU and North America.',
    location: 'Rajkot, India',
    is_verified: true,
    rating: 4.9,
    profile_type: 'Export-focused company',
  },
  {
    company_name: '[DEMO] Sakura Mech Components',
    description: 'Precision machining firm for CNC turned and milled parts in stainless and aluminium grades.',
    location: 'Bengaluru, India',
    is_verified: true,
    rating: 4.3,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] Prime Forge Dynamics',
    description: 'Hot forging plant supporting drivetrain and transmission applications for commercial vehicle clients.',
    location: 'Chennai, India',
    is_verified: false,
    rating: 3.9,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] Baltic Industrial Metals GmbH',
    description: 'Europe-facing contract supplier with multi-process capability and strict delivery scheduling.',
    location: 'Berlin, Germany',
    is_verified: true,
    rating: 4.6,
    profile_type: 'Export-focused company',
  },
  {
    company_name: '[DEMO] NovaLine Wire Products',
    description: 'Wire drawing and bright bar conversion partner for fastener, spring, and cable sectors.',
    location: 'Nashik, India',
    is_verified: false,
    rating: 4.0,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] Sterling Process Fabricators',
    description: 'Stainless fabrication partner for food, pharma, and process skid manufacturing projects.',
    location: 'Hyderabad, India',
    is_verified: true,
    rating: 4.7,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] Frontier Alloy Forge LLC',
    description: 'Mid-to-large forging supplier serving US aftermarket and industrial machinery buyers.',
    location: 'Houston, USA',
    is_verified: false,
    rating: 3.8,
    profile_type: 'Export-focused company',
  },
  {
    company_name: '[DEMO] Eastern CNC Works',
    description: 'Small precision shop with agile prototyping and low-volume machining turnaround.',
    location: 'Kolkata, India',
    is_verified: true,
    rating: 4.2,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] BluePeak Cast & Forge',
    description: 'Integrated cast and forge operations with machining backup for complete component delivery.',
    location: 'Noida, India',
    is_verified: true,
    rating: 4.5,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] Emirates Precision Fabrication',
    description: 'Industrial fabrication and retrofit specialist supporting rapid-turn projects in MENA.',
    location: 'Abu Dhabi, UAE',
    is_verified: false,
    rating: 3.7,
    profile_type: 'Export-focused company',
  },
  {
    company_name: '[DEMO] Titan Wire & Rod Mills',
    description: 'High-capacity wire drawing and treatment line for construction and electrical grades.',
    location: 'Nagpur, India',
    is_verified: true,
    rating: 4.4,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] MetroMach Industrial',
    description: 'Machining and sub-assembly partner with mixed-material capability and supplier-managed inventory support.',
    location: 'Singapore',
    is_verified: true,
    rating: 4.8,
    profile_type: 'Export-focused company',
  },
  {
    company_name: '[DEMO] Horizon Fabrication Co.',
    description: 'Medium scale fabrication workshop for enclosure, ducting, and conveyor framework packages.',
    location: 'Jaipur, India',
    is_verified: false,
    rating: 3.9,
    profile_type: 'Small manufacturer',
  },

  // ===== NEW BATCH: 5 supplier companies =====
  {
    company_name: '[DEMO] Shree Precision Cast Pvt Ltd',
    description: 'Specialist in ductile iron and grey iron castings serving pump, valve and industrial OEMs with in-house pattern shop.',
    location: 'Coimbatore, India',
    is_verified: true,
    rating: 4.6,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] Rajkot Brass Industries',
    description: 'Precision brass turned components manufacturer for electrical connectors, fittings, and switchgear assemblies.',
    location: 'Rajkot, India',
    is_verified: true,
    rating: 4.8,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] Global Forge Ltd',
    description: 'Hot forging facility for alloy steel crankshafts, flanges, and heavy-duty drivetrain components.',
    location: 'Chennai, India',
    is_verified: false,
    rating: 4.2,
    profile_type: 'Large factory',
  },
  {
    company_name: '[DEMO] MetalFab Solutions',
    description: 'Custom sheet metal enclosures and fabricated assemblies with powder coating, laser cutting and CNC bending.',
    location: 'Bangalore, India',
    is_verified: true,
    rating: 4.5,
    profile_type: 'Small manufacturer',
  },
  {
    company_name: '[DEMO] EuroMachining GmbH',
    description: 'High-precision 5-axis CNC machining center for titanium, aluminium, and stainless aerospace components.',
    location: 'Germany',
    is_verified: true,
    rating: 4.9,
    profile_type: 'Export-focused company',
  },
];

const PRODUCT_LIBRARY = {
  casting: [
    ['Ductile Iron Pump Casing', 'INR 1,180 - 1,460 / unit', 'MOQ 300 pcs', '8,000 pcs / month'],
    ['Investment Cast SS Valve Body', 'USD 18 - 25 / unit', 'MOQ 150 pcs', '3,500 pcs / month'],
    ['Cast Iron Counterweight Block', 'INR 59,000 - 66,000 / ton', 'MOQ 15 tons', '450 tons / month'],
    ['Ductile Iron Castings', '$12 - $25 / unit', 'MOQ 500 pcs', '6,000 pcs / month'],
    ['Grey Iron Castings', '$8 - $15 / unit', 'MOQ 1,000 pcs', '10,000 pcs / month'],
    ['Aluminium Die Cast LED Housing', '$4 - $7 / unit', 'MOQ 2,000 pcs', '15,000 pcs / month'],
  ],
  forging: [
    ['Forged Carbon Steel Flange', 'INR 290 - 410 / piece', 'MOQ 1,000 pcs', '55,000 pcs / month'],
    ['Alloy Steel Ring Forging', 'USD 380 - 530 / ring', 'MOQ 80 rings', '1,000 rings / month'],
    ['Brass Forged Fittings', 'INR 42 - 58 / piece', 'MOQ 5,000 pcs', '220,000 pcs / month'],
    ['Forged Steel Crankshafts', '$70 - $110 / unit', 'MOQ 300 pcs', '2,500 pcs / month'],
    ['HT Steel Fasteners Grade 8.8', '$0.2 - $0.5 / unit', 'MOQ 10,000 pcs', '500,000 pcs / month'],
  ],
  fabrication: [
    ['Laser Cut Enclosure Kit', 'INR 1,850 - 2,300 / set', 'MOQ 120 sets', '4,200 sets / month'],
    ['Structural Steel Frame Module', 'INR 72,000 - 84,000 / ton', 'MOQ 20 tons', '320 tons / month'],
    ['Stainless Process Duct Assembly', 'USD 42 - 61 / assembly', 'MOQ 200 assemblies', '7,500 assemblies / month'],
    ['Sheet Metal Enclosures', '$20 - $35 / unit', 'MOQ 200 pcs', '3,000 pcs / month'],
    ['MS Fabricated Racking Frames', '$120 - $200 / frame', 'MOQ 50 frames', '400 frames / month'],
    ['Aluminium Extrusion Profiles', '$3,000 - $3,500 / ton', 'MOQ 2 tons', '50 tons / month'],
  ],
  machining: [
    ['CNC Machined Aluminium End Cap', 'INR 205 - 285 / piece', 'MOQ 1,500 pcs', '95,000 pcs / month'],
    ['Precision SS Valve Stem', 'INR 295 - 380 / piece', 'MOQ 800 pcs', '42,000 pcs / month'],
    ['5-Axis Titanium Bracket', 'USD 90 - 125 / piece', 'MOQ 50 pcs', '2,400 pcs / month'],
    ['Brass Turned Components', '$0.4 - $1 / unit', 'MOQ 5,000 pcs', '200,000 pcs / month'],
    ['CNC Titanium Parts', '$60 - $140 / unit', 'MOQ 100 pcs', '1,200 pcs / month'],
    ['CNC Aluminium Auto Parts', '$2.5 - $4 / unit', 'MOQ 1,000 pcs', '50,000 pcs / month'],
  ],
  'wire-drawing': [
    ['OFC Copper Drawn Wire 1.2mm', 'INR 780 - 850 / kg', 'MOQ 4 tons', '210 tons / month'],
    ['SS Drawn Wire Fastener Grade', 'INR 225 - 280 / kg', 'MOQ 3 tons', '160 tons / month'],
    ['Low Carbon Steel Drawn Wire', 'INR 66,000 - 73,000 / ton', 'MOQ 10 tons', '520 tons / month'],
    ['Copper Wire Electrical Grade', '$8,500 - $9,000 / ton', 'MOQ 5 tons', '80 tons / month'],
    ['High Carbon Spring Steel Wire', '$1,200 - $1,500 / ton', 'MOQ 3 tons', '50 tons / month'],
  ],
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function budgetNumberFromRange(rangeText) {
  const match = rangeText.match(/[\d,]+/);
  if (!match) return null;
  return Number(match[0].replace(/,/g, ''));
}

function randomRecentDate(daysBack = 30) {
  const date = new Date();
  date.setDate(date.getDate() - randomBetween(0, daysBack));
  date.setHours(randomBetween(7, 20), randomBetween(0, 59), randomBetween(0, 59), 0);
  return date;
}

async function clearOldSeedData() {
  console.log('Clearing existing marketplace demo seed data...');

  await db.supplierProduct.deleteMany({
    where: {
      OR: [
        { productName: { contains: '[DEMO]' } },
        { productionCapacity: { contains: '[DEMO]' } },
      ],
    },
  });

  await db.supplier.deleteMany({
    where: {
      companyName: { contains: '[DEMO]' },
    },
  });

  await db.inquiry.deleteMany({
    where: {
      description: { contains: '[DEMO]' },
    },
  });

  await db.profile.deleteMany({
    where: {
      OR: [
        { fullName: { contains: '[DEMO]' } },
        { companyName: { contains: '[DEMO]' } },
      ],
    },
  });

  await db.user.deleteMany({
    where: {
      email: { contains: 'demo.marketplace' },
    },
  });
}

async function seedMarketplace() {
  const capabilities = await db.capability.findMany({
    select: { id: true, slug: true },
  });
  const capabilityMap = new Map(capabilities.map((row) => [row.slug, row.id]));

  const buyerUsers = [];
  for (let i = 0; i < BUYER_INQUIRIES.length; i += 1) {
    const suffix = `${Date.now()}-${i}`;
    const user = await db.user.create({
      data: {
        email: `buyer.${suffix}@demo.marketplace.io`,
        role: 'BUYER',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    await db.profile.create({
      data: {
        userId: user.id,
        fullName: `[DEMO] Buyer ${i + 1}`,
        companyName: `[DEMO] Buyer Procurement ${i + 1}`,
        kycStatus: i % 3 === 0 ? 'VERIFIED' : 'PENDING',
      },
    });

    buyerUsers.push(user);
  }

  for (let i = 0; i < BUYER_INQUIRIES.length; i += 1) {
    const inquiry = BUYER_INQUIRIES[i];

    await db.inquiry.create({
      data: {
        userId: buyerUsers[i].id,
        capabilityId: capabilityMap.get(inquiry.category),
        category: inquiry.category,
        productName: inquiry.product_name,
        description: inquiry.description,
        quantity: inquiry.quantity,
        budget: budgetNumberFromRange(inquiry.budget_range),
        budgetRange: inquiry.budget_range,
        location: inquiry.location,
        urgency: inquiry.urgency,
        status: 'OPEN',
        createdAt: randomRecentDate(30),
      },
    });
  }

  const supplierUsers = [];
  for (let i = 0; i < SUPPLIERS.length; i += 1) {
    const suffix = `${Date.now()}-${i}`;
    const user = await db.user.create({
      data: {
        email: `supplier.${suffix}@demo.marketplace.io`,
        role: 'SELLER',
        emailVerified: true,
        phoneVerified: true,
      },
    });

    await db.profile.create({
      data: {
        userId: user.id,
        fullName: `[DEMO] Supplier Owner ${i + 1}`,
        companyName: SUPPLIERS[i].company_name,
        kycStatus: SUPPLIERS[i].is_verified ? 'VERIFIED' : 'PENDING',
      },
    });

    supplierUsers.push(user);
  }

  let productCount = 0;

  for (let i = 0; i < SUPPLIERS.length; i += 1) {
    const supplierRow = SUPPLIERS[i];
    const supplier = await db.supplier.create({
      data: {
        userId: supplierUsers[i].id,
        companyName: supplierRow.company_name,
        description: `${supplierRow.description} (${supplierRow.profile_type})`,
        location: supplierRow.location,
        isVerified: supplierRow.is_verified,
        rating: supplierRow.rating,
        createdAt: randomRecentDate(30),
      },
    });

    const categoryPool = [...CATEGORIES].sort(() => Math.random() - 0.5).slice(0, randomBetween(2, 3));

    for (const category of categoryPool) {
      const productTemplate = PRODUCT_LIBRARY[category.slug][randomBetween(0, PRODUCT_LIBRARY[category.slug].length - 1)];

      await db.supplierProduct.create({
        data: {
          supplierId: supplier.id,
          capabilityId: capabilityMap.get(category.slug),
          category: category.slug,
          productName: `[DEMO] ${productTemplate[0]}`,
          priceRange: productTemplate[1],
          moq: productTemplate[2],
          productionCapacity: productTemplate[3],
          createdAt: randomRecentDate(30),
        },
      });

      productCount += 1;
    }
  }

  console.log(`Seed complete: ${BUYER_INQUIRIES.length} inquiries, ${SUPPLIERS.length} suppliers, ${productCount} supplier products.`);
}

async function main() {
  await clearOldSeedData();
  await seedMarketplace();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
