/**
 * Metal Hub — Supplier Detail API
 * GET /api/suppliers/[id] → Get supplier profile with listings
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } }, { status: 503 });
  }

  const { data: seller, error } = await supabase
    .from('seller_profiles')
    .select(`
      id, company_name, verification_status, certifications, created_at,
      profiles:profile_id(id, full_name, avatar_url),
      companies:company_id(id, name, logo_url, website, description, city, state, country, industry_type, is_verified, employee_count)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error || !seller) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } },
      { status: 404 },
    );
  }

  // Get supplier's active listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, slug, metal_type, grade, price_min, price_max, currency, listing_media(url, is_primary)')
    .eq('seller_profile_id', params.id)
    .eq('is_active', true)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    success: true,
    data: { ...seller, listings: listings || [] },
  });
}
