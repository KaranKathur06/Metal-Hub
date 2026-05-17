/**
 * Metal Hub — Admin Listings Moderation Queue API
 *
 * GET /api/admin/listings/pending    → Get listings pending moderation
 *
 * Requires listings.moderate permission + admin 2FA.
 */

import { NextResponse } from 'next/server';
import { protectApiRoute } from '@/lib/auth/protect-route';
import { PERMISSIONS } from '@/lib/constants/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await protectApiRoute(request, {
    permissions: [PERMISSIONS.LISTINGS_MODERATE],
    requireAdmin2FA: true,
  });
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const status = searchParams.get('status') || 'pending';

  const { data, error, count } = await auth.supabase
    .from('listings')
    .select(`
      id, title, slug, description, metal_type, grade,
      price_min, price_max, currency, listing_type,
      moderation_status, is_active, created_at, updated_at,
      listing_media(id, url, alt_text, is_primary),
      companies:company_id(id, name, logo_url, is_verified),
      seller_profiles:seller_profile_id(id, company_name, verification_status,
        profiles:profile_id(full_name, email)
      )
    `, { count: 'exact' })
    .eq('moderation_status', status)
    .order('created_at', { ascending: true }) // Oldest first (FIFO)
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  // Also get counts for each status
  const [pendingCount, flaggedCount, rejectedCount] = await Promise.all([
    auth.supabase.from('listings').select('id', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
    auth.supabase.from('listings').select('id', { count: 'exact', head: true }).eq('moderation_status', 'flagged'),
    auth.supabase.from('listings').select('id', { count: 'exact', head: true }).eq('moderation_status', 'rejected'),
  ]);

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      statusCounts: {
        pending: pendingCount.count || 0,
        flagged: flaggedCount.count || 0,
        rejected: rejectedCount.count || 0,
      },
    },
  });
}
