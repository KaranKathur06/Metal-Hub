/**
 * Metal Hub — ProtectedRoute Component
 *
 * Client-side route guard for permission-based UI rendering.
 * Wraps content that should only be visible to users with specific
 * roles or permissions.
 *
 * NOTE: This is for UI gating only — server-side API routes
 * enforce permissions authoritatively via protectApiRoute.
 */

'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { hasClientPermission } from '@/lib/constants/permissions';
import { isAdminRole, isSellerRole } from '@/lib/constants/roles';

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** Required roles. If provided, user must have one of these roles. */
  requiredRoles?: string[];
  /** Required permission code. User must have this permission. */
  requiredPermission?: string;
  /** Component to render if access denied. Defaults to null (hide). */
  fallback?: React.ReactNode;
  /** If true, show a loading state while checking auth. */
  showLoading?: boolean;
};

/**
 * Wrap content that requires specific roles or permissions.
 *
 * @example
 * ```tsx
 * <ProtectedRoute requiredPermission="listings.moderate">
 *   <Button>Approve Listing</Button>
 * </ProtectedRoute>
 *
 * <ProtectedRoute requiredRoles={['admin', 'super_admin']} fallback={<AccessDenied />}>
 *   <AdminSettings />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  requiredPermission,
  fallback = null,
  showLoading = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, role } = useAuth();

  // Loading state
  if (loading) {
    if (showLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }
    return null;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Role check
  if (requiredRoles && requiredRoles.length > 0) {
    if (!role || !requiredRoles.includes(role)) {
      return <>{fallback}</>;
    }
  }

  // Permission check
  if (requiredPermission) {
    if (!hasClientPermission(role, requiredPermission)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Convenience: Only render for admin-level users.
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { role } = useAuth();
  if (!isAdminRole(role)) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Convenience: Only render for seller-level users.
 */
export function SellerOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { role } = useAuth();
  if (!isSellerRole(role)) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Convenience: Render different content based on role.
 */
export function RoleSwitch({
  admin,
  seller,
  buyer,
  defaultContent,
}: {
  admin?: React.ReactNode;
  seller?: React.ReactNode;
  buyer?: React.ReactNode;
  defaultContent?: React.ReactNode;
}) {
  const { role } = useAuth();

  if (isAdminRole(role) && admin) return <>{admin}</>;
  if (isSellerRole(role) && seller) return <>{seller}</>;
  if (role === 'buyer' && buyer) return <>{buyer}</>;
  return <>{defaultContent || null}</>;
}
