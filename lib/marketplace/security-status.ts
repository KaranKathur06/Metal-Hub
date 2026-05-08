export type AccountSession = {
  id: string;
  deviceLabel: string;
  ipAddress?: string | null;
  locationLabel?: string | null;
  lastActiveAt: string;
  current?: boolean;
};

export type SecurityStatusInput = {
  emailVerified: boolean;
  phoneVerified?: boolean;
  mfaEnabled?: boolean;
  activeSessionCount?: number;
  lastPasswordChangedAt?: string | null;
};

export function getSecurityStrength(input: SecurityStatusInput) {
  let score = 0;

  if (input.emailVerified) {
    score += 35;
  }

  if (input.phoneVerified) {
    score += 15;
  }

  if (input.mfaEnabled) {
    score += 30;
  }

  if ((input.activeSessionCount ?? 0) <= 3) {
    score += 10;
  }

  if (input.lastPasswordChangedAt) {
    score += 10;
  }

  if (score >= 80) {
    return {
      score,
      label: "Strong",
    };
  }

  if (score >= 55) {
    return {
      score,
      label: "Moderate",
    };
  }

  return {
    score,
    label: "Needs attention",
  };
}

export function getSessionRecencyLabel(lastActiveAt: string) {
  const ageHours = (Date.now() - new Date(lastActiveAt).getTime()) / 36e5;

  if (ageHours < 1) {
    return "Active now";
  }

  if (ageHours < 24) {
    return `${Math.round(ageHours)}h ago`;
  }

  return `${Math.round(ageHours / 24)}d ago`;
}

