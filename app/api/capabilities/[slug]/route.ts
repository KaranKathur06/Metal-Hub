/**
 * Metal Hub — Public Capability Detail API
 * GET /api/capabilities/[slug] → Get taxonomy item by slug with related listings
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

type RouteParams = { params: { slug: string } };

export async function GET(request: Request, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable' } }, { status: 503 });
  }

  const { data: taxonomy, error } = await supabase
    .from('taxonomy')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !taxonomy) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Capability not found' } },
      { status: 404 },
    );
  }

  // Get children
  const { data: children } = await supabase
    .from('taxonomy')
    .select('id, name, slug, type, description, icon, sort_order')
    .eq('parent_id', taxonomy.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  // Get related listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, title, slug, metal_type, grade, price_min, price_max, currency, listing_media(url, is_primary), companies:company_id(name, logo_url, city)')
    .eq('taxonomy_id', taxonomy.id)
    .eq('is_active', true)
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    success: true,
    data: { ...taxonomy, children: children || [], listings: listings || [] },
  });
}
