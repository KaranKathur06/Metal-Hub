type CapabilitySeed = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

type FallbackSupplierProduct = {
  id: string;
  productName: string;
  category: string;
  material: string;
  priceRange: string;
  moq: string;
  productionCapacity: string;
};

type FallbackSupplier = {
  id: string;
  companyName: string;
  tagline: string;
  description: string;
  location: string;
  isVerified: boolean;
  isoCertified: boolean;
  exportReady: boolean;
  rating: number;
  responseTimeMinutes: number;
  completionRate: number;
  createdAt: string;
  capabilities: Array<{ id: string; name: string; slug: string }>;
  industries: Array<{ id: string; name: string; slug: string }>;
  products: FallbackSupplierProduct[];
};

type FallbackInquiry = {
  id: string;
  productName: string;
  description: string;
  quantity: string;
  budget: number;
  budgetRange: string;
  location: string;
  category: string;
  material: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  status: 'OPEN';
  viewsCount: number;
  quoteCount: number;
  capability: { id: string; name: string; slug: string } | null;
  industry: { id: string; name: string; slug: string } | null;
  capabilityMappings: Array<{
    capability: { id: string; name: string; slug: string };
  }>;
  buyer?: {
    profile?: {
      kycStatus?: 'VERIFIED' | 'PENDING';
    };
  };
};

type BaseQuery = {
  search?: string;
  location?: string[];
  category?: string[];
  capability?: string[];
  industry?: string[];
  verified?: boolean;
  moqRange?: 'lt-100' | '100-1000' | 'gt-1000';
  date?: 'last-24h' | 'last-7d' | 'last-30d';
  sortBy?: 'latest' | 'verified' | 'price' | 'rating' | 'response' | 'completion';
  page?: number;
  limit?: number;
};

const CAPABILITIES: CapabilitySeed[] = [
  {
    id: 'cap-casting',
    name: 'Casting',
    slug: 'casting',
    description: 'Precision ferrous and non-ferrous cast components.',
  },
  {
    id: 'cap-forging',
    name: 'Forging',
    slug: 'forging',
    description: 'Closed-die and open-die forged industrial parts.',
  },
  {
    id: 'cap-fabrication',
    name: 'Fabrication',
    slug: 'fabrication',
    description: 'Sheet metal and structural fabrication services.',
  },
  {
    id: 'cap-machining',
    name: 'Machining',
    slug: 'machining',
    description: 'CNC turning, milling and tight-tolerance machining.',
  },
  {
    id: 'cap-wire-drawing',
    name: 'Wire Drawing',
    slug: 'wire-drawing',
    description: 'Copper, brass and steel wire drawing operations.',
  },
];

const INDUSTRIES = [
  { id: 'ind-automotive', name: 'Automotive', slug: 'automotive' },
  { id: 'ind-aerospace', name: 'Aerospace', slug: 'aerospace' },
  { id: 'ind-construction', name: 'Construction', slug: 'construction' },
  { id: 'ind-oil-gas', name: 'Oil & Gas', slug: 'oil-gas' },
  { id: 'ind-industrial', name: 'Industrial Machinery', slug: 'industrial-machinery' },
  { id: 'ind-power', name: 'Power & Energy', slug: 'power-energy' },
] as const;

const LOCATIONS = [
  'Ahmedabad, India',
  'Rajkot, India',
  'Pune, India',
  'Chennai, India',
  'Mumbai, India',
  'Delhi NCR, India',
  'Dubai, UAE',
  'Houston, USA',
  'Berlin, Germany',
  'Singapore',
] as const;

const MATERIALS = [
  'Aluminum 6061',
  'SS304',
  'SS316',
  'EN8 Steel',
  'Ductile Iron',
  'Brass C360',
  'Copper ETP',
] as const;

