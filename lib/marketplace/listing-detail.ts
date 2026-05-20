import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export type PublicListing = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  metal_type: string | null;
  grade: string | null;
  material_spec: string | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  currency: string | null;
  is_negotiable: boolean | null;
  moq: string | null;
  lead_time: string | null;
  production_capacity: string | null;
  certifications: string[] | null;
  quantity_available: number | null;
  unit: string | null;
  listing_type: string | null;
  is_featured: boolean | null;
  views_count: number | null;
  inquiry_count: number | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  company_id: string | null;
  seller_profile_id: string | null;
};

export type ListingCompany = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  verification_status: string | null;
  trust_level: number | null;
  years_in_business: number | null;
  company_size: string | null;
  website: string | null;
  gst_number: string | null;
  marketplace_supplier_id: string | null;
};

export async function loadListingBySlug(slug: string): Promise<PublicListing | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("listings")
    .select(
      `
      id, title, slug, description, metal_type, grade, material_spec,
      price_min, price_max, price_unit, currency, is_negotiable,
      moq, lead_time, production_capacity, certifications,
      quantity_available, unit, listing_type, is_featured,
      views_count, inquiry_count, keywords, applications,
      seo_title, seo_description, is_active, created_at,
      company_id, seller_profile_id
    `,
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  return data;
}

export async function loadListingCompany(companyId: string | null): Promise<ListingCompany | null> {
  if (!companyId) return null;
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("companies")
    .select(
      "id, name, slug, logo_url, verification_status, trust_level, years_in_business, company_size, website, gst_number, marketplace_supplier_id",
    )
    .eq("id", companyId)
    .maybeSingle();

  return data;
}

export async function loadSupplierListings(input: {
  companyId?: string | null;
  sellerProfileId?: string | null;
  limit?: number;
}) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return [];

  let query = supabase
    .from("listings")
    .select("id, title, slug, metal_type, price_min, price_max, moq, is_featured, created_at")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(input.limit ?? 12);

  if (input.sellerProfileId) {
    query = query.eq("seller_profile_id", input.sellerProfileId);
  } else if (input.companyId) {
    query = query.eq("company_id", input.companyId);
  } else {
    return [];
  }

  const { data } = await query;
  return data ?? [];
}
