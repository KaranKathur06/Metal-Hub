/**
 * Metal Hub — Product Moderation API Route
 *
 * POST /api/products/[slug]/moderate    → Approve or reject a listing
 *
 * Requires listings.moderate permission.
 */

import { NextResponse } from 'next/server';
import { protectApiRoute, logAdminAction } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

type RouteParams = { params: { slug: string } };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.LISTINGS_MODERATE],
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  let body: { action: 'approve' | 'reject' | 'flag'; notes?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 },
    );
  }

  if (!['approve', 'reject', 'flag'].includes(body.action)) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Action must be approve, reject, or flag' } },
      { status: 400 },
    );
  }

  // Get listing
  const { data: listing } = await auth.supabase
    .from('listings')
    .select('id, title, moderation_status, seller_profile_id')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!listing) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } },
      { status: 404 },
    );
  }

  // Map action to moderation status
  const statusMap: Record<string, string> = {
    approve: 'approved',
    reject: 'rejected',
    flag: 'flagged',
  };

  const newStatus = statusMap[body.action];
  const updates: Record<string, any> = {
    moderation_status: newStatus,
    updated_at: new Date().toISOString(),
  };

  // If approving, ensure listing is active
  if (body.action === 'approve') {
    updates.is_active = true;
  }

  // If rejecting, deactivate
  if (body.action === 'reject') {
    updates.is_active = false;
  }

  const { data, error } = await auth.supabase
    .from('listings')
    .update(updates)
    .eq('id', listing.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Create notification for listing owner
  const { data: sellerProfile } = await auth.supabase
    .from('seller_profiles')
    .select('profile_id')
    .eq('id', listing.seller_profile_id)
    .maybeSingle();

  if (sellerProfile?.profile_id) {
    const messages: Record<string, string> = {
      approve: `Your listing "${listing.title}" has been approved and is now live.`,
      reject: `Your listing "${listing.title}" has been rejected. ${body.notes ? `Reason: ${body.notes}` : 'Please review and resubmit.'}`,
      flag: `Your listing "${listing.title}" has been flagged for review. ${body.notes || ''}`,
    };

    await auth.supabase.from('notifications').insert({
      user_id: sellerProfile.profile_id,
      type: 'listing_moderation',
      title: `Listing ${body.action === 'approve' ? 'Approved' : body.action === 'reject' ? 'Rejected' : 'Flagged'}`,
      message: messages[body.action],
      data: { listing_id: listing.id, action: body.action, slug: params.slug },
      is_read: false,
    });
  }

  // Audit log
  await logAdminAction(auth.supabase, {
    userId: auth.user.id,
    action: `listing_${body.action}d`,
    resource: 'listings',
    resourceId: listing.id,
    details: {
      title: listing.title,
      previousStatus: listing.moderation_status,
      newStatus,
      notes: body.notes,
    },
    severity: body.action === 'reject' ? 'warning' : 'info',
    request,
  });

  return NextResponse.json({
    success: true,
    data: {
      ...data,
      moderationAction: body.action,
    },
  });
}
