import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import {
    getSupplierBySlug,
    searchMarketplaceSuppliers,
    type MarketplaceSupplier,
} from "@/lib/marketplace/supplier-query";

function mapRfqFacetRows(
    rows: unknown,
    key: "capabilities" | "industries" | "products",
): Array<{ name: string; slug: string }> {
    return ((rows as Array<Record<string, { name: string; slug: string }>>) ?? [])
        .map((row) => row[key])
        .filter((item): item is { name: string; slug: string } => Boolean(item?.name && item?.slug));
}

export type RfqPublicDetail = {
    id: string;
    slug: string;
    title: string;
    description: string;
    quantity: string | null;
    budgetRange: string | null;
    deliveryTimeline: string | null;
    status: string;
    visibilityLevel: string;
    buyerCompanyName: string | null;
    location: string;
    createdAt: string;
    capabilities: Array<{ name: string; slug: string }>;
    industries: Array<{ name: string; slug: string }>;
    products: Array<{ name: string; slug: string }>;
};

export async function loadSupplierPublicProfile(
    slug: string,
): Promise<MarketplaceSupplier | null> {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    return getSupplierBySlug(supabase, slug);
}

export async function loadRelatedSuppliers(
    supplier: MarketplaceSupplier,
    limit = 4,
): Promise<MarketplaceSupplier[]> {
    const supabase = createSupabaseServerClient();
    if (!supabase) return [];

    const capabilitySlug = supplier.capabilities[0]?.slug;
    const result = await searchMarketplaceSuppliers(supabase, {
        page: 1,
        pageSize: limit + 5,
        capabilities: capabilitySlug ? [capabilitySlug] : undefined,
        cities: supplier.city ? [supplier.city] : undefined,
        includeSeeded: true,
    });

    return result.suppliers
        .filter((item) => item.slug !== supplier.slug)
        .slice(0, limit);
}

export async function loadRfqPublicDetail(
    slugOrId: string,
): Promise<RfqPublicDetail | null> {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            slugOrId,
        );

    let query = supabase
        .from("rfqs")
        .select(
            `
      id,
      title,
      slug,
      description,
      quantity,
      budget_range,
      required_by,
      delivery_timeline,
      status,
      visibility_level,
      created_at,
      buyer_company_name,
      city,
      state,
      country,
      rfq_capabilities(capabilities(name, slug)),
      rfq_industries(industries(name, slug)),
      rfq_products(products(name, slug))
    `,
        )
        ;

    query = isUuid ? query.eq("id", slugOrId) : query.eq("slug", slugOrId);

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
        if (error) console.error("[loadRfqPublicDetail]", error.message);
        return null;
    }

    const location = [data.city, data.state, data.country].filter(Boolean).join(", ");

    return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        description: data.description,
        quantity: data.quantity,
        budgetRange: data.budget_range,
        deliveryTimeline: data.delivery_timeline,
        status: data.status,
        visibilityLevel: data.visibility_level ?? "standard",
        buyerCompanyName: data.buyer_company_name,
        location: location || "India",
        createdAt: data.created_at,
        capabilities: mapRfqFacetRows(data.rfq_capabilities, "capabilities"),
        industries: mapRfqFacetRows(data.rfq_industries, "industries"),
        products: mapRfqFacetRows(data.rfq_products, "products"),
    };
}

export function computeProfileCompleteness(supplier: MarketplaceSupplier) {
    const checks = [
        Boolean(supplier.short_description),
        Boolean(supplier.logo_url),
        Boolean(supplier.banner_url),
        supplier.capabilities.length > 0,
        supplier.industries.length > 0,
        supplier.products.length > 0,
        supplier.certifications.length > 0,
        supplier.verification_status === "verified",
        Boolean(supplier.featured_product),
        Boolean(supplier.recent_activity),
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
}
