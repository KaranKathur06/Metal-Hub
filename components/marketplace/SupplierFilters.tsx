"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { MarketplaceFacet } from "@/lib/marketplace/supplier-query";
import {
    buildSupplierSearchUrl,
    parseSupplierSearchParams,
    type SupplierSearchFilters,
} from "@/lib/marketplace/search";

type SupplierFiltersProps = {
    facets: {
        capabilities: MarketplaceFacet[];
        industries: MarketplaceFacet[];
        products: MarketplaceFacet[];
        certifications: MarketplaceFacet[];
    };
    cities?: string[];
};

const DEFAULT_CITIES = [
    "Rajkot",
    "Ahmedabad",
    "Pune",
    "Mumbai",
    "Chennai",
    "Coimbatore",
    "Bengaluru",
    "Vadodara",
    "Faridabad",
    "Surat",
];

export function SupplierFilters({
    facets,
    cities = DEFAULT_CITIES,
}: SupplierFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const filters = parseSupplierSearchParams(searchParams);

    function updateFilters(nextFilters: SupplierSearchFilters) {
        router.push(
            buildSupplierSearchUrl(pathname, {
                ...nextFilters,
                page: 1,
            }),
        );
    }

    function toggleArrayValue(
        key: "capabilities" | "industries" | "products" | "certifications" | "cities",
        value: string,
    ) {
        const existing = filters[key] ?? [];
        const nextValues = existing.includes(value)
            ? existing.filter((item) => item !== value)
            : [...existing, value];

        updateFilters({
            ...filters,
            [key]: nextValues,
        });
    }

    function setQuery(value: string) {
        updateFilters({
            ...filters,
            query: value.trim() || undefined,
        });
    }

    function clearAll() {
        router.push(pathname);
    }

    return (
        <aside className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                    Filters
                </div>

                <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Clear
                </button>
            </div>

            <form
                className="mt-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    setQuery(String(formData.get("q") ?? ""));
                }}
            >
                <label className="sr-only" htmlFor="supplier-search">
                    Search suppliers
                </label>
                <div className="flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3">
                    <Search className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                    <input
                        id="supplier-search"
                        name="q"
                        defaultValue={filters.query ?? ""}
                        placeholder="forged crankshaft, titanium CNC, SS 304 flange"
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    />
                </div>
            </form>

            <div className="mt-5 grid gap-5">
                <FilterGroup title="Capabilities">
                    {facets.capabilities.map((facet) => (
                        <CheckboxFilter
                            key={facet.slug}
                            label={facet.name}
                            checked={filters.capabilities?.includes(facet.slug) ?? false}
                            onChange={() => toggleArrayValue("capabilities", facet.slug)}
                        />
                    ))}
                </FilterGroup>

                <FilterGroup title="Products & Materials">
                    {facets.products.map((facet) => (
                        <CheckboxFilter
                            key={facet.slug}
                            label={facet.name}
                            checked={filters.products?.includes(facet.slug) ?? false}
                            onChange={() => toggleArrayValue("products", facet.slug)}
                        />
                    ))}
                </FilterGroup>

                <FilterGroup title="Industries">
                    {facets.industries.map((facet) => (
                        <CheckboxFilter
                            key={facet.slug}
                            label={facet.name}
                            checked={filters.industries?.includes(facet.slug) ?? false}
                            onChange={() => toggleArrayValue("industries", facet.slug)}
                        />
                    ))}
                </FilterGroup>

                <FilterGroup title="Certifications">
                    {facets.certifications.slice(0, 8).map((facet) => (
                        <CheckboxFilter
                            key={facet.slug}
                            label={facet.name}
                            checked={filters.certifications?.includes(facet.slug) ?? false}
                            onChange={() => toggleArrayValue("certifications", facet.slug)}
                        />
                    ))}
                </FilterGroup>

                <FilterGroup title="Location">
                    {cities.map((city) => (
                        <CheckboxFilter
                            key={city}
                            label={city}
                            checked={filters.cities?.includes(city) ?? false}
                            onChange={() => toggleArrayValue("cities", city)}
                        />
                    ))}
                </FilterGroup>

                <FilterGroup title="Trust">
                    <CheckboxFilter
                        label="Verified suppliers"
                        checked={filters.verification === "verified"}
                        onChange={() =>
                            updateFilters({
                                ...filters,
                                verification:
                                    filters.verification === "verified" ? null : "verified",
                            })
                        }
                    />
                    <CheckboxFilter
                        label="Hide seeded liquidity"
                        checked={filters.includeSeeded === false}
                        onChange={() =>
                            updateFilters({
                                ...filters,
                                includeSeeded: filters.includeSeeded === false,
                            })
                        }
                    />
                </FilterGroup>
            </div>
        </aside>
    );
}

function FilterGroup({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <h3 className="text-xs font-semibold uppercase tracking-normal text-zinc-500">
                {title}
            </h3>
            <div className="mt-2 grid gap-2">{children}</div>
        </section>
    );
}

function CheckboxFilter({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950"
            />
            <span className="min-w-0 truncate">{label}</span>
        </label>
    );
}