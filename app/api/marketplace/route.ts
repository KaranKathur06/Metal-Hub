/**
 * Metal Hub — Public Marketplace API v2
 * Full relational filtering with industry/capability/material joins
 * 
 * GET /api/marketplace
 * Query: type, page, limit, search, location, capability, category, industry, verified, sort, moqRange, date
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

    // Filter params
    const capabilityFilter = url.searchParams.get('capability')?.split(',').filter(Boolean) || [];
    const industryFilter = url.searchParams.get('industry')?.split(',').filter(Boolean) || [];
    const categoryFilter = url.searchParams.get('category')?.split(',').filter(Boolean) || [];
    const locationFilter = url.searchParams.get('location')?.split(',').filter(Boolean) || [];
    const verifiedOnly = url.searchParams.get('verified') === 'true';
    const dateFilter = url.searchParams.get('date') || '';

    if (type === 'suppliers') {
      // ── SUPPLIER LISTINGS WITH RELATIONAL FILTERING ──
      // Step 1: If filters are active, get matching company IDs via junction tables
      let filteredCompanyIds: string[] | null = null;

      if (capabilityFilter.length > 0 || industryFilter.length > 0 || categoryFilter.length > 0) {
        const companyIdSets: Set<string>[] = [];

        if (capabilityFilter.length > 0) {
          const { data: capMatches } = await supabase
            .from('company_capabilities')
            .select('company_id, taxonomy!inner(slug)')
            .in('taxonomy.slug', capabilityFilter);
          if (capMatches) {
            companyIdSets.push(new Set(capMatches.map((r: any) => r.company_id)));
          }
        }

        if (industryFilter.length > 0) {
          const { data: indMatches } = await supabase
            .from('company_industries')
            .select('company_id, taxonomy!inner(slug)')
            .in('taxonomy.slug', industryFilter);
          if (indMatches) {
            companyIdSets.push(new Set(indMatches.map((r: any) => r.company_id)));
          }
        }

        if (categoryFilter.length > 0) {
          const { data: prodMatches } = await supabase
            .from('company_products')
            .select('company_id, taxonomy!inner(slug)')
            .in('taxonomy.slug', categoryFilter);
          if (prodMatches) {
            companyIdSets.push(new Set(prodMatches.map((r: any) => r.company_id)));
          }
        }

        // Intersect all sets (AND logic)
        if (companyIdSets.length > 0) {
          filteredCompanyIds = Array.from(companyIdSets.reduce((a, b) => {
            const result = new Set<string>();
            a.forEach(id => { if (b.has(id)) result.add(id); });
            return result;
          }));
        }

        // No matches → return empty
        if (filteredCompanyIds && filteredCompanyIds.length === 0) {
          return NextResponse.json({
            type: 'suppliers',
            suppliers: [],
            pagination: { page, limit, total: 0, totalPages: 0 },
          });
        }
      }

      // Step 2: Query listings with company enrichment
      let query = supabase
        .from('listings')
        .select(`
          id, title, slug, metal_type, grade, price_min, price_max, currency, moq, lead_time,
          is_active, is_featured, certifications, moderation_status, created_at,
          company_id,
          companies!inner(
            id, name, slug, verification_status, description, response_rate, completion_rate,
            avg_response_hours, iso_certified, export_capability, established_year, employee_count,
            city_id, state_id, created_at
          )
        `, { count: 'exact' })
        .eq('is_active', true)
        .is('deleted_at', null);

      // Apply company ID filter from junction table lookups
      if (filteredCompanyIds) {
        query = query.in('company_id', filteredCompanyIds);
      }

      // Verified filter
      if (verifiedOnly) {
        query = query.eq('companies.verification_status', 'approved');
      }

      // Search
      if (search) {
        query = query.or(`title.ilike.%${search}%,metal_type.ilike.%${search}%,grade.ilike.%${search}%`);
      }

      // Date filter
      if (dateFilter) {
        const now = new Date();
        let cutoff: Date | null = null;
        if (dateFilter === 'last-24h') { cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); }
        else if (dateFilter === 'last-7d') { cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); }
        else if (dateFilter === 'last-30d') { cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); }
        if (cutoff) query = query.gte('created_at', cutoff.toISOString());
      }

      // Sort
      switch (sort) {
        case 'price': query = query.order('price_min', { ascending: true, nullsFirst: false }); break;
        case 'verified': query = query.order('is_featured', { ascending: false }); break;
        case 'rating': query = query.order('is_featured', { ascending: false }); break;
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
      // ── BUYER REQUIREMENTS (RFQs) ──
      let query = supabase
        .from('rfqs')
        .select('id, title, slug, description, quantity, target_price, delivery_timeline, status, created_at, buyer_profile_id', { count: 'exact' })
        .eq('status', 'open');

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Date filter
      if (dateFilter) {
        const now = new Date();
        let cutoff: Date | null = null;
        if (dateFilter === 'last-24h') { cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); }
        else if (dateFilter === 'last-7d') { cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); }
        else if (dateFilter === 'last-30d') { cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); }
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
    }
  } catch (err: any) {
    console.error('[marketplace] Unhandled error:', err?.message);
    return NextResponse.json(
      { type: 'buyers', inquiries: [], suppliers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      { status: 200 }
    );
  }
}
