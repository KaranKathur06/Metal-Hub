import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Calendar,
    MapPin,
    Package,
    ShieldCheck,
    Wrench,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { RfqPublicDetail as RfqDetail } from "@/lib/marketplace/public-entities";
import { PremiumRfqQuotePanel } from "@/components/marketplace/PremiumRfqQuotePanel";

type RfqPublicDetailProps = {
    rfq: RfqDetail;
};

export function RfqPublicDetailView({ rfq }: RfqPublicDetailProps) {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="border-b border-slate-200 bg-white">
                <div className="container py-3">
                    <Link
                        href="/marketplace?type=buyers"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Buyer Requirements
                    </Link>
                </div>
            </div>

            <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
                <div className="container relative z-10 py-10">
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold capitalize text-white">
                            {rfq.status}
                        </span>
                        {rfq.visibilityLevel === "premium" ? (
                            <span className="inline-flex rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
                                Premium RFQ
                            </span>
                        ) : null}
                    </div>
                    <h1 className="mt-4 max-w-4xl text-3xl font-bold text-white md:text-4xl">
                        {rfq.title}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
                        {rfq.description}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {rfq.location}
                        </span>
                        {rfq.quantity ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                                <Package className="h-3.5 w-3.5" />
                                {rfq.quantity}
                            </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Posted {formatDate(rfq.createdAt)}
                        </span>
                    </div>
                </div>
            </section>

            <div className="container py-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                <Package className="h-5 w-5 text-blue-600" />
                                Requirement overview
                            </h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <InfoTile label="Quantity" value={rfq.quantity ?? "Contact buyer"} />
                                <InfoTile label="Budget" value={rfq.budgetRange ?? "Open budget"} />
                                <InfoTile label="Delivery" value={rfq.deliveryTimeline ?? "To be agreed"} />
                                <InfoTile label="Required by" value={rfq.deliveryTimeline ?? "Flexible"} />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                <Wrench className="h-5 w-5 text-blue-600" />
                                Technical scope
                            </h2>
                            <FacetChips items={rfq.capabilities} label="Capabilities" />
                            <FacetChips items={rfq.industries} label="Industries" />
                            <FacetChips items={rfq.products} label="Products" />
                        </section>

                        {rfq.buyerCompanyName ? (
                            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Buyer organization
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">{rfq.buyerCompanyName}</p>
                            </section>
                        ) : null}
                    </div>

                    <aside className="lg:sticky lg:top-24 lg:h-fit">
                        <PremiumRfqQuotePanel
                            rfqId={rfq.id}
                            rfqSlug={rfq.slug}
                            isPremium={rfq.visibilityLevel === "premium"}
                        />
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                Verified procurement workflow
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{value}</p>
        </div>
    );
}

function FacetChips({
    items,
    label,
}: {
    items: Array<{ name: string; slug: string }>;
    label: string;
}) {
    if (!items.length) return null;

    return (
        <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {items.map((item) => (
                    <span
                        key={item.slug}
                        className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                    >
                        {item.name}
                    </span>
                ))}
            </div>
        </div>
    );
}

