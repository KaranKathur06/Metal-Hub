// src/lib/marketplace/types.ts
export type VerificationStatus =
    | "unverified"
    | "pending"
    | "verified"
    | "rejected"
    | "suspended";

export type CertificationLifecycleStatus =
    | "active"
    | "pending_verification"
    | "under_review"
    | "expired"
    | "suspended"
    | "revoked"
    | "rejected";

export type MarketplaceSettings = {
    id: string;
    version_name: string;
    status: "draft" | "scheduled" | "active" | "expired" | "rolled_back" | "archived";
    seeded_supplier_weight: number;
    seeded_rfq_weight: number;
    real_supplier_boost: number;
    real_rfq_boost: number;
    exact_phrase_boost: number;
    capability_weight: number;
    product_weight: number;
    certification_weight: number;
    verification_weight: number;
    activity_weight: number;
    profile_completeness_weight: number;
    interaction_weight: number;
    location_weight: number;
    supplier_name_weight: number;
    seed_decay_threshold: number;
    seed_visibility_decay_rate: number;
    minimum_real_threshold: number;
    maximum_seed_visibility: number;
};

export type SupplierFilters = {
    q?: string;
    capabilities?: string[];
    industries?: string[];
    products?: string[];
    certifications?: string[];
    cities?: string[];
    verification?: VerificationStatus[];
    includeSeeded?: boolean;
    page?: number;
    pageSize?: number;
};

export type MarketplaceCertification = {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    verification_status: CertificationLifecycleStatus;
    expires_at: string | null;
    global_recognition_level: number;
    business_priority: number;
};

export type SupplierSearchResult = {
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
    profile_completeness: number;
    interaction_count: number;
    supplier_rank_score: number;
    is_seeded: boolean;
    match_score: number;
    total_score: number;
    capabilities: Array<{ name: string; slug: string }>;
    industries: Array<{ name: string; slug: string }>;
    products: Array<{ name: string; slug: string }>;
    certifications: MarketplaceCertification[];
};

export type PaginatedSupplierResults = {
    results: SupplierSearchResult[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};