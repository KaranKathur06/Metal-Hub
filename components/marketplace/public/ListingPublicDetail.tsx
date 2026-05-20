import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  MessageSquare,
  Package,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ListingCompany, PublicListing } from "@/lib/marketplace/listing-detail";

type ListingPublicDetailProps = {
  listing: PublicListing;
  company: ListingCompany | null;
  backHref?: string;
  backLabel?: string;
};

export function ListingPublicDetail({
  listing,
  company,
  backHref = "/marketplace",
  backLabel = "Marketplace",
}: ListingPublicDetailProps) {
  const isVerified = company?.verification_status === "approved";
  const certs = listing.certifications ?? [];
  const supplierHref = company?.slug
    ? `/suppliers/${company.slug}`
    : company?.marketplace_supplier_id
      ? `/suppliers/${company.marketplace_supplier_id}`
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="container flex items-center gap-2 py-3 text-sm text-slate-500">
          <Link href={backHref} className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
          </Link>
          <span>/</span>
          <span className="truncate font-medium text-slate-900">{listing.title}</span>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-200">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Package className="h-16 w-16" />
              </div>
              <div className="absolute left-4 top-4 flex gap-2">
                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                  {listing.metal_type || "Metal"}
                </Badge>
                {listing.is_featured ? (
                  <Badge className="border-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                    Premium
                  </Badge>
                ) : null}
              </div>
              {isVerified ? (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                  <CheckCircle className="h-3 w-3" /> Verified
                </div>
              ) : null}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{listing.title}</h1>
              {listing.grade ? <p className="mt-1 text-sm text-slate-500">Grade: {listing.grade}</p> : null}
              <div className="mt-4 flex flex-wrap items-baseline gap-4">
                {listing.price_min != null ? (
                  <div className="text-3xl font-bold text-slate-900">
                    {formatCurrency(listing.price_min)}
                    {listing.price_max && listing.price_max !== listing.price_min ? (
                      <span> — {formatCurrency(listing.price_max)}</span>
                    ) : null}
                    <span className="ml-1 text-base font-medium text-slate-500">
                      {listing.price_unit || "/ MT"}
                    </span>
                  </div>
                ) : null}
                {listing.is_negotiable ? (
                  <Badge variant="outline" className="border-emerald-200 text-emerald-600">
                    Negotiable
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-bold">Specifications</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {listing.material_spec ? (
                  <Spec label="Material spec" value={listing.material_spec} />
                ) : null}
                {listing.moq ? <Spec label="Minimum order" value={listing.moq} /> : null}
                {listing.lead_time ? <Spec label="Lead time" value={listing.lead_time} /> : null}
                {listing.production_capacity ? (
                  <Spec label="Production capacity" value={listing.production_capacity} />
                ) : null}
              </div>
            </div>

            {listing.description ? (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-3 text-lg font-bold">Description</h2>
                <p className="whitespace-pre-line text-slate-600">{listing.description}</p>
              </div>
            ) : null}

            {certs.length > 0 ? (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-3 text-lg font-bold">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {certs.map((cert) => (
                    <Badge
                      key={cert}
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <Link href={`/post-requirement?listing=${listing.id}`}>
                <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-base font-bold text-white">
                  <MessageSquare className="mr-2 h-5 w-5" /> Send inquiry
                </Button>
              </Link>
            </div>

            {company ? (
              <div className="rounded-xl border bg-white p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <Building2 className="h-6 w-6 text-slate-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{company.name}</p>
                    {isVerified ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <Shield className="h-3 w-3" /> Verified business
                      </div>
                    ) : null}
                  </div>
                </div>
                {supplierHref ? (
                  <Link href={supplierHref}>
                    <Button variant="outline" className="mt-2 w-full">
                      View supplier profile
                    </Button>
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