const SUPPLIER_BASE_NAMES = [
  'Apex Foundry Works',
  'Shakti Forge Components',
  'Rudra Precision Metals',
  'Tristar Industrial Castings',
  'NovaFab Engineering',
  'Surya CNC Solutions',
  'Omkar Wire Industries',
  'BluePeak Alloys',
  'Vertex Metallurgy',
  'Sigma Machined Parts',
] as const;

const BUYER_REQUIREMENT_TEMPLATES = [
  'Need high-pressure pump housing castings for oilfield skids with EN10204 3.1 certification.',
  'Looking for forged axle stubs for heavy trucks, ultrasonic-tested and normalized.',
  'Seeking fabricated stainless enclosures for electrical panels with IP65 standard.',
  'Require CNC-machined aluminum brackets for EV battery packs, +-0.02 mm tolerance.',
  'Need copper wire drawing support for winding wire, bright finish and RoHS compliant.',
] as const;

function daysAgoIso(days: number) {
  const value = new Date();
  value.setDate(value.getDate() - days);
  return value.toISOString();
}

function firstNumericValue(text: string) {
  const match = text.match(/[\d,.]+/);
  if (!match) return 0;
  return Number.parseFloat(match[0].replace(/,/g, '')) || 0;
}

function matchesMulti(value: string, filters?: string[]) {
  if (!filters || filters.length === 0) return true;
  const normalized = value.toLowerCase();
  return filters.some((entry) => normalized.includes(entry.toLowerCase()));
}

function getDateCutoff(date?: 'last-24h' | 'last-7d' | 'last-30d') {
  if (!date) return null;
  const now = new Date();
  const cutoff = new Date(now);

  if (date === 'last-24h') cutoff.setHours(now.getHours() - 24);
  else if (date === 'last-7d') cutoff.setDate(now.getDate() - 7);
  else cutoff.setDate(now.getDate() - 30);

  return cutoff;
}

const FALLBACK_SUPPLIERS: FallbackSupplier[] = Array.from({ length: 35 }).map((_, index) => {
  const capability = CAPABILITIES[index % CAPABILITIES.length];
  const extraCapability = CAPABILITIES[(index + 2) % CAPABILITIES.length];
  const industry = INDUSTRIES[index % INDUSTRIES.length];
  const extraIndustry = INDUSTRIES[(index + 1) % INDUSTRIES.length];
  const company = `${SUPPLIER_BASE_NAMES[index % SUPPLIER_BASE_NAMES.length]} ${Math.floor(index / 10) + 1}`;
  const createdAt = daysAgoIso((index * 2) % 30);
  const isVerified = index % 3 !== 0;
  const productCount = index % 2 === 0 ? 2 : 3;

  const products: FallbackSupplierProduct[] = Array.from({ length: productCount }).map((__, p) => {
    const cap = CAPABILITIES[(index + p) % CAPABILITIES.length];
    const material = MATERIALS[(index + p) % MATERIALS.length];
    const moqValue = 60 + index * 40 + p * 50;
    const priceStart = 180 + index * 12 + p * 8;

    return {
      id: `fsp-${index + 1}-${p + 1}`,
      productName: `${cap.name} ${material} Component ${index + 1}-${p + 1}`,
      category: cap.slug,
      material,
      priceRange: `INR ${priceStart} - ${priceStart + 70} / unit`,
      moq: `${moqValue} pcs`,
      productionCapacity: `${5500 + index * 220} pcs/month`,
    };
  });

  return {
    id: `sup-${index + 1}`,
    companyName: company,
    tagline: 'Industrial supplier for OEM and export programs',
    description: `Certified ${capability.name.toLowerCase()} and ${extraCapability.name.toLowerCase()} partner focused on repeat quality and schedule adherence.`,
    location: LOCATIONS[index % LOCATIONS.length],
    isVerified,
    isoCertified: index % 4 !== 0,
    exportReady: index % 5 !== 0,
    rating: Number((3.8 + (index % 6) * 0.2).toFixed(1)),
    responseTimeMinutes: 30 + (index % 8) * 18,
    completionRate: 78 + (index % 9) * 2,
    createdAt,
    capabilities: [
      { id: capability.id, name: capability.name, slug: capability.slug },
      { id: extraCapability.id, name: extraCapability.name, slug: extraCapability.slug },
    ],
    industries: [
      { id: industry.id, name: industry.name, slug: industry.slug },
      { id: extraIndustry.id, name: extraIndustry.name, slug: extraIndustry.slug },
    ],
    products,
  };
});

