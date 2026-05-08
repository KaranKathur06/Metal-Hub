"use client";

import { ShieldCheck, UserCheck } from "lucide-react";
import { getPublicTrustSignal } from "../../lib/marketplace/trust-visibility";

type PublicSupplierTrustChipProps = {
  trustScore?: number | null;
  trustLevel?: 0 | 1 | 2 | 3 | 4 | null;
  showEmailVerified?: boolean;
};

const styles = {
  light: "border-sky-500/25 bg-sky-500/10 text-sky-700",
  strong: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700",
  premium: "border-violet-500/25 bg-violet-500/10 text-violet-700",
};

export function PublicSupplierTrustChip({
  trustScore,
  trustLevel,
  showEmailVerified = false,
}: PublicSupplierTrustChipProps) {
  const signal = getPublicTrustSignal({
    trustScore,
    trustLevel,
    showEmailVerified,
  });

  if (!signal.visible || !signal.label || signal.strength === "none") {
    return null;
  }

  const Icon = signal.strength === "light" ? UserCheck : ShieldCheck;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium ${styles[signal.strength]}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {signal.label}
    </span>
  );
}

