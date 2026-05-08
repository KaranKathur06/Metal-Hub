import type { OnboardingSession } from "./onboarding-session";
import type { ProfileCompletionResult } from "./profile-completion";
import type { TrustTier } from "./trust-engine";

export type TrustNudge = {
  key: string;
  title: string;
  body: string;
  href?: string;
  priority: 1 | 2 | 3;
};

export function buildSellerTrustNudges(input: {
  profileCompletion?: ProfileCompletionResult | null;
  onboardingSession?: OnboardingSession | null;
  trustLevel?: TrustTier["level"] | null;
  verificationStatus?: string | null;
  hasListings?: boolean;
  developmentTrustMode: boolean;
}) {
  const nudges: TrustNudge[] = [];

  if ((input.trustLevel ?? 0) < 1) {
    nudges.push({
      key: "verify-email",
      title: "Verify supplier identity",
      body: "Complete email verification to improve marketplace credibility and unlock stronger procurement actions.",
      href: "/verify-email",
      priority: 1,
    });
  }

  if (input.profileCompletion && input.profileCompletion.overallPercent < 60) {
    const weakestSection = [...input.profileCompletion.sections]
      .sort((a, b) => a.percent - b.percent)[0];

    if (weakestSection) {
      nudges.push({
        key: `complete-${weakestSection.key}`,
        title: `Improve ${weakestSection.label}`,
        body: `Strengthen ${weakestSection.label.toLowerCase()} to improve buyer trust and RFQ visibility.`,
        href: "/onboarding/seller",
        priority: 1,
      });
    }
  }

  if (input.verificationStatus !== "approved" && input.verificationStatus !== "in_review") {
    nudges.push({
      key: "upload-documents",
      title: "Add verification evidence",
      body: "Upload GST, registration, or certification documents to move toward verified supplier status.",
      href: "/onboarding/seller?step=documents",
      priority: 2,
    });
  }

  if (!input.hasListings) {
    nudges.push({
      key: "create-listing",
      title: "Publish your first listing",
      body: "Add one media-rich listing so buyers can evaluate your capability and start RFQ conversations.",
      href: "/seller/listings/new",
      priority: 1,
    });
  }

  const skippedEntries = Object.entries(input.onboardingSession?.skippedStepDetails ?? {});

  for (const [stepKey, details] of skippedEntries) {
    if (details.nudgeCount >= 3 && !input.developmentTrustMode) {
      continue;
    }

    nudges.push({
      key: `resume-${stepKey}`,
      title: "Resume a skipped onboarding step",
      body: "Revisit skipped supplier information to unlock stronger marketplace visibility and trust signals.",
      href: "/onboarding/seller",
      priority: 3,
    });
  }

  return nudges
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 4);
}

