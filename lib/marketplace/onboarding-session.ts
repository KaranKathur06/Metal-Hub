import {
  SELLER_ONBOARDING_STEPS,
  getSellerOnboardingProgress,
  type SellerOnboardingStepKey,
} from "./seller-onboarding";
import type { MarketplaceRole } from "./auth-navigation";

export type OnboardingSessionStatus = "active" | "completed" | "abandoned" | "archived" | "expired";

export type SkippedStepDetails = {
  skippedAt: string;
  skipReason?: string | null;
  lastNudgedAt?: string | null;
  nudgeCount: number;
};

export type OnboardingSession = {
  id?: string;
  userId: string;
  role: MarketplaceRole;
  flowKey: string;
  flowVersion: number;
  currentStep: string;
  draftPayload: Record<string, unknown>;
  completionPercentage: number;
  lastCompletedStep?: string | null;
  skippedSteps: string[];
  skippedStepDetails: Record<string, SkippedStepDetails>;
  isCompleted: boolean;
  status: Exclude<OnboardingSessionStatus, "expired">;
  startedAt?: string;
  updatedAt?: string;
  expiresAt?: string | null;
};

export type OnboardingSessionPatch = {
  stepKey: string;
  values: Record<string, unknown>;
  markComplete?: boolean;
  skipStep?: boolean;
  skipReason?: string | null;
  developmentTrustMode: boolean;
};

export const DEFAULT_SELLER_ONBOARDING_FLOW = {
  flowKey: "seller_onboarding",
  flowVersion: 1,
  firstStep: "account_setup" satisfies SellerOnboardingStepKey,
};

export function createSellerOnboardingSession(input: {
  userId: string;
  role?: MarketplaceRole;
  initialPayload?: Record<string, unknown>;
}): OnboardingSession {
  const payload = input.initialPayload ?? {};
  const progress = getSellerOnboardingProgress(payload);

  return {
    userId: input.userId,
    role: input.role ?? "seller",
    flowKey: DEFAULT_SELLER_ONBOARDING_FLOW.flowKey,
    flowVersion: DEFAULT_SELLER_ONBOARDING_FLOW.flowVersion,
    currentStep: progress.currentStep?.key ?? DEFAULT_SELLER_ONBOARDING_FLOW.firstStep,
    draftPayload: payload,
    completionPercentage: progress.percent,
    lastCompletedStep: null,
    skippedSteps: [],
    skippedStepDetails: {},
    isCompleted: false,
    status: "active",
  };
}

export function applySellerOnboardingPatch(
  session: OnboardingSession,
  patch: OnboardingSessionPatch,
): OnboardingSession {
  const step = SELLER_ONBOARDING_STEPS.find((item) => item.key === patch.stepKey);

  if (!step) {
    return session;
  }

  const nextPayload = {
    ...session.draftPayload,
    ...patch.values,
  };

  const nextSkippedSteps = new Set(session.skippedSteps);
  const nextSkippedStepDetails = {
    ...session.skippedStepDetails,
  };

  if (patch.skipStep && patch.developmentTrustMode && step.skippableInDevelopment) {
    const existing = nextSkippedStepDetails[step.key];
    nextSkippedSteps.add(step.key);
    nextSkippedStepDetails[step.key] = {
      skippedAt: existing?.skippedAt ?? new Date().toISOString(),
      skipReason: patch.skipReason ?? existing?.skipReason ?? null,
      lastNudgedAt: existing?.lastNudgedAt ?? null,
      nudgeCount: existing?.nudgeCount ?? 0,
    };
  }

  const completedSteps = patch.markComplete ? [step.key] : [];
  const progress = getSellerOnboardingProgress(nextPayload, {
    completedSteps: completedSteps as SellerOnboardingStepKey[],
    skippedSteps: Array.from(nextSkippedSteps) as SellerOnboardingStepKey[],
  });

  return {
    ...session,
    currentStep: progress.currentStep?.key ?? step.key,
    draftPayload: nextPayload,
    completionPercentage: progress.percent,
    lastCompletedStep: patch.markComplete ? step.key : session.lastCompletedStep,
    skippedSteps: Array.from(nextSkippedSteps),
    skippedStepDetails: nextSkippedStepDetails,
    isCompleted: progress.percent === 100,
    status: progress.percent === 100 ? "completed" : "active",
  };
}

export function getOnboardingSessionStatus(
  session: Pick<OnboardingSession, "isCompleted" | "expiresAt" | "status">,
): OnboardingSessionStatus {
  if (session.isCompleted) {
    return "completed";
  }

  if (session.status === "abandoned" || session.status === "archived") {
    return session.status;
  }

  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    return "expired";
  }

  return "active";
}

export function recordSkippedStepNudge(input: {
  session: OnboardingSession;
  stepKey: string;
  nudgedAt?: string;
}) {
  const details = input.session.skippedStepDetails[input.stepKey];

  if (!details) {
    return input.session;
  }

  return {
    ...input.session,
    skippedStepDetails: {
      ...input.session.skippedStepDetails,
      [input.stepKey]: {
        ...details,
        lastNudgedAt: input.nudgedAt ?? new Date().toISOString(),
        nudgeCount: details.nudgeCount + 1,
      },
    },
  };
}

export function abandonOnboardingSession(session: OnboardingSession) {
  return {
    ...session,
    status: "abandoned" as const,
    isCompleted: false,
  };
}

export function archiveOnboardingSession(session: OnboardingSession) {
  return {
    ...session,
    status: "archived" as const,
    isCompleted: false,
  };
}

export function toOnboardingSessionUpsert(session: OnboardingSession) {
  return {
    id: session.id,
    user_id: session.userId,
    role: session.role,
    flow_key: session.flowKey,
    flow_version: session.flowVersion,
    status: session.status,
    current_step: session.currentStep,
    draft_payload: session.draftPayload,
    completion_percentage: session.completionPercentage,
    last_completed_step: session.lastCompletedStep ?? null,
    skipped_steps: session.skippedSteps,
    skipped_step_details: session.skippedStepDetails,
    is_completed: session.isCompleted,
    completed_at: session.isCompleted ? new Date().toISOString() : null,
    abandoned_at: session.status === "abandoned" ? new Date().toISOString() : null,
    archived_at: session.status === "archived" ? new Date().toISOString() : null,
    expires_at: session.expiresAt ?? null,
  };
}
