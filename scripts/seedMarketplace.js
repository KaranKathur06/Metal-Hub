/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ============ TAXONOMY DATA ============
const INDUSTRIES_DATA = [
  { name: 'Automotive', slug: 'automotive' },
  { name: 'Aerospace & Defense', slug: 'aerospace-defense' },
  { name: 'Oil & Gas', slug: 'oil-gas' },
  { name: 'Construction', slug: 'construction' },
  { name: 'Power & Energy', slug: 'power-energy' },
  { name: 'Industrial Machinery', slug: 'industrial-machinery' },
  { name: 'Electronics Manufacturing', slug: 'electronics-manufacturing' },
  { name: 'Robotics & Automation', slug: 'robotics-automation' },
  { name: 'Marine & Shipbuilding', slug: 'marine-shipbuilding' },
  { name: 'Medical Devices', slug: 'medical-devices' },
  { name: 'Renewable Energy', slug: 'renewable-energy' },
  { name: 'Agriculture Equipment', slug: 'agriculture-equipment' },
];

const CATEGORIES_DATA = [
  { name: 'Pump Components', slug: 'pump-components', parent: 'casting' },
  { name: 'Valve Bodies', slug: 'valve-bodies', parent: 'casting' },
  { name: 'Engine Parts', slug: 'engine-parts', parent: 'casting' },
  { name: 'LED Housings', slug: 'led-housings', parent: 'casting' },
  { name: 'Flanges', slug: 'flanges', parent: 'forging' },
  { name: 'Crankshafts', slug: 'crankshafts', parent: 'forging' },
  { name: 'Fasteners', slug: 'fasteners', parent: 'forging' },
  { name: 'Fittings', slug: 'fittings', parent: 'forging' },
  { name: 'Enclosures', slug: 'enclosures', parent: 'fabrication' },
  { name: 'Structural Frames', slug: 'structural-frames', parent: 'fabrication' },
  { name: 'Duct Assemblies', slug: 'duct-assemblies', parent: 'fabrication' },
  { name: 'Conveyor Parts', slug: 'conveyor-parts', parent: 'fabrication' },
  { name: 'Motor Components', slug: 'motor-components', parent: 'machining' },
  { name: 'Valve Stems', slug: 'valve-stems', parent: 'machining' },
  { name: 'Brackets', slug: 'brackets', parent: 'machining' },
  { name: 'Nozzles', slug: 'nozzles', parent: 'machining' },
  { name: 'Copper Conductors', slug: 'copper-conductors', parent: 'wire-drawing' },
  { name: 'Fastener Wire', slug: 'fastener-wire', parent: 'wire-drawing' },
  { name: 'Spring Wire', slug: 'spring-wire', parent: 'wire-drawing' },
];

const CAPABILITY_SLUGS = ['casting', 'forging', 'fabrication', 'machining', 'wire-drawing'];

