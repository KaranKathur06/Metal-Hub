/**
 * Metal Hub — Admin Audit Logs API Route
 *
 * GET /api/admin/logs    → Get audit logs (filtered, paginated)
 *
 * Requires admin.audit permission + 2FA.
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_AUDIT],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const userId = searchParams.get('user_id');
  const action = searchParams.get('action');
  const severity = searchParams.get('severity');
  const resource = searchParams.get('resource');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  let query = auth.supabase
    .from('admin_audit_logs')
    .select('*, profiles:user_id(full_name, email, avatar_url)', { count: 'exact' });

  if (userId) query = query.eq('user_id', userId);
  if (action) query = query.eq('action', action);
  if (severity) query = query.eq('severity', severity);
  if (resource) query = query.eq('resource', resource);
  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  query = query
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
