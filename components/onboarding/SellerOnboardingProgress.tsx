"use client";

import { CheckCircle2, Circle, CircleDashed, SkipForward } from "lucide-react";
import {
  SELLER_ONBOARDING_STEPS,
  getSellerOnboardingProgress,
  type SellerOnboardingState,
} from "../../lib/marketplace/seller-onboarding";

type SellerOnboardingProgressProps = {
  values: Record<string, unknown>;
  state?: Partial<SellerOnboardingState>;
};

const statusIcon = {
  complete: CheckCircle2,
  draft: CircleDashed,
  skipped: SkipForward,
  not_started: Circle,
};

export function SellerOnboardingProgress({ values, state }: SellerOnboardingProgressProps) {
  const progress = getSellerOnboardingProgress(values, state);

  return (
    <section className="rounded-md border border-zinc-800 bg-zinc-950 p-4 text-zinc-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Supplier Profile Progress</h2>
          <p className="mt-1 text-xs text-zinc-400">Strengthen buyer confidence and improve marketplace visibility.</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">{progress.percent}%</div>
          <div className="text-xs text-zinc-400">{progress.completedCount}/{SELLER_ONBOARDING_STEPS.length} complete</div>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-amber-500" style={{ width: `${progress.percent}%` }} />
      </div>

      <div className="mt-4 grid gap-2">
        {progress.steps.map((step) => {
          const Icon = statusIcon[step.status];

          return (
            <div key={step.key} className="flex items-start gap-3 rounded-md border border-zinc-800 px-3 py-2">
              <Icon className="mt-0.5 h-4 w-4 text-amber-400" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs capitalize text-zinc-400">{step.status.replace("_", " ")}</div>
                </div>
                <div className="mt-1 text-xs text-zinc-400">{step.goal}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

