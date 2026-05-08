"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, MapPin, ShieldCheck } from "lucide-react";
import { getRfqVisibilityLabel, type RfqStatus } from "../../lib/marketplace/procurement-workflow";

type RfqSummaryCardProps = {
  href: string;
  title: string;
  status: RfqStatus;
  visibilityLevel?: string | null;
  quantity?: string | null;
  deliveryTimeline?: string | null;
  locationLabel?: string | null;
  taxonomyLabel?: string | null;
};

export function RfqSummaryCard({
  href,
  title,
  status,
  visibilityLevel,
  quantity,
  deliveryTimeline,
  locationLabel,
  taxonomyLabel,
}: RfqSummaryCardProps) {
  return (
    <article className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link className="text-sm font-semibold text-zinc-950 hover:text-amber-700" href={href}>
            {title}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            {taxonomyLabel ? <span>{taxonomyLabel}</span> : null}
            <span className="capitalize">{status.replace("_", " ")}</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          {getRfqVisibilityLabel(visibilityLevel)}
        </span>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {quantity ? (
          <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm">
            <div className="text-zinc-500">Quantity</div>
            <div className="mt-1 font-medium text-zinc-900">{quantity}</div>
          </div>
        ) : null}

        {deliveryTimeline ? (
          <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm">
            <div className="flex items-center gap-1 text-zinc-500">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Delivery timeline
            </div>
            <div className="mt-1 font-medium text-zinc-900">{deliveryTimeline}</div>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {locationLabel ? (
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{locationLabel}</span>
          </div>
        ) : (
          <div />
        )}

        <Link className="inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:text-amber-700" href={href}>
          View RFQ
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

