/**
 * Canonical RBAC normalization for MetalHub.
 * Single source of truth for role aliases across middleware, API, and client.
 */

/** Maps legacy / enum variants → canonical stored role string */
export const ROLE_ALIASES: Record<string, string> = {
  superadmin: "super_admin",
  super_admin: "super_admin",
  manufacturer: "seller",
  distributor: "seller",
  both: "seller",
};

export const ADMIN_ROLES = new Set([
  "super_admin",
  "admin",
  "moderator",
  "support_agent",
  "supplier_success",
  "finance",
  "marketing",
]);

export const OPS_ROLES = new Set([
  "super_admin",
  "admin",
  "moderator",
  "support_agent",
  "supplier_success",
]);

export const ADMIN_OTP_ROLES = new Set(["super_admin", "admin"]);

export function normalizeStoredRole(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "buyer";
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  return ROLE_ALIASES[lower] ?? ROLE_ALIASES[trimmed] ?? trimmed;
}

export function isSuperAdminRole(role: unknown): boolean {
  return normalizeStoredRole(role) === "super_admin";
}

export function isAdminRole(role: unknown): boolean {
  return ADMIN_ROLES.has(normalizeStoredRole(role));
}

export function isOpsRole(role: unknown): boolean {
  return OPS_ROLES.has(normalizeStoredRole(role));
}

export function canRequestAdminOtp(role: unknown): boolean {
  return ADMIN_OTP_ROLES.has(normalizeStoredRole(role));
}

/**
 * Check stored role against allowed list, expanding aliases (e.g. superadmin ↔ super_admin).
 */
export function roleMatchesAllowed(storedRole: unknown, allowedRoles: string[]): boolean {
  if (!allowedRoles.length) return true;

  const normalized = normalizeStoredRole(storedRole);
  const allowed = new Set<string>();

  for (const entry of allowedRoles) {
    const canonical = normalizeStoredRole(entry);
    allowed.add(canonical);
    allowed.add(entry);
    if (canonical === "super_admin") {
      allowed.add("superadmin");
    }
  }

  if (allowed.has(normalized)) return true;

  // Legacy DB value superadmin without normalization in allowed list only
  if (typeof storedRole === "string" && storedRole === "superadmin" && allowed.has("super_admin")) {
    return true;
  }

  return false;
}

export function resolveEffectiveRole(params: {
  profileRole?: unknown;
  appMetadataRole?: unknown;
  userMetadataRole?: unknown;
}): string {
  return (
    (typeof params.profileRole === "string" && params.profileRole
      ? normalizeStoredRole(params.profileRole)
      : null) ??
    (typeof params.appMetadataRole === "string"
      ? normalizeStoredRole(params.appMetadataRole)
      : null) ??
    (typeof params.userMetadataRole === "string"
      ? normalizeStoredRole(params.userMetadataRole)
      : null) ??
    "buyer"
  );
}
