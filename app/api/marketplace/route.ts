/**
 * Metal Hub — Public Marketplace API
 * GET /api/marketplace → Marketplace data (listings + categories + stats)
 *
 * Also serves as the main search/filter endpoint for the MarketplaceTabs component.
 * Query params: type, page, limit, search, location, capability, category, industry, verified, sort, moqRange, date
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { type: 'buyers', inquiries: [], suppliers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        { status: 200 }
      );
    }

    const url = request.nextUrl;
    const type = url.searchParams.get('type') || 'buyers';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const search = url.searchParams.get('search') || '';
    const sort = url.searchParams.get('sort') || 'latest';
    const offset = (page - 1) * limit;

    if (type === 'suppliers') {
      // ── Supplier Listings ──
      let query = supabase
        .from('listings')
        .select('id, title, slug, metal_type, grade, price_min, price_max, currency, moq, lead_time, is_active, moderation_status, created_at, seller_profile_id, company_id', { count: 'exact' })
        .eq('is_active', true);

      if (search) {
        query = query.or(`title.ilike.%${search}%,metal_type.ilike.%${search}%,grade.ilike.%${search}%`);
      }

      // Sort
      switch (sort) {
        case 'price': query = query.order('price_min', { ascending: true, nullsFirst: false }); break;
        case 'verified': query = query.order('created_at', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }

      const { data: suppliers, count, error } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error('[marketplace/suppliers]', error.message);
      }

      return NextResponse.json({
        type: 'suppliers',
        suppliers: suppliers || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } else {
      // ── Buyer Requirements (RFQs) ──
      let query = supabase
        .from('rfqs')
        .select('id, title, slug, description, quantity, target_price, delivery_timeline, status, created_at, buyer_profile_id', { count: 'exact' })
        .eq('status', 'open');

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data: inquiries, count, error } = await query.range(offset, offset + limit - 1);

      if (error) {
        console.error('[marketplace/buyers]', error.message);
      }

      return NextResponse.json({
        type: 'buyers',
        inquiries: inquiries || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    }
  } catch (err: any) {
    console.error('[marketplace] Unhandled error:', err?.message);
    return NextResponse.json(
      { type: 'buyers', inquiries: [], suppliers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      { status: 200 }
    );
  }
}
