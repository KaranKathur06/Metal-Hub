/**
 * Metal Hub — Role Definitions & Hierarchy
 *
 * Canonical source of truth for all marketplace roles.
 * Used by both client-side UI gating and referenced in API protection.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPPORT_AGENT: 'support_agent',
  SUPPLIER_SUCCESS: 'supplier_success',
  FINANCE: 'finance',
  MARKETING: 'marketing',
  SELLER: 'seller',
  MANUFACTURER: 'manufacturer',
  BUYER: 'buyer',
  DISTRIBUTOR: 'distributor',
  LOGISTICS: 'logistics',
  BOTH: 'both',
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role hierarchy levels — lower number = higher privilege.
 * Used for escalation prevention: a user cannot assign a role
 * with a level ≤ their own.
 */
export const ROLE_LEVELS: Record<string, number> = {
  [ROLES.SUPER_ADMIN]: 0,
  [ROLES.ADMIN]: 1,
  [ROLES.MODERATOR]: 2,
  [ROLES.SUPPORT_AGENT]: 3,
  [ROLES.SUPPLIER_SUCCESS]: 3,
  [ROLES.FINANCE]: 3,
  [ROLES.MARKETING]: 3,
  [ROLES.SELLER]: 5,
  [ROLES.MANUFACTURER]: 5,
  [ROLES.BUYER]: 5,
  [ROLES.BOTH]: 5,
  [ROLES.DISTRIBUTOR]: 5,
  [ROLES.LOGISTICS]: 5,
};

/** Roles that can access admin/ops panels */
export const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MODERATOR,
  ROLES.SUPPORT_AGENT,
  ROLES.SUPPLIER_SUCCESS,
  ROLES.FINANCE,
  ROLES.MARKETING,
] as const;

/** Roles that can access the ops dashboard */
export const OPS_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MODERATOR,
  ROLES.SUPPORT_AGENT,
  ROLES.SUPPLIER_SUCCESS,
] as const;

/** Roles that can list/sell products */
export const SELLER_ROLES = [
  ROLES.SELLER,
  ROLES.MANUFACTURER,
  ROLES.BOTH,
  ROLES.DISTRIBUTOR,
] as const;

/** Roles that require admin 2FA step-up */
export const REQUIRES_2FA = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
] as const;

/**
 * Check if a role is at admin level (can access admin panel).
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role is at seller level (can create listings).
 */
export function isSellerRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return (SELLER_ROLES as readonly string[]).includes(role);
}

/**
 * Check if a role requires 2FA for elevated access.
 */
export function requires2FA(role: string | null | undefined): boolean {
  if (!role) return false;
  return (REQUIRES_2FA as readonly string[]).includes(role);
}

/**
 * Check if `actorRole` can assign `targetRole`.
 * A role can only assign roles with a strictly higher level number.
 */
export function canAssignRole(actorRole: string, targetRole: string): boolean {
  const actorLevel = ROLE_LEVELS[actorRole];
  const targetLevel = ROLE_LEVELS[targetRole];
  if (actorLevel === undefined || targetLevel === undefined) return false;
  return actorLevel < targetLevel;
}

/**
 * Get the default dashboard route for a role.
 */
export function getDashboardRoute(role: string | null | undefined): string {
  switch (role) {
    case ROLES.SUPER_ADMIN:
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.MODERATOR:
    case ROLES.SUPPORT_AGENT:
    case ROLES.SUPPLIER_SUCCESS:
      return '/ops';
    case ROLES.SELLER:
    case ROLES.MANUFACTURER:
    case ROLES.DISTRIBUTOR:
      return '/seller/dashboard';
    case ROLES.BUYER:
      return '/buyer/dashboard';
    case ROLES.FINANCE:
      return '/admin';
    case ROLES.MARKETING:
      return '/admin';
    case ROLES.BOTH:
      return '/dashboard';
    default:
      return '/dashboard';
  }
}
