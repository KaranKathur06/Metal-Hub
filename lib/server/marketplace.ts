const BACKEND_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5000';

function daysAgoISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const CATEGORIES = ['casting', 'forging', 'fabrication', 'machining', 'wire-drawing'] as const;

const LOCATIONS = [
  'Ahmedabad, Gujarat',
  'Pune, Maharashtra',
  'Chennai, Tamil Nadu',
  'Mumbai, Maharashtra',
  'Bengaluru, Karnataka',
  'Jamshedpur, Jharkhand',
  'Coimbatore, Tamil Nadu',
  'Ludhiana, Punjab',
  'Rajkot, Gujarat',
  'Delhi NCR',
];

const SUPPLIER_NAMES = [
  'Apex Alloy Industries',
  'TitanForge Engineering Pvt Ltd',
  'NovaSteel Components',
  'Vertex Precision Metals',
  'BluePeak Industrial Systems',
  'IronGrid Fabrication Works',
  'Bharat Heavy Metallics',
  'SteelCraft Manufacturing',
  'Paramount Castings & Forgings',
  'Shree Balaji Metal Tech',
  'Kiran Engineering Works',
  'Mahavir Industrial Products',
  'Ashoka Precision Components',
  'Rathi Steel & Power Ltd',
  'Jindal Metalforming Solutions',
  'Tata Allied Industries',
  'Godrej Tooling Division',
  'Lakshmi Precision Machining',
  'Krishna Forge & Foundry',
  'Ambica Engineering Corp',
];

const SUPPLIER_DESCRIPTIONS = [
  'ISO 9001:2015 certified manufacturer specializing in precision-engineered alloy components for automotive and aerospace sectors. 25,000 sq ft production facility with 5-axis CNC capability.',
  'Full-service forging house with 2,500 MT press capacity. Serves defence, railways, and heavy engineering OEMs across South Asia.',
  'Stainless steel fabrication specialists with laser cutting, TIG/MIG welding, and powder coating lines. Exporting to 12 countries.',
  'Precision CNC machining center with ±0.005mm tolerance capability. Serving semiconductor, medical device, and instrumentation industries.',
  'Integrated industrial systems provider — structural steel, conveyors, material handling, and plant erection services.',
  'Custom sheet metal fabrication with Trumpf laser cutting, Amada press brakes, and robotic welding cells.',
  'Large-scale casting facility producing CI, SG iron, and steel castings up to 8 MT single-piece weight.',
  'Multi-process manufacturing — die casting, gravity casting, sand casting, and investment casting under one roof.',
  'Forging and machining center with ring rolling, open-die forging, and closed-die capability for flanges and fittings.',
  'Wire drawing and wire products manufacturer — GI wire, MS wire, HB wire, and custom profiles.',
  'Precision turned components and fasteners for automotive Tier-1 suppliers. 200+ CNC turning centers.',
  'Industrial valve and pipe fitting manufacturer. API 6A, API 600, and BS 1873 certified.',
  'Aerospace-grade precision components with NADCAP accreditation. Inconel, titanium, and high-temp alloy machining.',
  'Integrated steel processing — slitting, shearing, cut-to-length, and blanking services for flat products.',
  'Tool and die manufacturing with EDM, wire-cut, and surface grinding. Serving injection molding and stamping industries.',
  'Heavy engineering fabrication for cement, power, and mining sectors. IS 2062 and ASME certified.',
  'Modular tooling and fixtures for automotive assembly lines. Design-to-delivery in 4-6 weeks.',
  'High-precision CNC machining for hydraulic components, pump housings, and valve bodies.',
  'Open-die and closed-die forging specialists. Carbon steel, alloy steel, and stainless steel forgings.',
  'Multi-metal processing — aluminium extrusion, copper bus-bars, and brass components.',
];

const CERTIFICATIONS = [
  ['ISO 9001:2015', 'ISO 14001:2015', 'IATF 16949'],
  ['ISO 9001:2015', 'ASME U Stamp'],
  ['ISO 9001:2015', 'ISO 14001:2015', 'CE Marking'],
  ['ISO 9001:2015', 'AS9100D', 'NADCAP'],
  ['ISO 9001:2015', 'ISO 45001:2018'],
  ['ISO 9001:2015', 'BIS License'],
  ['ISO 9001:2015', 'ISO 14001:2015'],
  ['ISO 9001:2015', 'PED Certified'],
  ['ISO 9001:2015', 'API 6A'],
  ['ISO 9001:2015'],
];

