import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupplierCertificationSummary } from "./ranking";
import type { VerificationStatus } from "./types";
import type { SupplierSearchFilters } from "./search";

export type MarketplaceFacet = {
    name: string;
    slug: string;
};

export type MarketplaceSupplier = {
    id: string;
    company_name: string;
    slug: string;
    short_description: string;
    logo_url: string | null;
    banner_url: string | null;
    city: string;
    state: string;
    country: string;
    verification_status: VerificationStatus;
    response_rate: number;
    completion_rate: number;
    years_in_business: number;
    avg_response_time: string | null;
    export_capability: boolean;
    domestic_capability: boolean;
    featured_product: string | null;
    featured_material: string | null;
    moq: string | null;
    production_capacity: string | null;
    price_range: string | null;
    recent_activity: string | null;
    is_seeded: boolean;
    profile_completeness: number;
    interaction_count: number;
    supplier_rank_score: number;
    computed_rank: number;
    capabilities: MarketplaceFacet[];
    industries: MarketplaceFacet[];
    products: Array<MarketplaceFacet & { family?: string | null }>;
    certifications: SupplierCertificationSummary[];
    /** Populated when identity bridge links to seller_profiles / companies */
    trust_level?: number | null;
    trust_score?: number | null;
};

export type SupplierSearchResult = {
    suppliers: MarketplaceSupplier[];
    totalCount: number;
    page: number;
    pageSize: number;
    pageCount: number;
};

export async function searchMarketplaceSuppliers(
    supabase: SupabaseClient,
    filters: SupplierSearchFilters,
): Promise<SupplierSearchResult> {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 12;

    const { data, error } = await supabase.rpc("search_marketplace_suppliers", {
        search_query: filters.query ?? null,
        capability_slugs: filters.capabilities ?? [],
        industry_slugs: filters.industries ?? [],
        product_slugs: filters.products ?? [],
        certification_slugs: filters.certifications ?? [],
        city_names: filters.cities ?? [],
        verification_filter: filters.verification ?? null,
        include_seeded: filters.includeSeeded ?? true,
        page_number: page,
        page_size: pageSize,
    });

    if (error) {
        throw new Error(`Supplier search failed: ${error.message}`);
    }

    const rows = (data ?? []) as Array<MarketplaceSupplier & { total_count: number }>;
    const totalCount = Number(rows[0]?.total_count ?? 0);

    return {
        suppliers: rows.map(({ total_count: _totalCount, ...supplier }) => ({
            ...supplier,
            capabilities: supplier.capabilities ?? [],
            industries: supplier.industries ?? [],
            products: supplier.products ?? [],
            certifications: supplier.certifications ?? [],
        })),
        totalCount,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
}

export async function getMarketplaceFacets(supabase: SupabaseClient) {
    const [capabilities, industries, products, certifications] = await Promise.all([
        supabase
            .from("capabilities")
            .select("name, slug")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        supabase
            .from("industries")
            .select("name, slug")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        supabase
            .from("products")
            .select("name, slug")
            .eq("is_active", true)
            .order("sort_order", { ascending: true }),
        supabase
            .from("certifications")
            .select("name, slug")
            .eq("is_active", true)
            .order("business_priority", { ascending: false }),
    ]);

    const firstError =
        capabilities.error || industries.error || products.error || certifications.error;

    if (firstError) {
        throw new Error(`Marketplace facets failed: ${firstError.message}`);
    }

    return {
        capabilities: capabilities.data ?? [],
        industries: industries.data ?? [],
        products: products.data ?? [],
        certifications: certifications.data ?? [],
    };
}

export async function getSupplierBySlug(
    supabase: SupabaseClient,
    slug: string,
): Promise<MarketplaceSupplier | null> {
    const result = await searchMarketplaceSuppliers(supabase, {
        page: 1,
        pageSize: 1,
        includeSeeded: true,
    });

    const supplier = result.suppliers.find((item) => item.slug === slug);
    if (supplier) return supplier;

    const { data, error } = await supabase
        .from("suppliers")
        .select(
            `
      id,
      company_name,
      slug,
      short_description,
      logo_url,
      banner_url,
      city,
      state,
      country,
      verification_status,
      response_rate,
      completion_rate,
      years_in_business,
      avg_response_time,
      export_capability,
      domestic_capability,
      featured_product,
      featured_material,
      moq,
      production_capacity,
      price_range,
      recent_activity,
      is_seeded,
      profile_completeness,
      interaction_count,
      supplier_rank_score,
      supplier_capabilities(capabilities(name, slug)),
      supplier_industries(industries(name, slug)),
      supplier_products(products(name, slug, product_family)),
      supplier_certifications(
        verification_status,
        expires_at,
        certifications(name, slug, business_priority, global_recognition_level)
      )
    `,
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(`Supplier lookup failed: ${error.message}`);
    }

    return {
        id: data.id,
        company_name: data.company_name,
        slug: data.slug,
        short_description: data.short_description,
        logo_url: data.logo_url,
        banner_url: data.banner_url,
        city: data.city,
        state: data.state,
        country: data.country,
        verification_status: data.verification_status,
        response_rate: data.response_rate,
        completion_rate: data.completion_rate,
        years_in_business: data.years_in_business,
        avg_response_time: data.avg_response_time,
        export_capability: data.export_capability,
        domestic_capability: data.domestic_capability,
        featured_product: data.featured_product,
        featured_material: data.featured_material,
        moq: data.moq,
        production_capacity: data.production_capacity,
        price_range: data.price_range,
        recent_activity: data.recent_activity,
        is_seeded: data.is_seeded,
        profile_completeness: data.profile_completeness,
        interaction_count: data.interaction_count,
        supplier_rank_score: data.supplier_rank_score,
        computed_rank: data.supplier_rank_score,
        capabilities: (data.supplier_capabilities ?? []).map((row: any) => row.capabilities),
        industries: (data.supplier_industries ?? []).map((row: any) => row.industries),
        products: (data.supplier_products ?? []).map((row: any) => ({
            name: row.products.name,
            slug: row.products.slug,
            family: row.products.product_family,
        })),
        certifications: (data.supplier_certifications ?? []).map((row: any) => ({
            name: row.certifications.name,
            slug: row.certifications.slug,
            status: row.verification_status,
            expires_at: row.expires_at,
            business_priority: row.certifications.business_priority,
            global_recognition_level: row.certifications.global_recognition_level,
        })),
    };
}