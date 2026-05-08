import { getTrustTier, type TrustTier } from "./trust-engine";

export type PublicTrustSignal = {
  visible: boolean;
  label: "Email Verified" | "Verified Supplier" | "Verified Business" | "Trusted Supplier" | null;
  strength: "none" | "light" | "strong" | "premium";
};

export function getPublicTrustSignal(input: {
  trustScore?: number | null;
  trustLevel?: TrustTier["level"] | null;
  showEmailVerified?: boolean;
}): PublicTrustSignal {
  const tier = typeof input.trustLevel === "number"
    ? getTrustTier([0, 20, 45, 65, 85][input.trustLevel] ?? 0)
    : getTrustTier(input.trustScore ?? 0);

  if (tier.level >= 4) {
    return {
      visible: true,
      label: "Trusted Supplier",
      strength: "premium",
    };
  }

  if (tier.level >= 3) {
    return {
      visible: true,
      label: "Verified Supplier",
      strength: "strong",
    };
  }

  if (tier.level >= 1 && input.showEmailVerified) {
    return {
      visible: true,
      label: "Email Verified",
      strength: "light",
    };
  }

  return {
    visible: false,
    label: null,
    strength: "none",
  };
}

export function isPublicStrongTrustLevel(trustLevel?: TrustTier["level"] | null) {
  return typeof trustLevel === "number" && trustLevel >= 3;
}