const FALLBACK_INQUIRIES: FallbackInquiry[] = Array.from({ length: 35 }).map((_, index) => {
  const capability = CAPABILITIES[index % CAPABILITIES.length];
  const industry = INDUSTRIES[index % INDUSTRIES.length];
  const material = MATERIALS[index % MATERIALS.length];
  const createdAt = daysAgoIso((index * 3) % 30);
  const urgency: 'HIGH' | 'MEDIUM' | 'LOW' =
    index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW';
  const budgetStart = 250000 + index * 18000;

  return {
    id: `inq-${index + 1}`,
    productName: `${capability.name} ${material} Requirement ${index + 1}`,
    description: BUYER_REQUIREMENT_TEMPLATES[index % BUYER_REQUIREMENT_TEMPLATES.length],
    quantity: index % 2 === 0 ? `${1200 + index * 40} units` : `${8 + (index % 6)} tons`,
    budget: budgetStart,
    budgetRange: `INR ${budgetStart.toLocaleString('en-IN')} - ${(budgetStart + 120000).toLocaleString('en-IN')}`,
    location: LOCATIONS[(index + 1) % LOCATIONS.length],
    category: capability.slug,
    material,
    urgency,
    createdAt,
    status: 'OPEN',
    viewsCount: 20 + index * 3,
    quoteCount: 1 + (index % 7),
    capability: { id: capability.id, name: capability.name, slug: capability.slug },
    industry: { id: industry.id, name: industry.name, slug: industry.slug },
    capabilityMappings: [{ capability: { id: capability.id, name: capability.name, slug: capability.slug } }],
    buyer: {
      profile: {
        kycStatus: index % 2 === 0 ? 'VERIFIED' : 'PENDING',
      },
    },
  };
});

