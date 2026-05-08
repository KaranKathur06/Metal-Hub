"use client";

import { BadgeCheck, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { SupplierTrustBadge } from "./SupplierTrustBadge";

type SupplierProfileTrustSummaryProps = {
  trustScore?: number | null;
  trustLevel?: 0 | 1 | 2 | 3 | 4 | null;
  verificationStatus?: string | null;
  responseTimeHours?: number | null;
  locationLabel?: string | null;
  certifications?: string[] | null;
};

function formatResponseTime(hours?: number | null) {
  if (!hours || hours <= 0) {
    return "Response history building";
  }

  if (hours < 1) {
    return "Typically replies in under 1 hour";
  }

  if (hours <= 24) {
    return `Typically replies within ${Math.round(hours)} hours`;
  }

  return `Typically replies within ${Math.round(hours / 24)} days`;
}

export function SupplierProfileTrustSummary({
  trustScore,
  trustLevel,
  verificationStatus,
  responseTimeHours,
  locationLabel,
  certifications,
}: SupplierProfileTrustSummaryProps) {
  const visibleCertifications = (certifications ?? []).slice(0, 4);

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <SupplierTrustBadge trustScore={trustScore} trustLevel={trustLevel} />
        {verificationStatus === "approved" ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified Business
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {locationLabel ? (
          <div className="rounded-md border border-zinc-200 px-3 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
              <MapPin className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              Location
            </div>
            <div className="mt-1 text-sm text-zinc-600">{locationLabel}</div>
          </div>
        ) : null}

        <div className="rounded-md border border-zinc-200 px-3 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
            <Clock3 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            Response speed
          </div>
          <div className="mt-1 text-sm text-zinc-600">{formatResponseTime(responseTimeHours)}</div>
        </div>
      </div>

      {visibleCertifications.length ? (
        <div className="mt-4">
          <div className="text-sm font-medium text-zinc-900">Certifications</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {visibleCertifications.map((certification) => (
              <span key={certification} className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-700">
                <BadgeCheck className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                {certification}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

