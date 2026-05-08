"use client";

import { Clock3, Gauge, MapPin } from "lucide-react";
import { SupplierTrustBadge } from "./SupplierTrustBadge";
import { PublicSupplierTrustChip } from "./PublicSupplierTrustChip";

type SupplierCardTrustSignalsProps = {
  trustScore?: number | null;
  trustLevel?: 0 | 1 | 2 | 3 | 4 | null;
  profileCompletionPercent?: number | null;
  responseTimeHours?: number | null;
  locationLabel?: string | null;
  variant?: "minimal" | "expanded";
};

function formatResponseTime(hours?: number | null) {
  if (!hours || hours <= 0) {
    return "Response pending";
  }

  if (hours < 1) {
    return "<1h response";
  }

  if (hours <= 24) {
    return `${Math.round(hours)}h response`;
  }

  return `${Math.round(hours / 24)}d response`;
}

export function SupplierCardTrustSignals({
  trustScore,
  trustLevel,
  profileCompletionPercent,
  responseTimeHours,
  locationLabel,
  variant = "minimal",
}: SupplierCardTrustSignalsProps) {
  if (variant === "minimal") {
    return <PublicSupplierTrustChip trustScore={trustScore} trustLevel={trustLevel} />;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
      <SupplierTrustBadge trustScore={trustScore} trustLevel={trustLevel} compact />

      {typeof profileCompletionPercent === "number" ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-zinc-700">
          <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
          {Math.max(0, Math.min(100, Math.round(profileCompletionPercent)))}% profile
        </span>
      ) : null}

      <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-zinc-700">
        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
        {formatResponseTime(responseTimeHours)}
      </span>

      {locationLabel ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-zinc-700">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {locationLabel}
        </span>
      ) : null}
    </div>
  );
}
