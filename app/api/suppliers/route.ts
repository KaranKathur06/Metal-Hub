/**
 * Metal Hub — Suppliers List API
 * GET /api/suppliers → List verified suppliers with companies
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
  const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
  const search = searchParams.get('search');
  const city = searchParams.get('city');
  const state = searchParams.get('state');

  let query = supabase
    .from('seller_profiles')
    .select(`
      id, company_name, verification_status, certifications, created_at,
      profiles:profile_id(id, full_name, avatar_url),
      companies:company_id(id, name, logo_url, website, city, state, country, industry_type, is_verified)
    `, { count: 'exact' })
    .eq('verification_status', 'approved');

  if (search) {
    query = query.ilike('company_name', `%${search}%`);
  }

  const { data, error, count } = await query
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
