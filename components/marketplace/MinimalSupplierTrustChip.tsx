"use client";

import { PublicSupplierTrustChip } from "./PublicSupplierTrustChip";

type MinimalSupplierTrustChipProps = {
  trustScore?: number | null;
  trustLevel?: 0 | 1 | 2 | 3 | 4 | null;
  showEmailVerified?: boolean;
};

export function MinimalSupplierTrustChip({
  trustScore,
  trustLevel,
  showEmailVerified = false,
}: MinimalSupplierTrustChipProps) {
  return (
    <PublicSupplierTrustChip
      trustScore={trustScore}
      trustLevel={trustLevel}
      showEmailVerified={showEmailVerified}
    />
  );
}
