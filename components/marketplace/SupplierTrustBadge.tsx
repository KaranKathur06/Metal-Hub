"use client";

import { CheckCircle2, CircleDot, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { getTrustTier, type TrustTier } from "../../lib/marketplace/trust-engine";

type SupplierTrustBadgeProps = {
  trustScore?: number | null;
  trustLevel?: TrustTier["level"] | null;
  compact?: boolean;
};

const tierStyles: Record<TrustTier["level"], string> = {
  0: "border-zinc-700 bg-zinc-900 text-zinc-300",
  1: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  2: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  3: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  4: "border-violet-500/30 bg-violet-500/10 text-violet-200",
};

const tierIcons = {
  0: CircleDot,
  1: UserCheck,
  2: CheckCircle2,
  3: ShieldCheck,
  4: Sparkles,
};

export function SupplierTrustBadge({ trustScore, trustLevel, compact = false }: SupplierTrustBadgeProps) {
  const tier = typeof trustLevel === "number"
    ? getTrustTier([0, 20, 45, 65, 85][trustLevel] ?? 0)
    : getTrustTier(trustScore ?? 0);
  const Icon = tierIcons[tier.level];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${tierStyles[tier.level]}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {compact ? tier.badgeLabel.replace(" Supplier", "") : tier.badgeLabel}
    </span>
  );
}

