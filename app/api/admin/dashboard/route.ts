/**
 * Metal Hub — Admin Dashboard Metrics API Route
 *
 * GET /api/admin/dashboard    → Get KPI metrics for admin dashboard
 *
 * Requires admin role + 2FA verification.
 * Replaces the old NestJS backend proxy.
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
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Fetch all metrics in parallel ──
  const [
    totalUsersResult,
    newUsersResult,
    totalListingsResult,
    activeListingsResult,
    pendingModerationResult,
    totalRfqsResult,
    monthRfqsResult,
    pendingSellersResult,
    totalCompaniesResult,
    recentAuditLogsResult,
    leadsPipelineResult,
  ] = await Promise.all([
    // Total users
    auth.supabase.from('profiles').select('id', { count: 'exact', head: true }),

    // New users (7 days)
    auth.supabase.from('profiles').select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString()),

    // Total listings
    auth.supabase.from('listings').select('id', { count: 'exact', head: true }),

    // Active approved listings
    auth.supabase.from('listings').select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('moderation_status', 'approved'),

    // Pending moderation
    auth.supabase.from('listings').select('id', { count: 'exact', head: true })
      .eq('moderation_status', 'pending'),

    // Total RFQs
    auth.supabase.from('rfqs').select('id', { count: 'exact', head: true }),

    // RFQs this month
    auth.supabase.from('rfqs').select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString()),

    // Pending seller verifications
    auth.supabase.from('seller_profiles').select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),

    // Total companies
    auth.supabase.from('companies').select('id', { count: 'exact', head: true }),

    // Recent audit logs (last 20)
    auth.supabase.from('admin_audit_logs').select('id, user_id, action, resource, severity, created_at')
      .order('created_at', { ascending: false })
      .limit(20),

    // CRM leads by stage
    auth.supabase.from('leads').select('stage')
      .is('deleted_at', null),
  ]);

  // ── Process lead pipeline counts ──
  const leadsByStage: Record<string, number> = {};
  if (leadsPipelineResult.data) {
    for (const lead of leadsPipelineResult.data) {
      leadsByStage[lead.stage] = (leadsByStage[lead.stage] || 0) + 1;
    }
  }

  // ── Build response ──
  const metrics = {
    users: {
      total: totalUsersResult.count || 0,
      newThisWeek: newUsersResult.count || 0,
    },
    listings: {
      total: totalListingsResult.count || 0,
      active: activeListingsResult.count || 0,
      pendingModeration: pendingModerationResult.count || 0,
    },
    rfqs: {
      total: totalRfqsResult.count || 0,
      thisMonth: monthRfqsResult.count || 0,
    },
    sellers: {
      pendingVerification: pendingSellersResult.count || 0,
    },
    companies: {
      total: totalCompaniesResult.count || 0,
    },
    crm: {
      leadsByStage,
      totalLeads: leadsPipelineResult.data?.length || 0,
    },
    recentActivity: recentAuditLogsResult.data || [],
  };

  return NextResponse.json({ success: true, data: metrics });
}
