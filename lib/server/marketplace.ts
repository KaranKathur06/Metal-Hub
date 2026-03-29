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
const LOCATIONS = ['Ahmedabad, India', 'Pune, India', 'Chennai, India', 'Mumbai, India', 'Bengaluru, India', 'Dubai, UAE', 'Houston, USA', 'Berlin, Germany', 'Singapore', 'Delhi NCR, India'];

const FALLBACK_INQUIRIES = Array.from({ length: 20 }).map((_, index) => ({
  id: `inq-${index + 1}`,
  productName: `${CATEGORIES[index % CATEGORIES.length].replace('-', ' ')} requirement ${index + 1}`,
  category: CATEGORIES[index % CATEGORIES.length],
  description: 'Industrial requirement with QA documentation and committed delivery schedule.',
  quantity: `${1000 + index * 100} units`,
  budgetRange: `INR ${250 + index * 10} - ${380 + index * 15} per unit`,
  budget: 250 + index * 10,
  location: LOCATIONS[index % LOCATIONS.length],
  urgency: index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW',
  createdAt: daysAgoISO(index % 30),
  status: 'OPEN',
}));

const FALLBACK_SUPPLIERS = Array.from({ length: 20 }).map((_, index) => ({
  id: `sup-${index + 1}`,
  companyName: `MetalHub Supplier ${index + 1}`,
  description: 'Export-focused industrial supplier with multi-process manufacturing capability.',
  location: LOCATIONS[(index + 2) % LOCATIONS.length],
  isVerified: index % 2 === 0,
  rating: Number((3.8 + (index % 6) * 0.2).toFixed(1)),
  createdAt: daysAgoISO((index * 2) % 30),
  products: Array.from({ length: 2 + (index % 2) }).map((__, p) => {
    const category = CATEGORIES[(index + p) % CATEGORIES.length];
    return {
      id: `sp-${index + 1}-${p + 1}`,
      productName: `${category.replace('-', ' ')} product ${index + 1}-${p + 1}`,
      category,
      priceRange: `INR ${200 + index * 15 + p * 10} - ${320 + index * 18 + p * 12}`,
      moq: `${120 + index * 20 + p * 25} pcs`,
      productionCapacity: `${4500 + index * 250} pcs/month`,
    };
  }),
}));

export async function fetchBackend<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_BASE}/api${path}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

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
