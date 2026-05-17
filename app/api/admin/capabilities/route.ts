/**
 * Metal Hub — Admin Capabilities CRUD API
 * GET  /api/admin/capabilities    → List taxonomy items (admin)
 * POST /api/admin/capabilities    → Create taxonomy item
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_CAPABILITIES],
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let query = auth.supabase
    .from('taxonomy')
    .select('*')
    .order('sort_order', { ascending: true });

  if (type) query = query.eq('type', type);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: Request) {
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

  if (!body.name || !body.type) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'name and type are required' } },
      { status: 400 },
    );
  }

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');

  const { data, error } = await auth.supabase
    .from('taxonomy')
    .insert({
      name: body.name,
      slug,
      type: body.type,
      description: body.description || null,
      icon: body.icon || null,
      parent_id: body.parent_id || null,
      sort_order: body.sort_order || 0,
      is_active: body.is_active !== false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'taxonomy_created',
    resource: 'taxonomy',
    resourceId: data.id,
    details: { name: body.name, type: body.type },
    request,
  });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