function paginate<T>(rows: T[], page: number, limit: number) {
  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.min(20, Math.max(1, limit || 10));
  const total = rows.length;
  const start = (safePage - 1) * safeLimit;

  return {
    rows: rows.slice(start, start + safeLimit),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
}

export function getFallbackCapabilities(activeOnly: boolean = true) {
  const rows = CAPABILITIES.map((capability, index) => ({
    ...capability,
    imageUrl: `/capabilities/${capability.slug}.jpg`,
    heroImageUrl: `/capabilities/${capability.slug}-hero.jpg`,
    heroTitle: `${capability.name} Services`,
    heroSubtitle: `Explore trusted ${capability.name.toLowerCase()} suppliers with verified B2B records.`,
    isActive: true,
    orderIndex: index + 1,
  }));

  return activeOnly ? rows.filter((row) => row.isActive) : rows;
}

export function getFallbackInquiryById(id: string) {
  return FALLBACK_INQUIRIES.find((entry) => entry.id === id) || null;
}

export function getFallbackSupplierById(id: string) {
  return FALLBACK_SUPPLIERS.find((entry) => entry.id === id) || null;
}

export function getFallbackInquiries(query: BaseQuery) {
  const search = query.search?.toLowerCase() || '';
  const capabilityFilters = query.capability && query.capability.length > 0 ? query.capability : query.category;
  const cutoff = getDateCutoff(query.date);

  let rows = FALLBACK_INQUIRIES.filter((entry) => {
    if (search) {
      const text = `${entry.productName} ${entry.description} ${entry.material}`.toLowerCase();
      if (!text.includes(search)) return false;
    }

    if (!matchesMulti(entry.location, query.location)) return false;

    if (capabilityFilters && capabilityFilters.length > 0) {
      const capabilityMatch = capabilityFilters.some((filter) =>
        entry.capability?.slug.toLowerCase().includes(filter.toLowerCase()),
      );
      if (!capabilityMatch) return false;
    }

    if (query.industry && query.industry.length > 0) {
      const industrySlug = entry.industry?.slug.toLowerCase() || '';
      if (!query.industry.some((filter) => industrySlug.includes(filter.toLowerCase()))) {
        return false;
      }
    }

    if (typeof query.verified === 'boolean') {
      const verified = entry.buyer?.profile?.kycStatus === 'VERIFIED';
      if (verified !== query.verified) return false;
    }

    if (cutoff && new Date(entry.createdAt) < cutoff) return false;

    return true;
  });

  if (query.sortBy === 'price') {
    rows = [...rows].sort((a, b) => b.budget - a.budget);
  } else if (query.sortBy === 'verified') {
    rows = [...rows].sort((a, b) => {
      const aVerified = a.buyer?.profile?.kycStatus === 'VERIFIED' ? 1 : 0;
      const bVerified = b.buyer?.profile?.kycStatus === 'VERIFIED' ? 1 : 0;
      if (aVerified !== bVerified) return bVerified - aVerified;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } else {
    rows = [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return paginate(rows, query.page || 1, query.limit || 10);
}

export function getFallbackSuppliers(query: BaseQuery) {
  const search = query.search?.toLowerCase() || '';
  const capabilityFilters = query.capability && query.capability.length > 0 ? query.capability : query.category;
  const cutoff = getDateCutoff(query.date);

  let rows = FALLBACK_SUPPLIERS.filter((entry) => {
    if (search) {
      const text = [
        entry.companyName,
        entry.description,
        ...entry.products.map((product) => `${product.productName} ${product.material}`),
      ]
        .join(' ')
        .toLowerCase();
      if (!text.includes(search)) return false;
    }

    if (!matchesMulti(entry.location, query.location)) return false;

    if (capabilityFilters && capabilityFilters.length > 0) {
      const found = entry.capabilities.some((capability) =>
        capabilityFilters.some((filter) => capability.slug.includes(filter.toLowerCase())),
      );
      if (!found) return false;
    }

    if (query.industry && query.industry.length > 0) {
      const found = entry.industries.some((industry) =>
        query.industry?.some((filter) => industry.slug.includes(filter.toLowerCase())),
      );
      if (!found) return false;
    }

    if (typeof query.verified === 'boolean' && entry.isVerified !== query.verified) return false;

    if (query.moqRange) {
      const match = entry.products.some((product) => {
        const moq = firstNumericValue(product.moq);
        if (query.moqRange === 'lt-100') return moq < 100;
        if (query.moqRange === '100-1000') return moq >= 100 && moq <= 1000;
        return moq > 1000;
      });
      if (!match) return false;
    }

    if (cutoff && new Date(entry.createdAt) < cutoff) return false;

    return true;
  });

  if (query.sortBy === 'verified') {
    rows = [...rows].sort((a, b) => Number(b.isVerified) - Number(a.isVerified) || b.rating - a.rating);
  } else if (query.sortBy === 'price') {
    rows = [...rows].sort((a, b) => {
      const aMin = Math.min(...a.products.map((product) => firstNumericValue(product.priceRange)));
      const bMin = Math.min(...b.products.map((product) => firstNumericValue(product.priceRange)));
      return aMin - bMin;
    });
  } else if (query.sortBy === 'rating') {
    rows = [...rows].sort((a, b) => b.rating - a.rating);
  } else if (query.sortBy === 'response') {
    rows = [...rows].sort((a, b) => a.responseTimeMinutes - b.responseTimeMinutes);
  } else if (query.sortBy === 'completion') {
    rows = [...rows].sort((a, b) => b.completionRate - a.completionRate);
  } else {
    rows = [...rows].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return paginate(rows, query.page || 1, query.limit || 10);
}
