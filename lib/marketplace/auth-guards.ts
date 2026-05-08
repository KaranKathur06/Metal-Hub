import { getDashboardHref, getOnboardingHref, type MarketplaceRole } from "./auth-navigation";

export type AuthGuardInput = {
  isAuthenticated: boolean;
  role?: MarketplaceRole | null;
  profileStatus?: "incomplete" | "in_progress" | "complete" | null;
  onboardingStep?: number | null;
  developmentTrustMode?: boolean;
};

export type AuthGuardResult = {
  allowed: boolean;
  redirectTo?: string;
  reason?: "unauthenticated" | "wrong_role" | "onboarding_incomplete";
};

export function requireAuth(input: AuthGuardInput, redirectTo = "/login"): AuthGuardResult {
  if (!input.isAuthenticated) {
    return {
      allowed: false,
      redirectTo,
      reason: "unauthenticated",
    };
  }

  return {
    allowed: true,
  };
}

export function requireRole(
  input: AuthGuardInput,
  allowedRoles: MarketplaceRole[],
): AuthGuardResult {
  const authResult = requireAuth(input);

  if (!authResult.allowed) {
    return authResult;
  }

  const currentRole = input.role ?? "buyer";

  if (currentRole === "admin" || allowedRoles.includes(currentRole)) {
    return {
      allowed: true,
    };
  }

  return {
    allowed: false,
    redirectTo: getDashboardHref(currentRole),
    reason: "wrong_role",
  };
}

export function requireCompletedOnboarding(input: AuthGuardInput): AuthGuardResult {
  const authResult = requireAuth(input);

  if (!authResult.allowed) {
    return authResult;
  }

  if (input.developmentTrustMode) {
    return {
      allowed: true,
    };
  }

  const onboardingIncomplete =
    input.profileStatus !== "complete" || Boolean(input.onboardingStep && input.onboardingStep > 1);

  if (!onboardingIncomplete) {
    return {
      allowed: true,
    };
  }

  return {
    allowed: false,
    redirectTo: getOnboardingHref(input.role),
    reason: "onboarding_incomplete",
  };
}

