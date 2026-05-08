"use client";

import Link from "next/link";
import { ArrowRight, Factory, MapPin } from "lucide-react";
import { MinimalSupplierTrustChip } from "./MinimalSupplierTrustChip";

type SupplierDirectoryCardProps = {
  href: string;
  companyName: string;
  summary?: string | null;
  locationLabel?: string | null;
  industryLabel?: string | null;
  trustScore?: number | null;
  trustLevel?: 0 | 1 | 2 | 3 | 4 | null;
  logoUrl?: string | null;
};

export function SupplierDirectoryCard({
  href,
  companyName,
  summary,
  locationLabel,
  industryLabel,
  trustScore,
  trustLevel,
  logoUrl,
}: SupplierDirectoryCardProps) {
  return (
    <article className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="h-12 w-12 rounded-md border border-zinc-200 object-cover" src={logoUrl} alt="" />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-zinc-950 text-white">
            <Factory className="h-5 w-5" aria-hidden="true" />
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link className="text-sm font-semibold text-zinc-950 hover:text-amber-700" href={href}>
                {companyName}
              </Link>
              {industryLabel ? <div className="mt-1 text-xs text-zinc-500">{industryLabel}</div> : null}
            </div>

            <MinimalSupplierTrustChip trustScore={trustScore} trustLevel={trustLevel} />
          </div>

          {summary ? <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{summary}</p> : null}

          <div className="mt-3 flex items-center justify-between gap-3">
            {locationLabel ? (
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{locationLabel}</span>
              </div>
            ) : (
              <div />
            )}

            <Link className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-amber-700" href={href}>
              View supplier
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

