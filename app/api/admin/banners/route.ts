/**
 * Metal Hub — Banners Management API Route
 *
 * GET  /api/admin/banners    → List all banners
 * POST /api/admin/banners    → Create a new banner
 *
 * Replaces old NestJS backend proxy.
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, { allowPublic: true });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') !== 'false';
  const isAdmin = auth.role && ['admin', 'super_admin', 'marketing'].includes(auth.role);

  let query = auth.supabase
    .from('banners')
    .select('*')
    .order('order_index', { ascending: true });

  if (!isAdmin || activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_BANNERS],
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

  if (!body.title || !body.image_url) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'title and image_url are required' } },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from('banners')
    .insert({
      title: body.title,
      subtitle: body.subtitle || null,
      image_url: body.image_url,
      cta_text: body.cta_text || 'Explore',
      cta_link: body.cta_link || '/marketplace',
      is_active: body.is_active !== false,
      order_index: body.order_index || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'banner_created',
    resource: 'banners',
    resourceId: data.id,
    details: { title: body.title },
    request,
  });

  return NextResponse.json({ success: true, data }, { status: 201 });
}
