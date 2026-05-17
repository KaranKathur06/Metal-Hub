/**
 * Metal Hub — Admin Capabilities Reorder API
 * POST /api/admin/capabilities/reorder → Reorder taxonomy items
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export async function POST(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.ADMIN_CAPABILITIES],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: { items: { id: string; sort_order: number }[] };
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

  // Update sort_order for each item
  for (const item of body.items) {
    await auth.supabase
      .from('taxonomy')
      .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
      .eq('id', item.id);
  }

  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: 'taxonomy_reordered',
    resource: 'taxonomy',
    details: { count: body.items.length },
    request,
  });

  return NextResponse.json({ success: true, data: { reordered: body.items.length } });
}
