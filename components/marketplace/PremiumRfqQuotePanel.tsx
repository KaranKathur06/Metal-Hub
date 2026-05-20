"use client";

import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitQuoteForm } from "@/components/marketplace/SubmitQuoteForm";
import { ProcurementGateNotice } from "@/components/marketplace/ProcurementGateNotice";
import { useAuth } from "@/components/auth/AuthProvider";
import { evaluateProcurementGate } from "@/lib/marketplace/procurement-gates";
import { getSellerProcurementContext } from "@/lib/marketplace/procurement-context";

type PremiumRfqQuotePanelProps = {
  rfqId: string;
  rfqSlug: string;
  isPremium: boolean;
};

export function PremiumRfqQuotePanel({ rfqId, rfqSlug, isPremium }: PremiumRfqQuotePanelProps) {
  const { profile, sellerProfile, company, developmentTrustMode, loading, isAuthenticated } = useAuth();

  if (!isPremium) {
    return <SubmitQuoteForm rfqId={rfqId} rfqSlug={rfqSlug} />;
  }

  if (loading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />;
  }

  const ctx = getSellerProcurementContext({
    profile,
    sellerProfile,
    companyName: company?.name,
    hasListings: true,
    emailVerified: Boolean(profile?.email),
  });

  const premiumGate = evaluateProcurementGate({
    action: "access_premium_rfq",
    role: "seller",
    currentTrustLevel: ctx.trustLevel,
    profileCompletionPercent: ctx.profileCompletion.overallPercent,
    emailVerified: Boolean(profile?.email),
    developmentTrustMode: developmentTrustMode ?? ctx.developmentTrustMode,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <div className="flex items-center gap-2 text-amber-900">
          <Crown className="h-5 w-5" />
          <span className="text-sm font-bold uppercase tracking-wide">Premium RFQ</span>
        </div>
        <p className="mt-2 text-sm text-amber-900/80">
          High-value procurement opportunity. Trust tier 2+ required to view details and submit quotes.
        </p>
      </div>

      {!isAuthenticated ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <Lock className="h-5 w-5" />
            <h3 className="text-lg font-bold">Supplier login required</h3>
          </div>
          <p className="mt-2 text-sm text-slate-600">Sign in as a verified supplier to access premium RFQs.</p>
          <Link href={`/login?redirect=/rfq/${rfqSlug}`} className="mt-4 inline-block">
            <Button className="w-full">Login to continue</Button>
          </Link>
        </div>
      ) : !premiumGate.allowed && premiumGate.hardBlocked ? (
        <ProcurementGateNotice result={premiumGate} />
      ) : (
        <SubmitQuoteForm rfqId={rfqId} rfqSlug={rfqSlug} isPremium />
      )}
    </div>
  );
}
