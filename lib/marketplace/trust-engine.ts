export type TrustSignalWeights = {
  identity: number;
  business: number;
  profileQuality: number;
  behavior: number;
  marketplacePerformance: number;
};

export type TrustSignals = {
  identity: number;
  business: number;
  profileQuality: number;
  behavior: number;
  marketplacePerformance: number;
};

export type TrustTier = {
  level: 0 | 1 | 2 | 3 | 4;
  name: string;
  badgeLabel: string;
  minScore: number;
  rankingBoost: number;
  description: string;
};

export type TrustGateResult = {
  allowed: boolean;
  hardBlocked: boolean;
  message?: string;
  requiredTier?: TrustTier["level"];
};

export const DEFAULT_TRUST_SIGNAL_WEIGHTS: TrustSignalWeights = {
  identity: 15,
  business: 25,
  profileQuality: 15,
  behavior: 25,
  marketplacePerformance: 20,
};

export const TRUST_TIERS: TrustTier[] = [
  {
    level: 0,
    name: "New Supplier",
    badgeLabel: "New Supplier",
    minScore: 0,
    rankingBoost: 0,
    description: "Account exists. Visible with baseline marketplace exposure.",
  },
  {
    level: 1,
    name: "Email Verified",
    badgeLabel: "Email Verified",
    minScore: 20,
    rankingBoost: 2,
    description: "Email verification completed. Small trust and ranking lift.",
  },
  {
    level: 2,
    name: "Business Profile Complete",
    badgeLabel: "Business Profile Complete",
    minScore: 45,
    rankingBoost: 6,
    description: "Company details and sourcing profile are substantially complete.",
  },
  {
    level: 3,
    name: "Document Verified",
    badgeLabel: "Verified Business",
    minScore: 65,
    rankingBoost: 12,
    description: "Business documents submitted and reviewed or review-ready.",
  },
  {
    level: 4,
    name: "Trusted Supplier",
    badgeLabel: "Trusted Supplier",
    minScore: 85,
    rankingBoost: 20,
    description: "Strong identity, business, profile, behavior, and marketplace performance signals.",
  },
];

const clampScore = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

export function calculateTrustScore(
  signals: Partial<TrustSignals>,
  weights: TrustSignalWeights = DEFAULT_TRUST_SIGNAL_WEIGHTS,
) {
  const totalWeight =
    weights.identity +
    weights.business +
    weights.profileQuality +
    weights.behavior +
    weights.marketplacePerformance;

  if (totalWeight <= 0) {
    return 0;
  }

  const weightedScore =
    clampScore(signals.identity ?? 0) * weights.identity +
    clampScore(signals.business ?? 0) * weights.business +
    clampScore(signals.profileQuality ?? 0) * weights.profileQuality +
    clampScore(signals.behavior ?? 0) * weights.behavior +
    clampScore(signals.marketplacePerformance ?? 0) * weights.marketplacePerformance;

  return Math.round((weightedScore / totalWeight) * 100) / 100;
}

export function getTrustTier(score: number): TrustTier {
  const normalizedScore = clampScore(score);

  return [...TRUST_TIERS]
    .sort((a, b) => b.minScore - a.minScore)
    .find((tier) => normalizedScore >= tier.minScore) ?? TRUST_TIERS[0];
}

export function calculateMarketplaceRankScore(input: {
  trustScore: number;
  profileCompletionScore?: number;
  activityScore?: number;
  responseScore?: number;
  listingQualityScore?: number;
  rfqSuccessScore?: number;
  freshnessScore?: number;
  engagementScore?: number;
  rankingStage?: "development" | "growth" | "marketplace_performance";
}) {
  const tier = getTrustTier(input.trustScore);
  const rankingStage = input.rankingStage ?? "development";
  const trustProfileScore =
    clampScore(input.trustScore) * 0.5 +
    clampScore(input.profileCompletionScore ?? input.listingQualityScore ?? 0) * 0.25 +
    clampScore(input.listingQualityScore ?? 0) * 0.25;

  const behaviorScore =
    clampScore(input.activityScore ?? 0) * 0.25 +
    clampScore(input.responseScore ?? 0) * 0.35 +
    clampScore(input.freshnessScore ?? 0) * 0.25 +
    clampScore(input.engagementScore ?? 0) * 0.15;

  const marketplacePerformanceScore =
    behaviorScore * 0.45 +
    clampScore(input.rfqSuccessScore ?? 0) * 0.35 +
    clampScore(input.engagementScore ?? 0) * 0.2;

  const stageWeights = {
    development: {
      trustProfile: 0.8,
      behavior: 0.2,
      marketplacePerformance: 0,
    },
    growth: {
      trustProfile: 0.65,
      behavior: 0.25,
      marketplacePerformance: 0.1,
    },
    marketplace_performance: {
      trustProfile: 0.45,
      behavior: 0.25,
      marketplacePerformance: 0.3,
    },
  }[rankingStage];

  const baseScore =
    trustProfileScore * stageWeights.trustProfile +
    behaviorScore * stageWeights.behavior +
    marketplacePerformanceScore * stageWeights.marketplacePerformance;

  return Math.round((baseScore + tier.rankingBoost) * 100) / 100;
}

export function evaluateTrustGate(input: {
  developmentTrustMode: boolean;
  currentTier: TrustTier["level"];
  requiredTier: TrustTier["level"];
  actionLabel: string;
}): TrustGateResult {
  if (input.currentTier >= input.requiredTier) {
    return {
      allowed: true,
      hardBlocked: false,
    };
  }

  const message = `Complete your supplier trust profile to unlock stronger ${input.actionLabel} visibility.`;

  if (input.developmentTrustMode) {
    return {
      allowed: true,
      hardBlocked: false,
      message,
      requiredTier: input.requiredTier,
    };
  }

  return {
    allowed: false,
    hardBlocked: true,
    message,
    requiredTier: input.requiredTier,
  };
}
