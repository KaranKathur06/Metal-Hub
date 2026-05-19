// src/lib/marketplace/search.ts
import type { SupplierFilters } from "./types";

const TOKEN_LIMIT = 12;

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

export function hasActiveFilters(filters: SupplierFilters) {
    return Boolean(
        normalizeSearchQuery(filters.q) ||
        filters.capabilities?.length ||
        filters.industries?.length ||
        filters.products?.length ||
        filters.certifications?.length ||
        filters.cities?.length ||
        filters.verification?.length,
    );
}

export function parseMarketplaceSearchParams(searchParams: URLSearchParams): SupplierFilters {
    const readList = (key: string) =>
        searchParams
            .getAll(key)
            .flatMap((value) => value.split(","))
            .map((value) => value.trim())
            .filter(Boolean);

    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 12);

    return {
        q: searchParams.get("q") ?? undefined,
        capabilities: readList("capability"),
        industries: readList("industry"),
        products: readList("product"),
        certifications: readList("certification"),
        cities: readList("city"),
        verification: readList("verification") as SupplierFilters["verification"],
        includeSeeded: searchParams.get("includeSeeded") !== "false",
        page: Number.isFinite(page) && page > 0 ? page : 1,
        pageSize: Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 6), 48) : 12,
    };
}

export function buildMarketplaceSearchParams(filters: SupplierFilters) {
    const params = new URLSearchParams();

    const addList = (key: string, values?: string[]) => {
        for (const value of values ?? []) {
            if (value) params.append(key, value);
        }
    };

    if (filters.q) params.set("q", filters.q);
    addList("capability", filters.capabilities);
    addList("industry", filters.industries);
    addList("product", filters.products);
    addList("certification", filters.certifications);
    addList("city", filters.cities);
    addList("verification", filters.verification);

    if (filters.includeSeeded === false) params.set("includeSeeded", "false");
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.pageSize && filters.pageSize !== 12) params.set("pageSize", String(filters.pageSize));

    return params;
}