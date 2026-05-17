/**
 * Metal Hub — Platform Health & Stats API
 *
 * GET /api/admin/health → System health check + key metrics
 *
 * Provides real-time platform diagnostics for the admin dashboard.
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_DASHBOARD],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalUsers,
    newUsersToday,
    newUsers7d,
    activeListings,
    pendingListings,
    totalRfqs,
    openRfqs,
    verifiedCompanies,
    pendingSellers,
    recentAuditLogs,
    rateLimitHits,
  ] = await Promise.all([
    auth.supabase.from('profiles').select('id', { count: 'exact', head: true }),
    auth.supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today),
    auth.supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', last7d),
    auth.supabase.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true).eq('moderation_status', 'approved'),
    auth.supabase.from('listings').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    auth.supabase.from('rfqs').select('id', { count: 'exact', head: true }),
    auth.supabase.from('rfqs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    auth.supabase.from('companies').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    auth.supabase.from('seller_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    auth.supabase.from('admin_audit_logs').select('id, action, created_at').order('created_at', { ascending: false }).limit(5),
    auth.supabase.from('rate_limits').select('id', { count: 'exact', head: true }).gte('window_end', now.toISOString()),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      timestamp: now.toISOString(),
      status: 'healthy',
      metrics: {
        users: {
          total: totalUsers.count || 0,
          newToday: newUsersToday.count || 0,
          new7d: newUsers7d.count || 0,
        },
        listings: {
          active: activeListings.count || 0,
          pending: pendingListings.count || 0,
        },
        rfqs: {
          total: totalRfqs.count || 0,
          open: openRfqs.count || 0,
        },
        suppliers: {
          verified: verifiedCompanies.count || 0,
          pending: pendingSellers.count || 0,
        },
        security: {
          activeRateLimits: rateLimitHits.count || 0,
        },
      },
      recentActivity: recentAuditLogs.data || [],
    },
  });
}
