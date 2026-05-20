"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { SellerTrustImprovementPanel } from "@/components/marketplace/SellerTrustImprovementPanel";
import { getSellerProcurementContext } from "@/lib/marketplace/procurement-context";

type SellerTrustSectionProps = {
  hasListings?: boolean;
};

export function SellerTrustSection({ hasListings = false }: SellerTrustSectionProps) {
  const { profile, sellerProfile, company, developmentTrustMode } = useAuth();

  const ctx = getSellerProcurementContext({
    profile,
    sellerProfile,
    companyName: company?.name,
    hasListings,
    emailVerified: Boolean(profile?.email),
  });

  return (
    <SellerTrustImprovementPanel
      profileCompletion={ctx.profileCompletion}
      trustLevel={ctx.trustLevel}
      verificationStatus={ctx.verificationStatus}
      hasListings={ctx.hasListings}
      developmentTrustMode={developmentTrustMode ?? ctx.developmentTrustMode}
    />
  );
}
