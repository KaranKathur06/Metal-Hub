"use client";

import Link from "next/link";
import { ArrowRight, Factory, MapPin, Timer } from "lucide-react";
import { ListingMediaPreview } from "./ListingMediaPreview";
import { ProductCardTrustChip } from "./ProductCardTrustChip";
import type { ListingMedia } from "../../lib/marketplace/listing-media";

type ProductListingCardProps = {
  href: string;
  title: string;
  supplierName: string;
  media: ListingMedia[];
  trustLevel?: 0 | 1 | 2 | 3 | 4 | null;
  trustScore?: number | null;
  moq?: string | null;
  leadTime?: string | null;
  locationLabel?: string | null;
  primarySpec?: string | null;
};

export function ProductListingCard({
  href,
  title,
  supplierName,
  media,
  trustLevel,
  trustScore,
  moq,
  leadTime,
  locationLabel,
  primarySpec,
}: ProductListingCardProps) {
  return (
    <article className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <Link href={href} aria-label={title}>
        <ListingMediaPreview media={media} title={title} />
      </Link>

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <Link className="line-clamp-2 text-sm font-semibold text-zinc-950 hover:text-amber-700" href={href}>
              {title}
            </Link>
            <ProductCardTrustChip trustLevel={trustLevel} trustScore={trustScore} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Factory className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">{supplierName}</span>
          </div>
        </div>

        {primarySpec ? (
          <div className="line-clamp-2 rounded-md bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
            {primarySpec}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
          {moq ? (
            <div className="rounded-md border border-zinc-200 px-2 py-1.5">
              <div className="text-zinc-400">MOQ</div>
              <div className="truncate font-medium text-zinc-800">{moq}</div>
            </div>
          ) : null}

          {leadTime ? (
            <div className="rounded-md border border-zinc-200 px-2 py-1.5">
              <div className="flex items-center gap-1 text-zinc-400">
                <Timer className="h-3 w-3" aria-hidden="true" />
                Lead Time
              </div>
              <div className="truncate font-medium text-zinc-800">{leadTime}</div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
          {locationLabel ? (
            <div className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{locationLabel}</span>
            </div>
          ) : (
            <div />
          )}

          <Link className="inline-flex items-center gap-1 rounded-md bg-zinc-950 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-800" href={href}>
            RFQ
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