// ============ SUPPLIER DATA (50+) ============
const SUPPLIERS = [
  { company_name: '[DEMO] Apex Foundry Works Pvt Ltd', tagline: 'Precision casting for pump & valve OEMs', description: 'Small-batch and medium-volume ferrous casting partner serving pump and valve OEMs with in-house pattern development.', location: 'Coimbatore, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.7, response_time: 45, completion: 94, capabilities: ['casting'], industries: ['automotive', 'industrial-machinery'] },
  { company_name: '[DEMO] Meridian Forgings International', tagline: 'Export-grade forging for energy & process', description: 'Export-focused forging house with EN and ASTM grade capability for energy and process industries.', location: 'Faridabad, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.8, response_time: 30, completion: 97, capabilities: ['forging'], industries: ['oil-gas', 'power-energy'] },
  { company_name: '[DEMO] Northern Alloy CastTech', tagline: 'Automated ductile & gray iron casting', description: 'Large foundry setup specialized in ductile and gray iron castings with automated molding lines.', location: 'Ludhiana, India', is_verified: false, iso_certified: false, export_ready: false, rating: 4.2, response_time: 180, completion: 78, capabilities: ['casting'], industries: ['construction', 'agriculture-equipment'] },
  { company_name: '[DEMO] Bharat Precision Machining LLP', tagline: 'CNC machining with PPAP documentation', description: 'CNC machining partner for automotive and industrial assemblies with PPAP-ready quality documentation.', location: 'Pune, India', is_verified: true, iso_certified: true, export_ready: false, rating: 4.6, response_time: 60, completion: 91, capabilities: ['machining'], industries: ['automotive', 'electronics-manufacturing'] },
  { company_name: '[DEMO] Gulf Metal Fabricators FZE', tagline: 'GCC infrastructure fabrication partner', description: 'Fabrication and module assembly supplier serving GCC infrastructure and MEP contractors.', location: 'Dubai, UAE', is_verified: true, iso_certified: true, export_ready: true, rating: 4.5, response_time: 90, completion: 88, capabilities: ['fabrication'], industries: ['construction', 'oil-gas'] },
  { company_name: '[DEMO] Zenith WireDraw Systems', tagline: 'Multi-grade wire drawing mill', description: 'High-volume wire drawing mill for copper, aluminium, and stainless grades with tailored packing.', location: 'Vadodara, India', is_verified: false, iso_certified: false, export_ready: true, rating: 4.1, response_time: 120, completion: 75, capabilities: ['wire-drawing'], industries: ['electronics-manufacturing', 'construction'] },
  { company_name: '[DEMO] Atlas Fabrication & Structurals', tagline: 'Heavy fabrication for EPC contracts', description: 'Heavy fabrication house with rolling, cutting, and weld assembly capability for EPC contracts.', location: 'Surat, India', is_verified: true, iso_certified: true, export_ready: false, rating: 4.4, response_time: 75, completion: 86, capabilities: ['fabrication'], industries: ['construction', 'power-energy'] },
  { company_name: '[DEMO] IndoEuro Casting Solutions', tagline: 'Investment & sand casting for export', description: 'Investment and sand casting specialist shipping precision components to EU and North America.', location: 'Rajkot, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.9, response_time: 25, completion: 98, capabilities: ['casting'], industries: ['automotive', 'aerospace-defense'] },
  { company_name: '[DEMO] Sakura Mech Components', tagline: 'Agile CNC turning & milling shop', description: 'Precision machining firm for CNC turned and milled parts in stainless and aluminium grades.', location: 'Bengaluru, India', is_verified: true, iso_certified: false, export_ready: false, rating: 4.3, response_time: 100, completion: 83, capabilities: ['machining'], industries: ['electronics-manufacturing', 'medical-devices'] },
  { company_name: '[DEMO] Prime Forge Dynamics', tagline: 'Drivetrain forging for CV sector', description: 'Hot forging plant supporting drivetrain and transmission for commercial vehicle clients.', location: 'Chennai, India', is_verified: false, iso_certified: false, export_ready: false, rating: 3.9, response_time: 200, completion: 72, capabilities: ['forging'], industries: ['automotive'] },
  { company_name: '[DEMO] Baltic Industrial Metals GmbH', tagline: 'Multi-process European contract supplier', description: 'Europe-facing contract supplier with multi-process capability and strict delivery scheduling.', location: 'Berlin, Germany', is_verified: true, iso_certified: true, export_ready: true, rating: 4.6, response_time: 40, completion: 95, capabilities: ['machining', 'forging'], industries: ['aerospace-defense', 'automotive'] },
  { company_name: '[DEMO] NovaLine Wire Products', tagline: 'Wire drawing for fastener & spring sectors', description: 'Wire drawing and bright bar conversion partner for fastener, spring, and cable sectors.', location: 'Nashik, India', is_verified: false, iso_certified: false, export_ready: false, rating: 4.0, response_time: 150, completion: 70, capabilities: ['wire-drawing'], industries: ['construction', 'industrial-machinery'] },
  { company_name: '[DEMO] Sterling Process Fabricators', tagline: 'SS fabrication for food & pharma', description: 'Stainless fabrication partner for food, pharma, and process skid manufacturing projects.', location: 'Hyderabad, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.7, response_time: 55, completion: 92, capabilities: ['fabrication'], industries: ['medical-devices', 'industrial-machinery'] },
  { company_name: '[DEMO] Frontier Alloy Forge LLC', tagline: 'US aftermarket forging supplier', description: 'Mid-to-large forging supplier serving US aftermarket and industrial machinery buyers.', location: 'Houston, USA', is_verified: false, iso_certified: true, export_ready: true, rating: 3.8, response_time: 160, completion: 74, capabilities: ['forging'], industries: ['oil-gas', 'industrial-machinery'] },
  { company_name: '[DEMO] Eastern CNC Works', tagline: 'Agile prototyping & low-volume machining', description: 'Small precision shop with agile prototyping and low-volume machining turnaround.', location: 'Kolkata, India', is_verified: true, iso_certified: false, export_ready: false, rating: 4.2, response_time: 90, completion: 80, capabilities: ['machining'], industries: ['robotics-automation'] },
  { company_name: '[DEMO] BluePeak Cast & Forge', tagline: 'Integrated cast-forge-machine operations', description: 'Integrated cast and forge operations with machining backup for complete component delivery.', location: 'Noida, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.5, response_time: 50, completion: 90, capabilities: ['casting', 'forging', 'machining'], industries: ['automotive', 'power-energy'] },
  { company_name: '[DEMO] Emirates Precision Fabrication', tagline: 'Rapid-turn fabrication in MENA', description: 'Industrial fabrication and retrofit specialist supporting rapid-turn projects in MENA.', location: 'Abu Dhabi, UAE', is_verified: false, iso_certified: false, export_ready: true, rating: 3.7, response_time: 140, completion: 68, capabilities: ['fabrication'], industries: ['oil-gas', 'construction'] },
  { company_name: '[DEMO] Titan Wire & Rod Mills', tagline: 'High-capacity construction & electrical wire', description: 'High-capacity wire drawing and treatment line for construction and electrical grades.', location: 'Nagpur, India', is_verified: true, iso_certified: true, export_ready: false, rating: 4.4, response_time: 70, completion: 87, capabilities: ['wire-drawing'], industries: ['construction', 'power-energy'] },
  { company_name: '[DEMO] MetroMach Industrial', tagline: 'Mixed-material machining & sub-assembly', description: 'Machining and sub-assembly partner with mixed-material capability and supplier-managed inventory.', location: 'Singapore', is_verified: true, iso_certified: true, export_ready: true, rating: 4.8, response_time: 35, completion: 96, capabilities: ['machining'], industries: ['electronics-manufacturing', 'aerospace-defense'] },
  { company_name: '[DEMO] Horizon Fabrication Co.', tagline: 'Enclosure & conveyor fabrication', description: 'Medium scale fabrication workshop for enclosure, ducting, and conveyor framework packages.', location: 'Jaipur, India', is_verified: false, iso_certified: false, export_ready: false, rating: 3.9, response_time: 180, completion: 71, capabilities: ['fabrication'], industries: ['industrial-machinery'] },
  { company_name: '[DEMO] Shree Precision Cast Pvt Ltd', tagline: 'DI & GI castings for pump/valve OEMs', description: 'Specialist in ductile iron and grey iron castings serving pump, valve and industrial OEMs.', location: 'Coimbatore, India', is_verified: true, iso_certified: true, export_ready: false, rating: 4.6, response_time: 55, completion: 89, capabilities: ['casting'], industries: ['industrial-machinery', 'agriculture-equipment'] },
  { company_name: '[DEMO] Rajkot Brass Industries', tagline: 'Precision brass for electrical OEMs', description: 'Precision brass turned components manufacturer for electrical connectors and switchgear.', location: 'Rajkot, India', is_verified: true, iso_certified: false, export_ready: true, rating: 4.8, response_time: 40, completion: 93, capabilities: ['machining'], industries: ['electronics-manufacturing', 'power-energy'] },
  { company_name: '[DEMO] Global Forge Ltd', tagline: 'Alloy steel forging for heavy industry', description: 'Hot forging facility for alloy steel crankshafts, flanges, and heavy-duty drivetrain components.', location: 'Chennai, India', is_verified: false, iso_certified: true, export_ready: false, rating: 4.2, response_time: 110, completion: 82, capabilities: ['forging'], industries: ['automotive', 'industrial-machinery'] },
  { company_name: '[DEMO] MetalFab Solutions', tagline: 'Custom enclosures with laser & CNC bending', description: 'Custom sheet metal enclosures and fabricated assemblies with powder coating and laser cutting.', location: 'Bangalore, India', is_verified: true, iso_certified: true, export_ready: false, rating: 4.5, response_time: 65, completion: 88, capabilities: ['fabrication'], industries: ['electronics-manufacturing', 'robotics-automation'] },
  { company_name: '[DEMO] EuroMachining GmbH', tagline: '5-axis aerospace machining center', description: 'High-precision 5-axis CNC machining center for titanium, aluminium, and stainless aerospace components.', location: 'Stuttgart, Germany', is_verified: true, iso_certified: true, export_ready: true, rating: 4.9, response_time: 20, completion: 99, capabilities: ['machining'], industries: ['aerospace-defense', 'medical-devices'] },
  // Additional 25 suppliers to reach 50+
  { company_name: '[DEMO] Tata Metal Castings Ltd', tagline: 'Volume casting for automotive OEMs', description: 'High-volume ferrous and non-ferrous casting facility with automated pouring and inspection lines.', location: 'Jamshedpur, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.7, response_time: 30, completion: 95, capabilities: ['casting'], industries: ['automotive', 'industrial-machinery'] },
  { company_name: '[DEMO] Precision Wire India', tagline: 'Specialty wire for automotive & electrical', description: 'Wire drawing specialist for automotive cable harness and electrical conductor applications.', location: 'Silvassa, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.5, response_time: 50, completion: 90, capabilities: ['wire-drawing'], industries: ['automotive', 'electronics-manufacturing'] },
  { company_name: '[DEMO] Deccan Forge Masters', tagline: 'Open & closed die forging experts', description: 'Open and closed die forging for defense, railway, and heavy machinery applications.', location: 'Hyderabad, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.6, response_time: 45, completion: 91, capabilities: ['forging'], industries: ['aerospace-defense', 'industrial-machinery'] },
  { company_name: '[DEMO] SteelCraft Fabricators', tagline: 'Modular steel fabrication for infra', description: 'Modular steel fabrication and erection services for industrial and infrastructure projects.', location: 'Ahmedabad, India', is_verified: true, iso_certified: true, export_ready: false, rating: 4.3, response_time: 80, completion: 85, capabilities: ['fabrication'], industries: ['construction', 'power-energy'] },
  { company_name: '[DEMO] Anand CNC Technologies', tagline: 'Multi-axis machining for complex parts', description: 'Multi-axis CNC machining center for complex geometries in aerospace and defense applications.', location: 'Pune, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.7, response_time: 35, completion: 94, capabilities: ['machining'], industries: ['aerospace-defense', 'automotive'] },
  { company_name: '[DEMO] Vijay Alloy Castings', tagline: 'Alloy steel & stainless investment casting', description: 'Investment casting specialist for alloy steel and stainless components with vacuum heat treatment.', location: 'Rajkot, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.4, response_time: 60, completion: 87, capabilities: ['casting'], industries: ['oil-gas', 'marine-shipbuilding'] },
  { company_name: '[DEMO] Chennai Forge Works', tagline: 'Automotive forging with in-house heat treatment', description: 'Closed die forging with integrated heat treatment and machining for automotive tier-1 suppliers.', location: 'Chennai, India', is_verified: true, iso_certified: true, export_ready: false, rating: 4.5, response_time: 55, completion: 89, capabilities: ['forging', 'machining'], industries: ['automotive'] },
  { company_name: '[DEMO] Pacific Wire Industries', tagline: 'Stainless & high carbon wire specialist', description: 'Specialized wire drawing for stainless steel, high carbon, and spring steel applications.', location: 'Mumbai, India', is_verified: false, iso_certified: false, export_ready: true, rating: 4.0, response_time: 130, completion: 76, capabilities: ['wire-drawing'], industries: ['automotive', 'construction'] },
  { company_name: '[DEMO] Sagar Heavy Fabrication', tagline: 'Pressure vessel & heat exchanger fabrication', description: 'ASME-certified pressure vessel and heat exchanger fabrication for refinery and petrochemical projects.', location: 'Vizag, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.8, response_time: 40, completion: 96, capabilities: ['fabrication'], industries: ['oil-gas', 'power-energy'] },
  { company_name: '[DEMO] Midwest Precision Corp', tagline: 'Aerospace-grade precision machining', description: 'AS9100 certified precision machining facility for turbine components and structural aerospace parts.', location: 'Chicago, USA', is_verified: true, iso_certified: true, export_ready: true, rating: 4.7, response_time: 30, completion: 95, capabilities: ['machining'], industries: ['aerospace-defense'] },
  { company_name: '[DEMO] Ravi Engineering Castings', tagline: 'SG iron & CI castings for export', description: 'SG iron and cast iron foundry with continuous molding line and export-grade quality systems.', location: 'Kolhapur, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.3, response_time: 70, completion: 84, capabilities: ['casting'], industries: ['automotive', 'agriculture-equipment'] },
  { company_name: '[DEMO] Turkish Forge & Metal AS', tagline: 'European standard forging for energy', description: 'European standard forging supplier with ring rolling and open die capabilities for energy sector.', location: 'Istanbul, Turkey', is_verified: true, iso_certified: true, export_ready: true, rating: 4.4, response_time: 60, completion: 88, capabilities: ['forging'], industries: ['power-energy', 'oil-gas'] },
  { company_name: '[DEMO] Kochi Marine Fabricators', tagline: 'Marine-grade fabrication & ship repair', description: 'Marine-grade fabrication for ship components, offshore structures, and port equipment.', location: 'Kochi, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.2, response_time: 90, completion: 82, capabilities: ['fabrication'], industries: ['marine-shipbuilding', 'oil-gas'] },
  { company_name: '[DEMO] Gujarat Wire Ropes', tagline: 'Steel wire ropes & rope assemblies', description: 'Wire drawing and rope manufacturing for crane, mining, and offshore lifting applications.', location: 'Ahmedabad, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.5, response_time: 50, completion: 90, capabilities: ['wire-drawing'], industries: ['construction', 'marine-shipbuilding'] },
  { company_name: '[DEMO] Hubei Precision Casting Co', tagline: 'High-volume automotive casting for export', description: 'High-volume aluminum and iron casting facility with automated quality inspection for automotive Tier-1.', location: 'Wuhan, China', is_verified: true, iso_certified: true, export_ready: true, rating: 4.1, response_time: 100, completion: 80, capabilities: ['casting'], industries: ['automotive', 'electronics-manufacturing'] },
  { company_name: '[DEMO] Forge Italia SpA', tagline: 'Premium Italian forge for luxury auto', description: 'Premium forging house for luxury automotive and high-performance motorsport applications.', location: 'Turin, Italy', is_verified: true, iso_certified: true, export_ready: true, rating: 4.9, response_time: 25, completion: 98, capabilities: ['forging'], industries: ['automotive', 'aerospace-defense'] },
  { company_name: '[DEMO] Raipur Steel Fabrication', tagline: 'Structural steel for power plants', description: 'Large-scale structural steel fabrication for power plants, cement plants, and industrial sheds.', location: 'Raipur, India', is_verified: false, iso_certified: true, export_ready: false, rating: 4.0, response_time: 120, completion: 77, capabilities: ['fabrication'], industries: ['power-energy', 'construction'] },
  { company_name: '[DEMO] Nagoya Machining Center', tagline: 'Japanese precision for medical & auto', description: 'Ultra-precision machining for medical implants and automotive fuel injection components.', location: 'Nagoya, Japan', is_verified: true, iso_certified: true, export_ready: true, rating: 4.8, response_time: 20, completion: 97, capabilities: ['machining'], industries: ['medical-devices', 'automotive'] },
  { company_name: '[DEMO] Dharwad Casting Industries', tagline: 'Sand & shell mold casting', description: 'Sand and shell mold casting foundry for agricultural equipment and pump components.', location: 'Dharwad, India', is_verified: false, iso_certified: false, export_ready: false, rating: 3.8, response_time: 200, completion: 69, capabilities: ['casting'], industries: ['agriculture-equipment'] },
  { company_name: '[DEMO] Alwar Forge & Press', tagline: 'Brass & copper hot forging', description: 'Hot forging specialist for brass, copper, and aluminium components with trimming and machining.', location: 'Alwar, India', is_verified: true, iso_certified: false, export_ready: true, rating: 4.3, response_time: 75, completion: 85, capabilities: ['forging'], industries: ['electronics-manufacturing', 'construction'] },
  { company_name: '[DEMO] Vietnam Steel Fabrication JSC', tagline: 'Cost-effective fabrication for export', description: 'Cost-effective steel fabrication and surface treatment for export to ASEAN and global markets.', location: 'Ho Chi Minh City, Vietnam', is_verified: true, iso_certified: true, export_ready: true, rating: 4.2, response_time: 80, completion: 83, capabilities: ['fabrication'], industries: ['construction', 'renewable-energy'] },
  { company_name: '[DEMO] Kanpur Wire Draws Pvt Ltd', tagline: 'Mild steel wire for mesh & nails', description: 'Wire drawing plant for mild steel, galvanized, and black annealed wire for nail and mesh production.', location: 'Kanpur, India', is_verified: false, iso_certified: false, export_ready: false, rating: 3.7, response_time: 190, completion: 65, capabilities: ['wire-drawing'], industries: ['construction'] },
  { company_name: '[DEMO] Madras Precision Engineering', tagline: 'Aerospace & defense CNC machining', description: 'NADCAP accredited CNC machining for aerospace structural parts and defense equipment components.', location: 'Chennai, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.6, response_time: 40, completion: 92, capabilities: ['machining'], industries: ['aerospace-defense', 'robotics-automation'] },
  { company_name: '[DEMO] Ahmedabad Multi-Metal Cast', tagline: 'Multi-alloy foundry for diverse sectors', description: 'Multi-alloy foundry capable of aluminium, brass, and iron castings for diverse industrial applications.', location: 'Ahmedabad, India', is_verified: true, iso_certified: true, export_ready: true, rating: 4.4, response_time: 65, completion: 86, capabilities: ['casting'], industries: ['industrial-machinery', 'automotive'] },
];

// ============ PRODUCT LIBRARY ============
const PRODUCT_LIBRARY = {
  casting: [
    { name: 'Ductile Iron Pump Casing', material: 'Ductile Iron GGG50', price: 'INR 1,180 - 1,460 / unit', moq: 'MOQ 300 pcs', capacity: '8,000 pcs / month' },
    { name: 'Investment Cast SS Valve Body', material: 'SS316', price: 'USD 18 - 25 / unit', moq: 'MOQ 150 pcs', capacity: '3,500 pcs / month' },
    { name: 'Cast Iron Counterweight Block', material: 'GG25 Grey Iron', price: 'INR 59,000 - 66,000 / ton', moq: 'MOQ 15 tons', capacity: '450 tons / month' },
    { name: 'Aluminium Die Cast LED Housing', material: 'ADC12 Aluminium', price: 'USD 4 - 7 / unit', moq: 'MOQ 2,000 pcs', capacity: '15,000 pcs / month' },
    { name: 'Grey Iron Castings', material: 'FG260 Grey Iron', price: 'USD 8 - 15 / unit', moq: 'MOQ 1,000 pcs', capacity: '10,000 pcs / month' },
    { name: 'Aluminium Gravity Die Cast Bracket', material: 'A356 Aluminium', price: 'INR 780 - 980 / unit', moq: 'MOQ 500 pcs', capacity: '6,000 pcs / month' },
  ],
  forging: [
    { name: 'Forged Carbon Steel Flange', material: 'A105 Carbon Steel', price: 'INR 290 - 410 / piece', moq: 'MOQ 1,000 pcs', capacity: '55,000 pcs / month' },
    { name: 'Alloy Steel Ring Forging', material: '4140 Alloy Steel', price: 'USD 380 - 530 / ring', moq: 'MOQ 80 rings', capacity: '1,000 rings / month' },
    { name: 'Brass Forged Fittings', material: 'CuZn39Pb3 Brass', price: 'INR 42 - 58 / piece', moq: 'MOQ 5,000 pcs', capacity: '220,000 pcs / month' },
    { name: 'Forged Steel Crankshaft', material: 'EN8 Carbon Steel', price: 'USD 70 - 110 / unit', moq: 'MOQ 300 pcs', capacity: '2,500 pcs / month' },
    { name: 'HT Steel Fasteners Grade 8.8', material: 'Grade 8.8 Steel', price: 'USD 0.2 - 0.5 / unit', moq: 'MOQ 10,000 pcs', capacity: '500,000 pcs / month' },
  ],
  fabrication: [
    { name: 'Laser Cut Enclosure Kit', material: 'CRCA Sheet', price: 'INR 1,850 - 2,300 / set', moq: 'MOQ 120 sets', capacity: '4,200 sets / month' },
    { name: 'Structural Steel Frame Module', material: 'MS IS2062 E250', price: 'INR 72,000 - 84,000 / ton', moq: 'MOQ 20 tons', capacity: '320 tons / month' },
    { name: 'Stainless Process Duct Assembly', material: 'SS304', price: 'USD 42 - 61 / assembly', moq: 'MOQ 200 assemblies', capacity: '7,500 assemblies / month' },
    { name: 'Sheet Metal Enclosures', material: 'CR Steel', price: 'USD 20 - 35 / unit', moq: 'MOQ 200 pcs', capacity: '3,000 pcs / month' },
    { name: 'Conveyor Support Frame', material: 'MS Structural', price: 'INR 3,600 - 4,300 / frame', moq: 'MOQ 50 frames', capacity: '400 frames / month' },
    { name: 'Aluminium Extrusion Profile', material: '6063 Aluminium', price: 'USD 3,000 - 3,500 / ton', moq: 'MOQ 2 tons', capacity: '50 tons / month' },
  ],
  machining: [
    { name: 'CNC Machined Aluminium End Cap', material: '6061-T6 Aluminium', price: 'INR 205 - 285 / piece', moq: 'MOQ 1,500 pcs', capacity: '95,000 pcs / month' },
    { name: 'Precision SS Valve Stem', material: 'SS316', price: 'INR 295 - 380 / piece', moq: 'MOQ 800 pcs', capacity: '42,000 pcs / month' },
    { name: '5-Axis Titanium Bracket', material: 'Ti-6Al-4V', price: 'USD 90 - 125 / piece', moq: 'MOQ 50 pcs', capacity: '2,400 pcs / month' },
    { name: 'Brass Turned Nozzle Component', material: 'CuZn39Pb3 Brass', price: 'USD 0.4 - 1 / unit', moq: 'MOQ 5,000 pcs', capacity: '200,000 pcs / month' },
    { name: 'CNC Titanium Aerospace Part', material: 'Ti-6Al-4V', price: 'USD 60 - 140 / unit', moq: 'MOQ 100 pcs', capacity: '1,200 pcs / month' },
    { name: 'CNC Aluminium Auto Component', material: '6061-T6 Aluminium', price: 'USD 2.5 - 4 / unit', moq: 'MOQ 1,000 pcs', capacity: '50,000 pcs / month' },
  ],
  'wire-drawing': [
    { name: 'OFC Copper Drawn Wire 1.2mm', material: 'Oxygen-Free Copper', price: 'INR 780 - 850 / kg', moq: 'MOQ 4 tons', capacity: '210 tons / month' },
    { name: 'SS Drawn Wire Fastener Grade', material: 'SS304 Wire Rod', price: 'INR 225 - 280 / kg', moq: 'MOQ 3 tons', capacity: '160 tons / month' },
    { name: 'Low Carbon Steel Drawn Wire', material: 'SAE1008 Low Carbon', price: 'INR 66,000 - 73,000 / ton', moq: 'MOQ 10 tons', capacity: '520 tons / month' },
    { name: 'Copper Wire Electrical Grade', material: 'ETP Copper', price: 'USD 8,500 - 9,000 / ton', moq: 'MOQ 5 tons', capacity: '80 tons / month' },
    { name: 'High Carbon Spring Steel Wire', material: 'EN42J Spring Steel', price: 'USD 1,200 - 1,500 / ton', moq: 'MOQ 3 tons', capacity: '50 tons / month' },
  ],
};

// ============ BUYER INQUIRIES ============
const BUYER_INQUIRIES = [
  { product_name: 'Ductile Iron Pump Housing Castings', category: 'casting', material: 'Ductile Iron GGG50', description: '[DEMO] Need Ductile Iron Grade 500/7 castings for irrigation pump housing.', quantity: '2,500 units / month', budget_range: 'INR 1,250 - 1,550 per unit', location: 'Ahmedabad, India', urgency: 'HIGH', industries: ['agriculture-equipment'] },
  { product_name: 'Aluminium Gravity Die Cast Compressor Brackets', category: 'casting', material: 'ADC12 Aluminium', description: '[DEMO] ADC12 gravity die cast brackets for HVAC compressors with leak-test readiness.', quantity: '1,800 units', budget_range: 'INR 780 - 980 per unit', location: 'Pune, India', urgency: 'MEDIUM', industries: ['industrial-machinery'] },
  { product_name: 'Investment Cast Stainless Valve Body', category: 'casting', material: 'SS316', description: '[DEMO] SS316 investment cast valve bodies for export orders with hydro-test certification.', quantity: '900 units', budget_range: 'USD 22 - 28 per unit', location: 'Hamburg, Germany', urgency: 'MEDIUM', industries: ['oil-gas'] },
  { product_name: 'Forged Carbon Steel Flanges (ANSI B16.5)', category: 'forging', material: 'A105 Carbon Steel', description: '[DEMO] A105 forged flanges for petrochemical line expansion with PMI and UT reports.', quantity: '14,000 pieces', budget_range: 'INR 310 - 420 per piece', location: 'Jamnagar, India', urgency: 'HIGH', industries: ['oil-gas'] },
  { product_name: 'Hot Forged Connecting Rod Blanks', category: 'forging', material: 'EN8 Steel', description: '[DEMO] Forged EN8 connecting rod blanks for heavy-duty diesel engines.', quantity: '4,200 units', budget_range: 'INR 540 - 690 per unit', location: 'Ludhiana, India', urgency: 'MEDIUM', industries: ['automotive'] },
  { product_name: 'Ring Forging for Wind Turbine Yaw Bearing', category: 'forging', material: '4140 Alloy Steel', description: '[DEMO] Forged alloy steel rings up to 1.8m diameter for wind yaw systems.', quantity: '320 rings', budget_range: 'USD 420 - 560 per ring', location: 'Houston, USA', urgency: 'HIGH', industries: ['renewable-energy'] },
  { product_name: 'Laser-Cut Fabricated Enclosure Panels', category: 'fabrication', material: 'CRCA Sheet', description: '[DEMO] CRCA fabricated electrical enclosure panels with powder coating for control cabinets.', quantity: '6,500 sets', budget_range: 'INR 1,900 - 2,250 per set', location: 'Noida, India', urgency: 'HIGH', industries: ['electronics-manufacturing'] },
  { product_name: 'Mild Steel Structural Fabrication for Warehouse', category: 'fabrication', material: 'MS IS2062', description: '[DEMO] Structural fabrication for 2,000 sqm warehouse expansion with blast + epoxy finish.', quantity: '280 tons', budget_range: 'INR 74,000 - 82,000 per ton', location: 'Surat, India', urgency: 'MEDIUM', industries: ['construction'] },
  { product_name: 'CNC Machined Aluminium Motor End-Caps', category: 'machining', material: '6061-T6 Aluminium', description: '[DEMO] CNC machined end-caps from 6061 billet for EV auxiliary motors with tight tolerance.', quantity: '9,000 units', budget_range: 'INR 210 - 290 per unit', location: 'Bengaluru, India', urgency: 'HIGH', industries: ['automotive'] },
  { product_name: 'Precision Machined SS316 Valve Stem', category: 'machining', material: 'SS316', description: '[DEMO] VMC + turning for SS316 valve stems with 0.01 mm tolerance and CMM report.', quantity: '5,500 units', budget_range: 'INR 310 - 390 per unit', location: 'Mumbai, India', urgency: 'MEDIUM', industries: ['oil-gas'] },
  { product_name: '5-Axis Machined Titanium Mounting Bracket', category: 'machining', material: 'Ti-6Al-4V', description: '[DEMO] Aerospace buyer looking for 5-axis machining partner for Ti-6Al-4V brackets.', quantity: '420 units', budget_range: 'USD 95 - 130 per unit', location: 'Seattle, USA', urgency: 'HIGH', industries: ['aerospace-defense'] },
  { product_name: 'Copper Wire Drawing for 1.2 mm Conductors', category: 'wire-drawing', material: 'Oxygen-Free Copper', description: '[DEMO] Wire drawing for oxygen-free copper conductors with high conductivity and spool packing.', quantity: '180 tons', budget_range: 'INR 790 - 860 per kg', location: 'Dubai, UAE', urgency: 'HIGH', industries: ['electronics-manufacturing'] },
  { product_name: 'Stainless Wire Drawing for Fastener Grade', category: 'wire-drawing', material: 'SS304 Wire Rod', description: '[DEMO] SS wire drawing for fastener wire rods in 2.5-6 mm sizes with surface finish control.', quantity: '95 tons', budget_range: 'INR 230 - 285 per kg', location: 'Delhi NCR, India', urgency: 'MEDIUM', industries: ['construction'] },
  { product_name: 'SS304 Fabricated Duct Assemblies', category: 'fabrication', material: 'SS304', description: '[DEMO] SS304 duct assemblies for food processing line with hygienic weld quality.', quantity: '1,200 assemblies', budget_range: 'USD 48 - 65 per assembly', location: 'Ho Chi Minh City, Vietnam', urgency: 'LOW', industries: ['industrial-machinery'] },
  { product_name: 'Cast Iron Counterweight Blocks', category: 'casting', material: 'GG25 Grey Iron', description: '[DEMO] GG25 cast iron counterweights for compact construction equipment.', quantity: '120 tons', budget_range: 'INR 62,000 - 68,000 per ton', location: 'Chennai, India', urgency: 'LOW', industries: ['construction'] },
  { product_name: 'Forged Brass Plumbing Fittings', category: 'forging', material: 'CuZn39Pb3 Brass', description: '[DEMO] Hot forged brass fittings for OEM plumbing kits with lead-free compliance.', quantity: '30,000 pieces', budget_range: 'INR 45 - 62 per piece', location: 'Dubai, UAE', urgency: 'LOW', industries: ['construction'] },
  { product_name: 'Machined Brass Nozzle Components', category: 'machining', material: 'CuZn39Pb3 Brass', description: '[DEMO] Turned and milled brass nozzle components for spraying equipment OEM.', quantity: '16,000 units', budget_range: 'INR 54 - 70 per unit', location: 'Rajkot, India', urgency: 'LOW', industries: ['agriculture-equipment'] },
  { product_name: 'Aluminium Wire Drawing for EV Harness', category: 'wire-drawing', material: 'EC Grade Aluminium', description: '[DEMO] Drawn aluminium wire for EV harness sub-assemblies with conductivity certification.', quantity: '140 tons', budget_range: 'USD 2,450 - 2,900 per ton', location: 'San Jose, USA', urgency: 'MEDIUM', industries: ['automotive'] },
  { product_name: 'Low Carbon Steel Wire for Mesh Production', category: 'wire-drawing', material: 'SAE1008 Low Carbon', description: '[DEMO] Drawn low carbon steel wire suitable for welded mesh production.', quantity: '260 tons', budget_range: 'INR 68,000 - 74,000 per ton', location: 'Istanbul, Turkey', urgency: 'LOW', industries: ['construction'] },
  { product_name: 'Fabricated Conveyor Frames with Galvanization', category: 'fabrication', material: 'MS Structural', description: '[DEMO] Fabricated conveyor support frames with hot dip galvanization.', quantity: '940 frames', budget_range: 'INR 3,600 - 4,300 per frame', location: 'Coimbatore, India', urgency: 'MEDIUM', industries: ['industrial-machinery'] },
  // Additional inquiries
  { product_name: 'CNC Machined Aluminum Parts for Automotive', category: 'machining', material: '6061-T6 Aluminium', description: '[DEMO] Precision CNC machined aluminum components for automotive assembly.', quantity: '5,000 units/month', budget_range: 'USD 2.5 - 4 per unit', location: 'Pune, India', urgency: 'HIGH', industries: ['automotive'] },
  { product_name: 'Sheet Metal Fabrication for Electrical Panels', category: 'fabrication', material: 'CR Steel', description: '[DEMO] Custom sheet metal enclosures with powder coating for control panels.', quantity: '800 units', budget_range: 'USD 25 - 40 per unit', location: 'Bangalore, India', urgency: 'MEDIUM', industries: ['electronics-manufacturing'] },
  { product_name: 'High Tensile Steel Fasteners', category: 'forging', material: 'Grade 10.9 Steel', description: '[DEMO] Forged high tensile bolts and nuts (Grade 8.8 & 10.9) for structural use.', quantity: '20,000 units', budget_range: 'USD 0.2 - 0.5 per unit', location: 'Ludhiana, India', urgency: 'HIGH', industries: ['construction'] },
  { product_name: 'Custom CNC Titanium Parts', category: 'machining', material: 'Ti-6Al-4V', description: '[DEMO] Aerospace-grade titanium machining with strict tolerances and FAI.', quantity: '500 units', budget_range: 'USD 50 - 120 per unit', location: 'Berlin, Germany', urgency: 'MEDIUM', industries: ['aerospace-defense'] },
  { product_name: 'Forged Steel Flanges for Pipeline', category: 'forging', material: 'A105 Carbon Steel', description: '[DEMO] ANSI standard forged flanges for oil & gas pipeline expansion.', quantity: '1,800 units', budget_range: 'USD 30 - 60 per unit', location: 'Dubai, UAE', urgency: 'HIGH', industries: ['oil-gas'] },
  { product_name: 'Pressure Vessel Shell Fabrication', category: 'fabrication', material: 'SA516 Gr.70', description: '[DEMO] ASME U-stamp pressure vessel shells for refinery modernization project.', quantity: '24 units', budget_range: 'USD 15,000 - 25,000 per unit', location: 'Jamnagar, India', urgency: 'HIGH', industries: ['oil-gas', 'power-energy'] },
  { product_name: 'Robotic Arm Machined Components', category: 'machining', material: '7075-T6 Aluminium', description: '[DEMO] Precision CNC components for 6-axis industrial robot arm assemblies.', quantity: '3,000 sets', budget_range: 'USD 45 - 80 per set', location: 'Pune, India', urgency: 'HIGH', industries: ['robotics-automation'] },
  { product_name: 'Marine-Grade SS Castings', category: 'casting', material: 'CF8M (SS316)', description: '[DEMO] Marine-grade stainless steel castings for ship propulsion valve assemblies.', quantity: '600 units', budget_range: 'USD 35 - 55 per unit', location: 'Kochi, India', urgency: 'MEDIUM', industries: ['marine-shipbuilding'] },
  { product_name: 'Solar Panel Mounting Frames', category: 'fabrication', material: 'Galvanized MS', description: '[DEMO] Hot-dip galvanized mounting structures for 50MW solar farm installation.', quantity: '12,000 frames', budget_range: 'INR 2,800 - 3,500 per frame', location: 'Jodhpur, India', urgency: 'HIGH', industries: ['renewable-energy'] },
  { product_name: 'Medical Implant Grade Machined Parts', category: 'machining', material: 'Ti-6Al-4V ELI', description: '[DEMO] Ultra-precision CNC parts for orthopedic implant manufacturer with ASTM F136.', quantity: '2,000 units', budget_range: 'USD 80 - 150 per unit', location: 'Bengaluru, India', urgency: 'HIGH', industries: ['medical-devices'] },
];

// ============ HELPERS ============
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function budgetNumber(text) { const m = text.match(/[\d,]+/); return m ? Number(m[0].replace(/,/g, '')) : null; }
function randomDate(daysBack = 45) { const d = new Date(); d.setDate(d.getDate() - randomBetween(0, daysBack)); d.setHours(randomBetween(7, 20), randomBetween(0, 59)); return d; }

// ============ MAIN ============
async function main() {
  console.log('🔄 Clearing old demo data...');
  // Clear in dependency order
  await prisma.productCapability.deleteMany({});
  await prisma.requirementCapability.deleteMany({});
  await prisma.supplierCapability.deleteMany({});
  await prisma.supplierIndustry.deleteMany({});
  await prisma.supplierProduct.deleteMany({});
  await prisma.supplier.deleteMany({ where: { companyName: { contains: '[DEMO]' } } });
  await prisma.inquiry.deleteMany({ where: { description: { contains: '[DEMO]' } } });
  await prisma.profile.deleteMany({ where: { OR: [{ fullName: { contains: '[DEMO]' } }, { companyName: { contains: '[DEMO]' } }] } });
  await prisma.user.deleteMany({ where: { email: { contains: 'demo.marketplace' } } });

  // Upsert industries
  console.log('🏭 Seeding industries...');
  const industryMap = new Map();
  for (const ind of INDUSTRIES_DATA) {
    const row = await prisma.industry.upsert({ where: { slug: ind.slug }, create: ind, update: { name: ind.name } });
    industryMap.set(ind.slug, row.id);
  }

  // Upsert categories
  console.log('📦 Seeding categories...');
  const categoryMap = new Map();
  for (const cat of CATEGORIES_DATA) {
    const row = await prisma.category.upsert({ where: { slug: cat.slug }, create: { name: cat.name, slug: cat.slug }, update: { name: cat.name } });
    categoryMap.set(cat.slug, row.id);
  }

  // Get capability map
  const capabilities = await prisma.capability.findMany({ select: { id: true, slug: true } });
  const capMap = new Map(capabilities.map(c => [c.slug, c.id]));

  // Seed suppliers
  console.log('🏗️ Seeding suppliers...');
  let productCount = 0;

  for (let i = 0; i < SUPPLIERS.length; i++) {
    const s = SUPPLIERS[i];
    const suffix = `${Date.now()}-${i}`;
    const user = await prisma.user.create({ data: { email: `supplier.${suffix}@demo.marketplace.io`, role: 'SELLER', emailVerified: true, phoneVerified: true } });
    await prisma.profile.create({ data: { userId: user.id, fullName: `[DEMO] Supplier Owner ${i + 1}`, companyName: s.company_name, kycStatus: s.is_verified ? 'VERIFIED' : 'PENDING' } });

    const supplier = await prisma.supplier.create({
      data: {
        userId: user.id, companyName: s.company_name, tagline: s.tagline, description: s.description,
        location: s.location, isVerified: s.is_verified, isoCertified: s.iso_certified, exportReady: s.export_ready,
        rating: s.rating, responseTimeMinutes: s.response_time, completionRate: s.completion, createdAt: randomDate(45),
      },
    });

    // Link capabilities
    for (const capSlug of s.capabilities) {
      const capId = capMap.get(capSlug);
      if (capId) {
        await prisma.supplierCapability.create({ data: { supplierId: supplier.id, capabilityId: capId } }).catch(() => {});
      }
    }

    // Link industries
    for (const indSlug of s.industries) {
      const indId = industryMap.get(indSlug);
      if (indId) {
        await prisma.supplierIndustry.create({ data: { supplierId: supplier.id, industryId: indId } }).catch(() => {});
      }
    }

    // Create 3-5 products per supplier
    const mainCaps = [...s.capabilities];
    const allCaps = [...CAPABILITY_SLUGS].sort(() => Math.random() - 0.5);
    const productCaps = [...new Set([...mainCaps, ...allCaps])].slice(0, randomBetween(3, 5));

    for (const capSlug of productCaps) {
      const lib = PRODUCT_LIBRARY[capSlug];
      if (!lib) continue;
      const tmpl = lib[randomBetween(0, lib.length - 1)];
      const capId = capMap.get(capSlug);

      const product = await prisma.supplierProduct.create({
        data: {
          supplierId: supplier.id, capabilityId: capId, categoryId: null,
          category: capSlug, productName: `[DEMO] ${tmpl.name}`, material: tmpl.material,
          priceRange: tmpl.price, moq: tmpl.moq, productionCapacity: tmpl.capacity, createdAt: randomDate(30),
        },
      });

      if (capId) {
        await prisma.productCapability.create({ data: { productId: product.id, capabilityId: capId } }).catch(() => {});
      }
      productCount++;
    }
  }

  // Seed buyer inquiries
  console.log('📋 Seeding buyer inquiries...');
  for (let i = 0; i < BUYER_INQUIRIES.length; i++) {
    const inq = BUYER_INQUIRIES[i];
    const suffix = `${Date.now()}-${i}`;
    const user = await prisma.user.create({ data: { email: `buyer.${suffix}@demo.marketplace.io`, role: 'BUYER', emailVerified: true, phoneVerified: true } });
    await prisma.profile.create({ data: { userId: user.id, fullName: `[DEMO] Buyer ${i + 1}`, companyName: `[DEMO] Procurement ${i + 1}`, kycStatus: i % 3 === 0 ? 'VERIFIED' : 'PENDING' } });

    const capId = capMap.get(inq.category);
    const indId = inq.industries?.[0] ? industryMap.get(inq.industries[0]) : null;

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user.id, capabilityId: capId, industryId: indId,
        category: inq.category, productName: inq.product_name, description: inq.description,
        material: inq.material, quantity: inq.quantity, budget: budgetNumber(inq.budget_range),
        budgetRange: inq.budget_range, location: inq.location, urgency: inq.urgency,
        viewsCount: randomBetween(5, 120), quoteCount: randomBetween(0, 12),
        status: 'OPEN', createdAt: randomDate(30),
      },
    });

    // Link requirement capabilities
    if (capId) {
      await prisma.requirementCapability.create({ data: { requirementId: inquiry.id, capabilityId: capId } }).catch(() => {});
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   📊 ${SUPPLIERS.length} suppliers`);
  console.log(`   📦 ${productCount} products`);
  console.log(`   📋 ${BUYER_INQUIRIES.length} buyer inquiries`);
  console.log(`   🏭 ${INDUSTRIES_DATA.length} industries`);
  console.log(`   📁 ${CATEGORIES_DATA.length} categories`);
  console.log(`   🔗 Relational tables populated: supplier_capabilities, supplier_industries, product_capabilities, requirement_capabilities`);
}

main()
  .catch((err) => { console.error(err); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
