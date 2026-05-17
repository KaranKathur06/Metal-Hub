/**
 * Metal Hub — Admin User Detail & Role Management API
 *
 * GET  /api/admin/users/[id]          → Get user details (admin)
 * PUT  /api/admin/users/[id]          → Update user profile/role (admin)
 * POST /api/admin/users/[id]/suspend  → Suspend/unsuspend user
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { ROLE_LEVELS } from '@/lib/constants/roles';

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.USERS_READ],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // Get profile
  const { data: profile, error } = await auth.supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 },
    );
  }

  // Get related data in parallel
  const [sellerResult, buyerResult, listingsResult, rfqsResult, settingsResult] = await Promise.all([
    auth.supabase.from('seller_profiles').select('id, company_name, verification_status, certifications, companies:company_id(id, name, is_verified)').eq('profile_id', params.id).maybeSingle(),
    auth.supabase.from('buyer_profiles').select('id, company_id').eq('profile_id', params.id).maybeSingle(),
    auth.supabase.from('listings').select('id', { count: 'exact', head: true }).eq('seller_profile_id', params.id),
    auth.supabase.from('rfqs').select('id', { count: 'exact', head: true }),
    auth.supabase.from('user_settings').select('category, key, value').eq('user_id', params.id),
  ]);

  // Get recent audit logs for this user
  const { data: recentLogs } = await auth.supabase
    .from('admin_audit_logs')
    .select('id, action, resource, details, created_at')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    success: true,
    data: {
      profile,
      sellerProfile: sellerResult.data || null,
      buyerProfile: buyerResult.data || null,
      stats: {
        totalListings: listingsResult.count || 0,
        totalRfqs: rfqsResult.count || 0,
      },
      settings: settingsResult.data || [],
      recentActivity: recentLogs || [],
    },
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.USERS_UPDATE],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  // Get current user
  const { data: current } = await auth.supabase
    .from('profiles')
    .select('id, role, trust_level')
    .eq('id', params.id)
    .maybeSingle();

  if (!current) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
      { status: 404 },
    );
  }

  // Escalation prevention: can't assign role higher than your own
  if (body.role) {
    const myLevel = ROLE_LEVELS[auth.role] || 0;
    const targetLevel = ROLE_LEVELS[body.role] || 0;

    if (targetLevel >= myLevel) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Cannot assign a role equal to or higher than your own' } },
        { status: 403 },
      );
    }
  }

  // Build allowed updates
  const allowedFields = ['full_name', 'phone', 'role', 'trust_level', 'profile_status'];
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  const { data, error: updateError } = await auth.supabase
    .from('profiles')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: updateError.message } },
      { status: 500 },
    );
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'user_updated',
    resource: 'profiles',
    resourceId: params.id,
    details: {
      changes: Object.keys(updates),
      previousRole: current.role,
      newRole: body.role || current.role,
    },
    severity: body.role ? 'warning' : 'info',
    request,
  });

  return NextResponse.json({ success: true, data });
}
