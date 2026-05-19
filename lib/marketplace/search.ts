import type { VerificationStatus } from "./types";

const TOKEN_LIMIT = 12;

export type SupplierSearchFilters = {
    query?: string;
    capabilities?: string[];
    industries?: string[];
    products?: string[];
    certifications?: string[];
    cities?: string[];
    verification?: VerificationStatus | null;
    includeSeeded?: boolean;
    page?: number;
    pageSize?: number;
};

export function normalizeSearchQuery(query?: string) {
    return (query ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 160);
}

export function toTsQueryInput(query?: string) {
    const normalized = normalizeSearchQuery(query);

    if (!normalized) return null;

    return normalized
        .split(" ")
        .map((token) => token.replace(/[^a-zA-Z0-9-]/g, ""))
        .filter(Boolean)
        .slice(0, TOKEN_LIMIT)
        .join(" & ");
}

export function hasActiveFilters(filters: SupplierSearchFilters) {
    return Boolean(
        normalizeSearchQuery(filters.query) ||
        filters.capabilities?.length ||
        filters.industries?.length ||
        filters.products?.length ||
        filters.certifications?.length ||
        filters.cities?.length ||
        filters.verification,
    );
}

function readCsvList(searchParams: URLSearchParams, key: string) {
    return searchParams
        .getAll(key)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean);
}

export function parseSupplierSearchParams(searchParams: URLSearchParams): SupplierSearchFilters {
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("limit") ?? searchParams.get("pageSize") ?? 20);
    const verificationParam = searchParams.get("verified");

    return {
        query: searchParams.get("search") ?? searchParams.get("q") ?? undefined,
        capabilities: readCsvList(searchParams, "capability"),
        industries: readCsvList(searchParams, "industry"),
        products: readCsvList(searchParams, "category").length
            ? readCsvList(searchParams, "category")
            : readCsvList(searchParams, "product"),
        certifications: readCsvList(searchParams, "certification"),
        cities: readCsvList(searchParams, "location").length
            ? readCsvList(searchParams, "location")
            : readCsvList(searchParams, "city"),
        verification:
            verificationParam === "true"
                ? "verified"
                : (searchParams.get("verification") as VerificationStatus | null) ?? null,
        includeSeeded: searchParams.get("includeSeeded") !== "false",
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pageSize: Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 6), 48) : 20,
    };
}

export function buildSupplierSearchUrl(pathname: string, filters: SupplierSearchFilters) {
    const params = new URLSearchParams();

    const addList = (key: string, values?: string[]) => {
        if (!values?.length) return;
        params.set(key, values.join(","));
    };

    if (filters.query) params.set("search", filters.query);
    addList("capability", filters.capabilities);
    addList("industry", filters.industries);
    addList("category", filters.products);
    addList("certification", filters.certifications);
    addList("location", filters.cities);

    if (filters.verification === "verified") params.set("verified", "true");
    if (filters.includeSeeded === false) params.set("includeSeeded", "false");
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.pageSize && filters.pageSize !== 20) params.set("limit", String(filters.pageSize));

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
}

// Backward-compatible aliases used by older marketplace helpers.
export type SupplierFilters = SupplierSearchFilters;
export const parseMarketplaceSearchParams = parseSupplierSearchParams;
export const buildMarketplaceSearchParams = buildSupplierSearchUrl;
