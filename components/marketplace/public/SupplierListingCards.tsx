import Link from "next/link";
import { Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type SupplierListing = {
  id: string;
  title: string;
  slug: string;
  metal_type: string | null;
  price_min: number | null;
  price_max: number | null;
  moq: string | null;
  is_featured: boolean | null;
};

type SupplierListingCardsProps = {
  listings: SupplierListing[];
};

export function SupplierListingCards({ listings }: SupplierListingCardsProps) {
  if (listings.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No published product listings yet. Listings appear here after seller onboarding.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          href={`/products/${listing.slug}`}
          className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-slate-200">
              <Package className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 group-hover:text-blue-700">{listing.title}</p>
              <p className="mt-1 text-xs text-slate-500">{listing.metal_type || "Industrial metal"}</p>
              {listing.price_min != null ? (
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {formatCurrency(listing.price_min)}
                  {listing.price_max && listing.price_max !== listing.price_min
                    ? ` – ${formatCurrency(listing.price_max)}`
                    : ""}
                </p>
              ) : null}
              {listing.moq ? <p className="mt-1 text-xs text-slate-500">MOQ: {listing.moq}</p> : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
