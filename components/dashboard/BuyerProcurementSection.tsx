"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { BuyerProcurementPromptPanel } from "@/components/marketplace/BuyerProcurementPromptPanel";
import { getBuyerProcurementContext } from "@/lib/marketplace/procurement-context";

export function BuyerProcurementSection() {
  const { profile, buyerProfile, developmentTrustMode, user } = useAuth();

  const ctx = getBuyerProcurementContext({
    profile,
    buyerProfile,
    emailVerified: Boolean(user?.email_confirmed_at ?? profile?.email),
  });

  return (
    <BuyerProcurementPromptPanel
      developmentTrustMode={developmentTrustMode ?? ctx.developmentTrustMode}
      currentTrustLevel={ctx.currentTrustLevel}
      emailVerified={ctx.emailVerified}
      profileCompletionPercent={ctx.profileCompletionPercent}
    />
  );
}