const PRODUCT_NAMES = [
  ['SS 304 Flanges', 'Alloy Steel Bushings', 'Precision Turned Shafts'],
  ['Forged Crankshafts', 'Railway Couplers', 'Heavy Hex Bolts'],
  ['SS Sheet Metal Enclosures', 'Control Panel Housings', 'Custom Brackets'],
  ['CNC Machined Valve Bodies', 'Hydraulic Manifolds', 'Pump Impellers'],
  ['Belt Conveyor Systems', 'Structural Trusses', 'Platform Gratings'],
  ['Laser-Cut Chassis Parts', 'Welded Assemblies', 'Sheet Metal Ducts'],
  ['CI Manhole Covers', 'SG Iron Housings', 'Steel Castings'],
  ['Aluminium Die Cast Parts', 'Zinc Alloy Components', 'Gravity Castings'],
  ['Ring Rolled Flanges', 'Forged Discs', 'Open-Die Shafts'],
  ['GI Binding Wire', 'MS Wire Rods', 'Spring Steel Wire'],
  ['Precision Bolts M6-M48', 'CNC Turned Pins', 'Shoulder Screws'],
  ['Gate Valves DN50-DN600', 'Globe Valves', 'Check Valves'],
  ['Inconel 718 Turbine Blades', 'Titanium Fasteners', 'Hastelloy Fittings'],
  ['HR Coil Slitting', 'CR Sheet Blanks', 'GP Sheet Shearing'],
  ['Injection Mold Tools', 'Press Tool Dies', 'Jigs & Fixtures'],
  ['Cement Plant Kiln Shells', 'Boiler Components', 'Mill Liners'],
  ['Robotic Weld Fixtures', 'Assembly Pallets', 'Modular Gauges'],
  ['Hydraulic Cylinder Barrels', 'Pump Housings', 'Gear Blanks'],
  ['Forged Rings DN100-DN3000', 'Rolled Rings', 'Custom Flanges'],
  ['Aluminium Extrusions', 'Copper Bus Bars', 'Brass Fittings'],
];

const FALLBACK_INQUIRIES = Array.from({ length: 20 }).map((_, index) => ({
  id: `inq-${index + 1}`,
  productName: PRODUCT_NAMES[index % PRODUCT_NAMES.length][0],
  category: CATEGORIES[index % CATEGORIES.length],
  description: `Requirement for ${PRODUCT_NAMES[index % PRODUCT_NAMES.length][0]} with QA documentation, material test certificates, and committed delivery schedule. Annual contract possible for reliable supplier.`,
  quantity: `${(index + 1) * 500} ${index % 2 === 0 ? 'pieces' : 'MT'}`,
  budgetRange: `INR ${250 + index * 15} - ${380 + index * 20} per ${index % 2 === 0 ? 'piece' : 'kg'}`,
  budget: 250 + index * 15,
  location: LOCATIONS[index % LOCATIONS.length],
  urgency: index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW',
  createdAt: daysAgoISO(index % 30),
  status: 'OPEN',
}));

const FALLBACK_SUPPLIERS = Array.from({ length: 20 }).map((_, index) => ({
  id: `sup-${index + 1}`,
  companyName: SUPPLIER_NAMES[index],
  description: SUPPLIER_DESCRIPTIONS[index],
  location: LOCATIONS[index % LOCATIONS.length],
  isVerified: index % 3 !== 2,
  rating: Number((3.8 + (index % 6) * 0.2).toFixed(1)),
  certifications: CERTIFICATIONS[index % CERTIFICATIONS.length],
  employeeCount: [50, 120, 250, 500, 75, 180, 320, 90, 150, 200][index % 10],
  yearsInBusiness: [12, 28, 8, 35, 15, 22, 45, 6, 18, 30][index % 10],
  responseTimeHours: [2, 4, 6, 1, 3, 8, 2, 5, 4, 3][index % 10],
  completionRate: [98, 95, 92, 99, 96, 88, 97, 94, 93, 91][index % 10],
  exportCountries: [4, 12, 0, 8, 6, 3, 15, 2, 7, 1][index % 10],
  productionCapacity: [`${4500 + index * 500} units/month`, `${200 + index * 50} MT/month`][index % 2],
  createdAt: daysAgoISO((index * 5) % 365),
  products: PRODUCT_NAMES[index].map((name, p) => ({
    id: `sp-${index + 1}-${p + 1}`,
    productName: name,
    category: CATEGORIES[(index + p) % CATEGORIES.length],
    priceRange: `INR ${200 + index * 15 + p * 10} - ${320 + index * 18 + p * 12} per unit`,
    moq: `${120 + index * 20 + p * 25} pcs`,
    productionCapacity: `${4500 + index * 250} pcs/month`,
  })),
}));

export async function fetchBackend<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_BASE}/api${path}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getInquiryDetail(id: string) {
  const live = await fetchBackend<any>(`/inquiries/${id}`);
  if (live) return live;
  return FALLBACK_INQUIRIES.find((item) => item.id === id) || null;
}

export async function getSupplierDetail(id: string) {
  const live = await fetchBackend<any>(`/suppliers/${id}`);
  if (live) return live;
  return FALLBACK_SUPPLIERS.find((item) => item.id === id) || null;
}
