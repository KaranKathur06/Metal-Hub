export type PlatformSettingValue = boolean | number | string | Record<string, unknown> | unknown[] | null;

export type PlatformSettingRecord = {
  key: string;
  value: PlatformSettingValue;
  updatedAt?: string | null;
};

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);

export function parseBooleanOverride(value: string | boolean | undefined | null) {
  if (typeof value === "boolean") {
    return value;
  }

  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return undefined;
}

export function resolveDevelopmentTrustMode(input?: {
  envOverride?: string | boolean | null;
  databaseValue?: PlatformSettingValue;
  defaultValue?: boolean;
}) {
  const envValue = parseBooleanOverride(input?.envOverride);

  if (typeof envValue === "boolean") {
    return envValue;
  }

  if (typeof input?.databaseValue === "boolean") {
    return input.databaseValue;
  }

  if (typeof input?.databaseValue === "string") {
    const databaseValue = parseBooleanOverride(input.databaseValue);

    if (typeof databaseValue === "boolean") {
      return databaseValue;
    }
  }

  return input?.defaultValue ?? true;
}

export function getPublicDevelopmentTrustMode(databaseValue?: PlatformSettingValue) {
  return resolveDevelopmentTrustMode({
    envOverride: process.env.NEXT_PUBLIC_DEVELOPMENT_TRUST_MODE,
    databaseValue,
    defaultValue: true,
  });
}

