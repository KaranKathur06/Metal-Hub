"use client";

import { ShieldCheck } from "lucide-react";
import { getPublicTrustSignal } from "../../lib/marketplace/trust-visibility";

type ProductCardTrustChipProps = {
  verified?: boolean;
  trusted?: boolean;
  trustScore?: number | null;
  trustLevel?: 0 | 1 | 2 | 3 | 4 | null;
};

export function ProductCardTrustChip({
  verified,
  trusted,
  trustScore,
  trustLevel,
}: ProductCardTrustChipProps) {
  const signal = getPublicTrustSignal({
    trustScore,
    trustLevel,
    showEmailVerified: false,
  });
  const isTrusted = trusted || signal.label === "Trusted Supplier";
  const isVerified = verified || signal.label === "Verified Supplier";

  if (!isVerified && !isTrusted) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      {isTrusted ? "Trusted Supplier" : "Verified Supplier"}
    </span>
  );
}
