import { getPublicDevelopmentTrustMode } from "./platform-settings";

type ProfileLike = {
  email?: string | null;
  trust_level?: number;
  verification_status?: string | null;
};

type BuyerProfileLike = {
  trust_level?: number;
  profile_completion_percent?: number;
} | null;

type SellerProfileLike = {
  trust_level?: number;
  verification_status?: string | null;
  profile_completion_percent?: number;
} | null;
import { calculateProfileCompletion, BUYER_PROFILE_COMPLETION_SECTIONS, SELLER_PROFILE_COMPLETION_SECTIONS } from "./profile-completion";

export function getDevelopmentTrustMode() {
  return getPublicDevelopmentTrustMode();
}

export function getBuyerProcurementContext(input: {
  profile: ProfileLike | null;
  buyerProfile: BuyerProfileLike;
  emailVerified?: boolean;
}) {
  const trustLevel = Math.min(
    4,
    Math.max(0, input.buyerProfile?.trust_level ?? input.profile?.trust_level ?? 0),
  ) as 0 | 1 | 2 | 3 | 4;

  const completion = calculateProfileCompletion(
    {
      companyName: "Buyer",
      emailVerified: input.emailVerified ?? Boolean(input.profile?.email),
      procurementCategoryId: input.buyerProfile ? "set" : null,
      profileCompletionPercent: input.buyerProfile?.profile_completion_percent,
    },
    BUYER_PROFILE_COMPLETION_SECTIONS,
  );

  return {
    developmentTrustMode: getDevelopmentTrustMode(),
    currentTrustLevel: trustLevel,
    emailVerified: input.emailVerified ?? Boolean(input.profile?.email),
    profileCompletionPercent:
      input.buyerProfile?.profile_completion_percent ?? completion.overallPercent,
  };
}

export function getSellerProcurementContext(input: {
  profile: ProfileLike | null;
  sellerProfile: SellerProfileLike;
  companyName?: string | null;
  hasListings?: boolean;
  emailVerified?: boolean;
}) {
  const trustLevel = Math.min(
    4,
    Math.max(0, input.sellerProfile?.trust_level ?? input.profile?.trust_level ?? 0),
  ) as 0 | 1 | 2 | 3 | 4;

  const completion = calculateProfileCompletion(
    {
      companyName: input.companyName ?? "Supplier",
      emailVerified: input.emailVerified ?? Boolean(input.profile?.email),
      industryId: input.sellerProfile ? "set" : null,
      businessAddress: input.sellerProfile ? "set" : null,
      listingCount: input.hasListings ? 1 : 0,
    },
    SELLER_PROFILE_COMPLETION_SECTIONS,
  );

  return {
    developmentTrustMode: getDevelopmentTrustMode(),
    trustLevel,
    verificationStatus:
      input.sellerProfile?.verification_status ?? input.profile?.verification_status ?? null,
    profileCompletion: completion,
    hasListings: Boolean(input.hasListings),
  };
}
