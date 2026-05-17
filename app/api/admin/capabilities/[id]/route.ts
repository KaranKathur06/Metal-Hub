/**
 * Metal Hub — Admin Capability Detail API
 * PUT    /api/admin/capabilities/[id] → Update taxonomy item
 * DELETE /api/admin/capabilities/[id] → Delete taxonomy item
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

type RouteParams = { params: { id: string } };

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_CAPABILITIES],
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

  const allowedFields = ['name', 'slug', 'type', 'description', 'icon', 'parent_id', 'sort_order', 'is_active'];
  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  const { data, error } = await auth.supabase
    .from('taxonomy')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'taxonomy_updated',
    resource: 'taxonomy',
    resourceId: params.id,
    details: { changes: Object.keys(updates) },
    request,
  });

  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_CAPABILITIES],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  // Soft delete: deactivate
  const { error } = await auth.supabase
    .from('taxonomy')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'taxonomy_deleted',
    resource: 'taxonomy',
    resourceId: params.id,
    severity: 'warning',
    request,
  });

  return NextResponse.json({ success: true, data: { deleted: true } });
}
