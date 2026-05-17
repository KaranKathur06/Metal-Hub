/**
 * Metal Hub — Server-side Marketplace Data Layer
 * Queries Supabase directly for inquiry/supplier detail pages.
 * Falls back to demo data only if Supabase is unavailable AND ID matches fallback format.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server-client';

function daysAgoISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

// ─── INQUIRY DETAIL ───
export async function getInquiryDetail(id: string) {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('rfqs')
      .select('id, title, slug, description, quantity, target_price, delivery_timeline, status, created_at, buyer_profile_id')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      return {
        id: data.id,
        productName: data.title || 'Untitled Requirement',
        description: data.description || '',
        quantity: data.quantity || 'Contact for details',
        budgetRange: data.target_price || 'Open Budget',
        budget: null,
        location: 'India',
        category: '',
        material: null as string | null,
        industry: null as { name?: string } | null,
        capability: null as { name?: string; slug?: string } | null,
        capabilityMappings: [] as Array<{ capability?: { name?: string; slug?: string } }>,
        specDocUrls: [] as string[],
        urgency: 'MEDIUM' as const,
        viewsCount: 0,
        quoteCount: 0,
        createdAt: data.created_at,
        status: data.status?.toUpperCase() || 'OPEN',
      };
    }

    if (error) {
      console.error('[getInquiryDetail]', error.message);
    }
  }

  // Fallback for legacy demo IDs only
  return FALLBACK_INQUIRIES.find((item) => item.id === id) || null;
}

// ─── SUPPLIER DETAIL ───
export async function getSupplierDetail(id: string) {
  const supabase = createSupabaseServerClient();
  if (supabase) {
    // Try as company ID first
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, slug, verification_status, trust_level, years_in_business, company_size, website, gst_number')
      .eq('id', id)
      .maybeSingle();

    if (company) {
      // Get listings for this company
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title, slug, metal_type, grade, price_min, price_max, moq, lead_time')
        .eq('company_id', company.id)
        .eq('is_active', true)
        .limit(5);

      return {
        id: company.id,
        companyName: company.name,
        tagline: null as string | null,
        description: '',
        location: 'India',
        isVerified: company.verification_status === 'approved',
        rating: 4.5,
        certifications: [] as string[],
        capabilities: [] as Array<{ id?: string; name?: string; slug?: string }>,
        industries: [] as Array<{ id?: string; name?: string; slug?: string }>,
        isoCertified: false,
        exportReady: false,
        employeeCount: parseInt(company.company_size) || 0,
        yearsInBusiness: company.years_in_business || 0,
        responseTimeHours: 4,
        responseTimeMinutes: 240,
        completionRate: 95,
        exportCountries: 0,
        productionCapacity: 'Contact for details',
        createdAt: new Date().toISOString(),
        products: (listings || []).map((l: any) => ({
          id: l.id,
          productName: l.title,
          category: l.metal_type || '',
          material: l.grade || l.metal_type || '',
          priceRange: l.price_min ? `₹${l.price_min.toLocaleString()} - ₹${(l.price_max || l.price_min).toLocaleString()}` : 'On request',
          moq: l.moq || 'Custom',
          productionCapacity: l.lead_time || 'On request',
        })),
      };
    }
  }

  // Fallback for legacy demo IDs only
  return FALLBACK_SUPPLIERS.find((item) => item.id === id) || null;
}

// ─── LEGACY BACKEND FETCH (kept for backward compat) ───
const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchBackend<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_BASE}/api${path}`, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

// ─── FALLBACK DATA (for demo/offline) ───
const CATEGORIES = ['casting', 'forging', 'fabrication', 'machining', 'wire-drawing'] as const;
const LOCATIONS = ['Ahmedabad, Gujarat', 'Pune, Maharashtra', 'Chennai, Tamil Nadu', 'Mumbai, Maharashtra', 'Bengaluru, Karnataka', 'Rajkot, Gujarat', 'Coimbatore, Tamil Nadu', 'Ludhiana, Punjab', 'Delhi NCR', 'Jamshedpur, Jharkhand'];
const SUPPLIER_NAMES = ['Apex Alloy Industries', 'TitanForge Engineering Pvt Ltd', 'NovaSteel Components', 'Vertex Precision Metals', 'BluePeak Industrial Systems', 'IronGrid Fabrication Works', 'Bharat Heavy Metallics', 'SteelCraft Manufacturing', 'Paramount Castings & Forgings', 'Shree Balaji Metal Tech'];
const PRODUCT_NAMES = [['SS 304 Flanges'], ['Forged Crankshafts'], ['SS Sheet Metal Enclosures'], ['CNC Machined Valve Bodies'], ['Belt Conveyor Systems'], ['Laser-Cut Chassis Parts'], ['CI Manhole Covers'], ['Aluminium Die Cast Parts'], ['Ring Rolled Flanges'], ['GI Binding Wire']];

const FALLBACK_INQUIRIES = Array.from({ length: 10 }).map((_, i) => ({
  id: `inq-${i + 1}`,
  productName: PRODUCT_NAMES[i % PRODUCT_NAMES.length][0],
  category: CATEGORIES[i % CATEGORIES.length],
  description: `Requirement for ${PRODUCT_NAMES[i % PRODUCT_NAMES.length][0]} with QA documentation and committed delivery.`,
  quantity: `${(i + 1) * 500} pieces`,
  budgetRange: `INR ${250 + i * 15} - ${380 + i * 20} per piece`,
  budget: 250 + i * 15,
  location: LOCATIONS[i % LOCATIONS.length],
  urgency: (i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
  createdAt: daysAgoISO(i % 30),
  status: 'OPEN',
  material: null,
  industry: null,
  capability: null,
  capabilityMappings: [],
  specDocUrls: [],
  viewsCount: 0,
  quoteCount: 0,
}));

const FALLBACK_SUPPLIERS = Array.from({ length: 10 }).map((_, i) => ({
  id: `sup-${i + 1}`,
  companyName: SUPPLIER_NAMES[i],
  tagline: null as string | null,
  description: `Industrial manufacturer based in ${LOCATIONS[i % LOCATIONS.length]}.`,
  location: LOCATIONS[i % LOCATIONS.length],
  isVerified: i % 3 !== 2,
  rating: Number((3.8 + (i % 6) * 0.2).toFixed(1)),
  certifications: ['ISO 9001:2015'],
  capabilities: [] as Array<{ id?: string; name?: string; slug?: string }>,
  industries: [] as Array<{ id?: string; name?: string; slug?: string }>,
  isoCertified: true,
  exportReady: i % 2 === 0,
  employeeCount: 100 + i * 50,
  yearsInBusiness: 10 + i * 3,
  responseTimeHours: 4,
  responseTimeMinutes: 240,
  completionRate: 90 + i % 10,
  exportCountries: i % 5,
  productionCapacity: `${4500 + i * 500} units/month`,
  createdAt: daysAgoISO((i * 5) % 365),
  products: PRODUCT_NAMES[i].map((name, p) => ({
    id: `sp-${i + 1}-${p + 1}`,
    productName: name,
    category: CATEGORIES[(i + p) % CATEGORIES.length],
    priceRange: `INR ${200 + i * 15} - ${320 + i * 18} per unit`,
    moq: `${120 + i * 20} pcs`,
    productionCapacity: `${4500 + i * 250} pcs/month`,
  })),
}));
