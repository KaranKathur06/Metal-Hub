"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import type { OnboardingSession } from "../../lib/marketplace/onboarding-session";
import type { ProfileCompletionResult } from "../../lib/marketplace/profile-completion";
import { buildSellerTrustNudges } from "../../lib/marketplace/trust-nudges";
import type { TrustTier } from "../../lib/marketplace/trust-engine";

type SellerTrustImprovementPanelProps = {
  profileCompletion?: ProfileCompletionResult | null;
  onboardingSession?: OnboardingSession | null;
  trustLevel?: TrustTier["level"] | null;
  verificationStatus?: string | null;
  hasListings?: boolean;
  developmentTrustMode: boolean;
};

export function SellerTrustImprovementPanel({
  profileCompletion,
  onboardingSession,
  trustLevel,
  verificationStatus,
  hasListings,
  developmentTrustMode,
}: SellerTrustImprovementPanelProps) {
  const nudges = buildSellerTrustNudges({
    profileCompletion,
    onboardingSession,
    trustLevel,
    verificationStatus,
    hasListings,
    developmentTrustMode,
  });

  if (!nudges.length) {
    return null;
  }

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-700">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Supplier trust improvements</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Improve buyer confidence and unlock stronger marketplace visibility with a few targeted updates.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {nudges.map((nudge) => (
          <div key={nudge.key} className="rounded-md border border-zinc-200 px-3 py-3">
            <div className="text-sm font-medium text-zinc-900">{nudge.title}</div>
            <div className="mt-1 text-sm text-zinc-600">{nudge.body}</div>
            {nudge.href ? (
              <Link className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800" href={nudge.href}>
                Continue
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

