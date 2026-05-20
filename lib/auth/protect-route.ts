/**
 * Metal Hub — API Route Protection Utility
 *
 * Single function to protect any API route with:
 *   1. Authentication (Supabase session)
 *   2. Role-based access control (profiles table)
 *   3. Permission-based access control (role_permissions table)
 *   4. Admin 2FA verification (admin_sessions table)
 *   5. Rate limiting (rate_limits table)
 *   6. Audit logging
 *
 * Usage:
 *   const auth = await protectApiRoute(request, {
 *     requiredRoles: ['admin', 'super_admin'],
 *     permissions: ['listings.moderate'],
 *     requireAdmin2FA: true,
 *     rateLimit: RATE_LIMITS.API_GENERAL,
 *   });
 *   if (auth.error) {
 *     return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
 *   }
 *   // auth.user, auth.supabase, auth.role are available
 */

import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { hasPermission } from '@/lib/auth/permissions';
import { checkRateLimit, type RateLimitResult } from '@/lib/auth/rate-limiter';
import {
  isSuperAdminRole,
  normalizeStoredRole,
  resolveEffectiveRole,
  roleMatchesAllowed,
} from '@/lib/auth/rbac';
import { authLog, authWarn } from '@/lib/auth/auth-logger';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export type ProtectOptions = {
  /** Roles allowed to access this route. If empty/undefined, any authenticated user is allowed. */
  requiredRoles?: string[];
  /** Permission codes required. ALL must be granted. */
  permissions?: string[];
  /** Whether admin 2FA session is required. */
  requireAdmin2FA?: boolean;
  /** Rate limit configuration. */
  rateLimit?: {
    action: string;
    maxAttempts: number;
    windowMinutes: number;
  };
  /** If true, do not enforce auth — allow public access but still parse user if present. */
  allowPublic?: boolean;
};

export type ProtectSuccess = {
  user: User;
  supabase: SupabaseClient;
  role: string;
  error?: undefined;
  status?: undefined;
};

export type ProtectError = {
  error: { code: string; message: string; details?: any };
  status: number;
  user?: undefined;
  supabase?: undefined;
  role?: undefined;
};

export type ProtectResult = ProtectSuccess | ProtectError;

/**
 * Protect an API route with authentication, RBAC, permissions, 2FA, and rate limiting.
 */
export async function protectApiRoute(
  request: Request,
  options: ProtectOptions = {},
): Promise<ProtectResult> {
  // ── 1. Create Supabase server client ──
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      error: { code: 'SERVICE_UNAVAILABLE', message: 'Database connection unavailable' },
      status: 503,
    };
  }

  // ── 2. Authenticate ──
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (options.allowPublic) {
      // Public access allowed — return a minimal context
      return {
        user: null as any,
        supabase,
        role: 'anonymous',
      };
    }
    return {
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      status: 401,
    };
  }

  // ── 3. Get user role from profiles table (authoritative) ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const rawRole = profile?.role ?? 'buyer';
  const role = resolveEffectiveRole({
    profileRole: rawRole,
    appMetadataRole: user.app_metadata?.role,
    userMetadataRole: user.user_metadata?.role,
  });

  authLog('protectApiRoute', 'role resolved', {
    userId: user.id,
    rawRole,
    role,
    path: new URL(request.url).pathname,
  });

  // ── 4. Role check (super_admin bypasses role lists) ──
  if (options.requiredRoles && options.requiredRoles.length > 0) {
    if (!isSuperAdminRole(role) && !roleMatchesAllowed(role, options.requiredRoles)) {
      authWarn('protectApiRoute', 'role denied', {
        userId: user.id,
        role,
        required: options.requiredRoles,
      });
      return {
        error: {
          code: 'FORBIDDEN',
          message: `Role '${normalizeStoredRole(rawRole)}' is not authorized for this action`,
        },
        status: 403,
      };
    }
  }

  // ── 5. Permission check (super_admin bypasses permission matrix) ──
  if (options.permissions && options.permissions.length > 0 && !isSuperAdminRole(role)) {
    for (const permCode of options.permissions) {
      const granted = await hasPermission(supabase, user.id, permCode);
      if (!granted) {
        authWarn('protectApiRoute', 'permission denied', { userId: user.id, role, permCode });
        return {
          error: {
            code: 'FORBIDDEN',
            message: `Missing required permission: ${permCode}`,
          },
          status: 403,
        };
      }
    }
  }

  // ── 6. Admin 2FA verification check ──
  if (options.requireAdmin2FA) {
    const { data: adminSession } = await supabase
      .from('admin_sessions')
      .select('id, expires_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('verified_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!adminSession) {
      return {
        error: {
          code: 'ADMIN_2FA_REQUIRED',
          message: 'Admin 2FA verification required',
        },
        status: 403,
      };
    }
  }

  // ── 7. Rate limiting ──
  if (options.rateLimit) {
    const ip = getClientIP(request);
    const rateLimitResult: RateLimitResult = await checkRateLimit(
      supabase,
      ip,
      options.rateLimit.action,
      options.rateLimit.maxAttempts,
      options.rateLimit.windowMinutes,
    );

    if (!rateLimitResult.allowed) {
      return {
        error: {
          code: 'RATE_LIMITED',
          message: `Too many requests. Try again in ${rateLimitResult.retryAfterSeconds} seconds.`,
          details: { retryAfterSeconds: rateLimitResult.retryAfterSeconds },
        },
        status: 429,
      };
    }
  }

  // ── All checks passed ──
  return { user, supabase, role };
}

/**
 * Extract client IP from request headers.
 */
function getClientIP(request: Request): string {
  // Vercel/Cloudflare set these headers
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

/**
 * Log an admin action to the audit trail.
 * Call this after any mutation in admin routes.
 */
export async function logAdminAction(
  supabase: SupabaseClient,
  params: {
    userId: string;
    action: string;
    resource?: string;
    resourceId?: string;
    details?: Record<string, any>;
    severity?: 'info' | 'warning' | 'critical';
    request?: Request;
  },
): Promise<void> {
  const ip = params.request ? getClientIP(params.request) : null;
  const userAgent = params.request?.headers.get('user-agent') || null;

  await supabase.from('admin_audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    resource: params.resource || null,
    resource_id: params.resourceId || null,
    details: params.details || null,
    severity: params.severity || 'info',
    ip_address: ip,
    user_agent: userAgent,
  });
}
