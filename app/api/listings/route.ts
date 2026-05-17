/**
 * Metal Hub — Public Listings API
 * GET /api/listings → Get active approved listings (redirects to /api/products)
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));

  const { data, error, count } = await supabase
    .from('listings')
    .select(`
      id, title, slug, description, metal_type, grade,
      price_min, price_max, currency, moq, lead_time,
      is_active, moderation_status, created_at,
      listing_media(id, url, alt_text, is_primary),
      companies:company_id(id, name, logo_url, city, state)
    `, { count: 'exact' })
    .eq('is_active', true)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    meta: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
  });
}
