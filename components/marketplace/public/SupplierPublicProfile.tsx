import Link from "next/link";
import {
    ArrowLeft,
    Award,
    BadgeCheck,
    Building2,
    Clock3,
    Factory,
    Globe2,
    Mail,
    MapPin,
    Package,
    ShieldCheck,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierCard } from "@/components/marketplace/SupplierCard";
import { getVisibleCertificationBadges } from "@/lib/marketplace/ranking";
import type { MarketplaceSupplier } from "@/lib/marketplace/supplier-query";
import type { SupplierIdentityTrust } from "@/lib/marketplace/supplier-identity";
import { SupplierProfileTrustSummary } from "@/components/marketplace/SupplierProfileTrustSummary";
import { SupplierListingCards } from "@/components/marketplace/public/SupplierListingCards";

type SupplierListingPreview = {
    id: string;
    title: string;
    slug: string;
    metal_type: string | null;
    price_min: number | null;
    price_max: number | null;
    moq: string | null;
    is_featured: boolean | null;
};

type SupplierPublicProfileProps = {
    supplier: MarketplaceSupplier & Partial<SupplierIdentityTrust>;
    relatedSuppliers: MarketplaceSupplier[];
    profileStrength: number;
    listings?: SupplierListingPreview[];
};

export function SupplierPublicProfile({
    supplier,
    relatedSuppliers,
    profileStrength,
    listings = [],
}: SupplierPublicProfileProps) {
    const certificationBadges = getVisibleCertificationBadges(supplier.certifications, 6);
    const locationLabel = [supplier.city, supplier.state, supplier.country]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="border-b border-slate-200 bg-white">
                <div className="container py-3">
                    <Link
                        href="/marketplace?type=suppliers"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Suppliers
                    </Link>
                </div>
            </div>

            <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
                <div className="container relative z-10 py-10">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div className="flex min-w-0 flex-1 gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
                                {supplier.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={supplier.logo_url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Factory className="h-8 w-8 text-slate-300" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    {supplier.verification_status === "verified" ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                                            <BadgeCheck className="h-3.5 w-3.5" />
                                            Verified Supplier
                                        </span>
                                    ) : null}
                                    {supplier.export_capability ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-bold text-indigo-300">
                                            <Globe2 className="h-3 w-3" />
                                            Export
                                        </span>
                                    ) : null}
                                </div>
                                <h1 className="text-3xl font-bold text-white md:text-4xl">
                                    {supplier.company_name}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                                    {supplier.short_description}
                                </p>
                                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-300">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {locationLabel}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <StatCard label="Profile strength" value={`${profileStrength}%`} />
                            <StatCard label="Response rate" value={`${supplier.response_rate}%`} />
                            <StatCard label="Completion" value={`${supplier.completion_rate}%`} />
                            <StatCard
                                label="Experience"
                                value={`${supplier.years_in_business} yrs`}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="container py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                        <Section title="About company" icon={<Building2 className="h-5 w-5" />}>
                            <p className="text-sm leading-relaxed text-slate-600">
                                {supplier.short_description}
                            </p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <MiniStat label="Featured product" value={supplier.featured_product ?? "—"} />
                                <MiniStat label="Material focus" value={supplier.featured_material ?? "—"} />
                                <MiniStat label="MOQ" value={supplier.moq ?? "On request"} />
                            </div>
                        </Section>

                        <Section title="Capabilities" icon={<ShieldCheck className="h-5 w-5" />}>
                            <FacetList items={supplier.capabilities} filterPrefix="capability" />
                        </Section>

                        <Section title="Industries served" icon={<TrendingUp className="h-5 w-5" />}>
                            <FacetList items={supplier.industries} filterPrefix="industry" />
                        </Section>

                        {listings.length > 0 ? (
                            <Section title="Product listings" icon={<Package className="h-5 w-5" />}>
                                <SupplierListingCards listings={listings} />
                            </Section>
                        ) : null}

                        <Section title="Products & materials" icon={<Package className="h-5 w-5" />}>
                            <FacetList items={supplier.products} filterPrefix="category" />
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <MiniStat
                                    label="Production capacity"
                                    value={supplier.production_capacity ?? "On request"}
                                />
                                <MiniStat label="Price range" value={supplier.price_range ?? "On request"} />
                            </div>
                        </Section>

                        <Section title="Certifications" icon={<Award className="h-5 w-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {certificationBadges.visible.map((cert) => (
                                    <span
                                        key={cert.slug}
                                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
                                    >
                                        {cert.name}
                                    </span>
                                ))}
                                {certificationBadges.overflowCount > 0 ? (
                                    <span className="text-xs text-slate-500">
                                        +{certificationBadges.overflowCount} more
                                    </span>
                                ) : null}
                            </div>
                        </Section>

                        {relatedSuppliers.length > 0 ? (
                            <Section title="Related suppliers" icon={<Factory className="h-5 w-5" />}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {relatedSuppliers.map((related) => (
                                        <SupplierCard key={related.id} supplier={related} />
                                    ))}
                                </div>
                            </Section>
                        ) : null}
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900">Send inquiry</h3>
                            <p className="mt-2 text-sm text-slate-600">
                                Share your requirement, quantity, and timeline to receive a
                                competitive quote from this supplier.
                            </p>
                            <Button
                                asChild
                                className="mt-5 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-5 text-base font-bold"
                            >
                                <Link href={`/rfq/new?supplier=${supplier.slug}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Request quotation
                                </Link>
                            </Button>
                            {supplier.recent_activity ? (
                                <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {supplier.recent_activity}
                                </p>
                            ) : null}
                        </div>

                        <SupplierProfileTrustSummary
                            trustScore={supplier.trustScore ?? supplier.trust_score ?? undefined}
                            trustLevel={
                                supplier.trustLevel ??
                                (supplier.trust_level as 0 | 1 | 2 | 3 | 4 | undefined)
                            }
                            verificationStatus={
                                supplier.verificationStatus ??
                                (supplier.verification_status === "verified"
                                    ? "approved"
                                    : supplier.verification_status)
                            }
                            responseTimeHours={supplier.responseTimeHours ?? undefined}
                            locationLabel={locationLabel}
                            certifications={
                                supplier.certificationLabels ??
                                supplier.certifications.map((cert) => cert.name)
                            }
                        />

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                                Profile strength
                            </h4>
                            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                <li className="flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    Profile completeness {profileStrength}%
                                </li>
                                <li className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                    {supplier.interaction_count} marketplace interactions
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <span className="text-blue-600">{icon}</span>
                {title}
            </h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function FacetList({
    items,
    filterPrefix,
}: {
    items: Array<{ name: string; slug: string }>;
    filterPrefix: string;
}) {
    if (!items.length) {
        return <p className="text-sm text-slate-500">Details will be updated soon.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <Link
                    key={item.slug}
                    href={`/marketplace?type=suppliers&${filterPrefix}=${item.slug}`}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                    {item.name}
                </Link>
            ))}
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[11px] text-slate-400">{label}</p>
        </div>
    );
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
        </div>
    );
}



