/**
 * Metal Hub — Server-Side Permission Checking
 *
 * Queries the database `role_permissions` table for authoritative
 * permission enforcement. This is the REAL check — client-side
 * permission matrix is just for UI rendering speed.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { isSuperAdminRole, normalizeStoredRole } from '@/lib/auth/rbac';

/**
 * Check if a user has a specific permission via their role.
 *
 * Flow:
 *   1. Get user's role from profiles table
 *   2. Query role_permissions for that role + permission code
 *   3. Return boolean
 *
 * This queries the DB on every call. For high-frequency checks,
 * consider caching the user's permissions for the request duration.
 */
export async function hasPermission(
  supabase: SupabaseClient,
  userId: string,
  permissionCode: string,
): Promise<boolean> {
  // 1. Get user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.role) return false;

  // Super admin has all permissions (includes legacy superadmin alias)
  if (isSuperAdminRole(profile.role)) return true;

  // 2. Check role_permissions join
  const { data } = await supabase
    .from('role_permissions')
    .select('permission_id, permissions!inner(code)')
    .eq('role', normalizeStoredRole(profile.role))
    .eq('permissions.code', permissionCode)
    .maybeSingle();

  return !!data;
}

/**
 * Check multiple permissions at once (batch).
 * Returns a map of permission code → boolean.
 */
export async function hasPermissions(
  supabase: SupabaseClient,
  userId: string,
  permissionCodes: string[],
): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  for (const code of permissionCodes) {
    result[code] = false;
  }

  // 1. Get user's role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.role) return result;

  // Super admin has all permissions
  if (isSuperAdminRole(profile.role)) {
    for (const code of permissionCodes) {
      result[code] = true;
    }
    return result;
  }

  // 2. Batch query
  const { data: grants } = await supabase
    .from('role_permissions')
    .select('permissions!inner(code)')
    .eq('role', normalizeStoredRole(profile.role))
    .in('permissions.code', permissionCodes);

  if (grants) {
    for (const grant of grants) {
      const code = (grant as any).permissions?.code;
      if (code && code in result) {
        result[code] = true;
      }
    }
  }

  return result;
}

/**
 * Require a permission — throws if not granted.
 * Use in API routes for clean guard patterns.
 */
export async function requirePermission(
  supabase: SupabaseClient,
  userId: string,
  permissionCode: string,
): Promise<void> {
  const granted = await hasPermission(supabase, userId, permissionCode);
  if (!granted) {
    throw new PermissionDeniedError(permissionCode);
  }
}

/**
 * Get all permission codes for a user's role.
 * Useful for sending to the client on login.
 */
export async function getUserPermissions(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.role) return [];

  // Super admin: return all
  if (isSuperAdminRole(profile.role)) {
    const { data: allPerms } = await supabase
      .from('permissions')
      .select('code');
    return (allPerms || []).map((p: any) => p.code);
  }

  const { data: grants } = await supabase
    .from('role_permissions')
    .select('permissions!inner(code)')
    .eq('role', normalizeStoredRole(profile.role));

  return (grants || []).map((g: any) => g.permissions?.code).filter(Boolean);
}

/**
 * Custom error class for permission denials.
 */
export class PermissionDeniedError extends Error {
  public readonly permissionCode: string;

  constructor(permissionCode: string) {
    super(`Permission denied: ${permissionCode}`);
    this.name = 'PermissionDeniedError';
    this.permissionCode = permissionCode;
  }
}
