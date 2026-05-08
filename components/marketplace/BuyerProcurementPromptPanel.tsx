"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { evaluateProcurementGate } from "../../lib/marketplace/procurement-gates";

type BuyerProcurementPromptPanelProps = {
  developmentTrustMode: boolean;
  currentTrustLevel: 0 | 1 | 2 | 3 | 4;
  emailVerified: boolean;
  profileCompletionPercent?: number | null;
};

export function BuyerProcurementPromptPanel({
  developmentTrustMode,
  currentTrustLevel,
  emailVerified,
  profileCompletionPercent,
}: BuyerProcurementPromptPanelProps) {
  const rfqGate = evaluateProcurementGate({
    action: "publish_rfq",
    role: "buyer",
    currentTrustLevel,
    profileCompletionPercent,
    emailVerified,
    developmentTrustMode,
  });

  if (!rfqGate.message) {
    return null;
  }

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-950 text-white">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-950">Procurement readiness</h2>
          <p className="mt-1 text-sm text-zinc-600">{rfqGate.message}</p>
          <Link className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800" href="/onboarding/buyer">
            Improve buyer profile
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

