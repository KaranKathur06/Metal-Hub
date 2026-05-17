/**
 * Metal Hub — Admin Banner Reorder API
 * POST /api/admin/banners/reorder → Reorder banners
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export async function POST(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_BANNERS],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: { items: { id: string; order_index: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  if (!body.items || !Array.isArray(body.items)) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'items array is required' } },
      { status: 400 },
    );
  }

  for (const item of body.items) {
    await auth.supabase
      .from('banners')
      .update({ order_index: item.order_index, updated_at: new Date().toISOString() })
      .eq('id', item.id);
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'banners_reordered',
    resource: 'banners',
    details: { count: body.items.length },
    request,
  });

  return NextResponse.json({ success: true, data: { reordered: body.items.length } });
}
