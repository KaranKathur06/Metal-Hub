/**
 * Metal Hub — Public Marketplace API v2
 * Supplier discovery via relational RPC; buyer RFQs via direct query.
 *
 * GET /api/marketplace
 * Query: type, page, limit, search, location, capability, category, industry, verified, sort, date
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { parseSupplierSearchParams } from '@/lib/marketplace/search';
import { searchMarketplaceSuppliers } from '@/lib/marketplace/supplier-query';

export const dynamic = 'force-dynamic';

const MARKETPLACE_CITIES = [
  'Rajkot',
  'Ahmedabad',
  'Pune',
  'Mumbai',
  'Chennai',
  'Coimbatore',
  'Bengaluru',
  'Vadodara',
  'Faridabad',
  'Surat',
];

function normalizeCityFilter(values: string[]) {
  return values.map((value) => {
    const match = MARKETPLACE_CITIES.find(
      (city) =>
        city.toLowerCase() === value.toLowerCase() ||
        city.toLowerCase().replace(/\s+/g, '-') === value.toLowerCase(),
    );
    return match ?? value;
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { type: 'buyers', inquiries: [], suppliers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        { status: 200 },
      );
    }

    const url = request.nextUrl;
    const type = url.searchParams.get('type') || 'buyers';
    const filters = parseSupplierSearchParams(url.searchParams);

    if (type === 'suppliers') {
      const result = await searchMarketplaceSuppliers(supabase, {
        query: filters.query,
        capabilities: filters.capabilities,
        industries: filters.industries,
        products: filters.products,
        certifications: filters.certifications,
        cities: filters.cities?.length ? normalizeCityFilter(filters.cities) : undefined,
        verification: filters.verification,
        includeSeeded: filters.includeSeeded,
        page: filters.page,
        pageSize: filters.pageSize,
      });

      return NextResponse.json({
        type: 'suppliers',
        suppliers: result.suppliers,
        pagination: {
          page: result.page,
          limit: result.pageSize,
          total: result.totalCount,
          totalPages: result.pageCount,
        },
      });
    }

    const search = filters.query || '';
    const page = filters.page ?? 1;
    const limit = filters.pageSize ?? 20;
    const offset = (page - 1) * limit;
    const dateFilter = url.searchParams.get('date') || '';

    let query = supabase
      .from('rfqs')
      .select('id, title, slug, description, quantity, budget_range, required_by, status, created_at, buyer_user_id', { count: 'exact' })
      .eq('status', 'open');

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (dateFilter) {
      const now = new Date();
      let cutoff: Date | null = null;
      if (dateFilter === 'last-24h') cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      else if (dateFilter === 'last-7d') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (dateFilter === 'last-30d') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (cutoff) query = query.gte('created_at', cutoff.toISOString());
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown marketplace error';
    console.error('[marketplace] Unhandled error:', message);
    return NextResponse.json(
      { type: 'buyers', inquiries: [], suppliers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }, message },
      { status: 200 },
    );
  }
}
