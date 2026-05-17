/**
 * Metal Hub — Client-Side Permission Hook
 *
 * Uses the static CLIENT_PERMISSION_MATRIX for instant UI gating.
 * Server-side enforcement via protectApiRoute remains authoritative.
 */

'use client';

import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasClientPermission, type PermissionCode } from '@/lib/constants/permissions';

/**
 * Check if the current user has a specific permission.
 * Uses the client-side static matrix — no API call.
 *
 * @example
 * ```tsx
 * function ModerateButton() {
 *   const canModerate = usePermission('listings.moderate');
 *   if (!canModerate) return null;
 *   return <Button>Approve</Button>;
 * }
 * ```
 */
export function usePermission(permissionCode: PermissionCode | string): boolean {
  const { role } = useAuth();
  return useMemo(() => hasClientPermission(role, permissionCode), [role, permissionCode]);
}

/**
 * Check multiple permissions at once.
 * Returns an object mapping each code → boolean.
 *
 * @example
 * ```tsx
 * const { 'listings.moderate': canModerate, 'listings.feature': canFeature } = usePermissions([
 *   'listings.moderate',
 *   'listings.feature',
 * ]);
 * ```
 */
export function usePermissions(permissionCodes: (PermissionCode | string)[]): Record<string, boolean> {
  const { role } = useAuth();
  return useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const code of permissionCodes) {
      result[code] = hasClientPermission(role, code);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, permissionCodes.join(',')]);
}

/**
 * Check if the current user has ANY of the given permissions.
 */
export function useAnyPermission(permissionCodes: (PermissionCode | string)[]): boolean {
  const { role } = useAuth();
  return useMemo(() => {
    return permissionCodes.some((code) => hasClientPermission(role, code));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, permissionCodes.join(',')]);
}

/**
 * Check if the current user has ALL of the given permissions.
 */
export function useAllPermissions(permissionCodes: (PermissionCode | string)[]): boolean {
  const { role } = useAuth();
  return useMemo(() => {
    return permissionCodes.every((code) => hasClientPermission(role, code));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, permissionCodes.join(',')]);
}
