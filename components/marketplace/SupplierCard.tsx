"use client";

import Link from "next/link";
import { Award, BadgeCheck, Clock, Factory, Globe2, Package, ShieldCheck } from "lucide-react";
import type { MarketplaceSupplier } from "@/lib/marketplace/supplier-query";
import { getVisibleCertificationBadges } from "@/lib/marketplace/ranking";
import { MinimalSupplierTrustChip } from "@/components/marketplace/MinimalSupplierTrustChip";

type SupplierCardProps = {
    supplier: MarketplaceSupplier;
};

export function SupplierCard({ supplier }: SupplierCardProps) {
    const certificationBadges = getVisibleCertificationBadges(supplier.certifications, 3);
    const primaryCapabilities = supplier.capabilities.slice(0, 3);

    return (
        <article className="group grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                    {supplier.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={supplier.logo_url}
                            alt={`${supplier.company_name} logo`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <Factory className="h-6 w-6 text-zinc-500" aria-hidden="true" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href={`/suppliers/${supplier.slug}`}
                            className="text-base font-semibold text-zinc-950 hover:text-zinc-700"
                        >
                            {supplier.company_name}
                        </Link>

                        <MinimalSupplierTrustChip
                            trustScore={supplier.trust_score ?? undefined}
                            trustLevel={
                                (supplier.trust_level as 0 | 1 | 2 | 3 | 4 | null) ??
                                (supplier.verification_status === "verified" ? 3 : 0)
                            }
                        />
                        {supplier.verification_status === "verified" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                Verified
                            </span>
                        ) : null}
                    </div>

                    <p className="mt-1 text-sm text-zinc-600">
                        {supplier.city}, {supplier.state}
                    </p>
                </div>
            </div>

            <p className="line-clamp-2 text-sm leading-6 text-zinc-700">
                {supplier.short_description}
            </p>

            <div className="flex flex-wrap gap-2">
                {primaryCapabilities.map((capability) => (
                    <span
                        key={capability.slug}
                        className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700"
                    >
                        {capability.name}
                    </span>
                ))}
            </div>

            <div className="grid gap-3 border-y border-zinc-100 py-4 sm:grid-cols-3">
                <Metric
                    icon={<Package className="h-4 w-4" aria-hidden="true" />}
                    label="Featured"
                    value={supplier.featured_product ?? "Build-to-print parts"}
                />
                <Metric
                    icon={<Factory className="h-4 w-4" aria-hidden="true" />}
                    label="Capacity"
                    value={supplier.production_capacity ?? "On request"}
                />
                <Metric
                    icon={<Clock className="h-4 w-4" aria-hidden="true" />}
                    label="Response"
                    value={`${supplier.response_rate}% / ${supplier.avg_response_time ?? "same day"}`}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-700">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    {supplier.years_in_business} yrs
                </span>

                {certificationBadges.visible.map((certification) => (
                    <span
                        key={certification.slug}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100"
                    >
                        <Award className="h-3.5 w-3.5" aria-hidden="true" />
                        {certification.name}
                    </span>
                ))}

                {certificationBadges.overflowCount > 0 ? (
                    <div className="relative">
                        <button
                            type="button"
                            className="peer rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200"
                            aria-label={`${certificationBadges.overflowCount} more certifications`}
                        >
                            +{certificationBadges.overflowCount} more
                        </button>
                        <div className="pointer-events-none absolute left-0 top-7 z-30 hidden min-w-44 rounded-md border border-zinc-200 bg-white p-2 text-xs text-zinc-700 shadow-lg peer-hover:block peer-focus:block">
                            <div className="grid gap-1">
                                {certificationBadges.overflow.map((certification) => (
                                    <span key={certification.slug}>{certification.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : null}

                {supplier.export_capability ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
                        <Globe2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Export
                    </span>
                ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-zinc-500">
                    {supplier.recent_activity ?? "Active supplier profile"}
                </div>

                <div className="flex gap-2">
                    <Link
                        href={`/suppliers/${supplier.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                        View Profile
                    </Link>
                    <Link
                        href={`/rfq/new?supplier=${supplier.slug}`}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-950 px-3 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                        Send RFQ
                    </Link>
                </div>
            </div>
        </article>
    );
}

function Metric({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                {icon}
                {label}
            </div>
            <div className="mt-1 truncate text-sm font-medium text-zinc-900">{value}</div>
        </div>
    );
}