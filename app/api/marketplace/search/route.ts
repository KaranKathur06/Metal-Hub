/**
 * Enhanced marketplace search with multi-field indexing
 * Searches across: supplier name, description, capabilities, products, industries, cities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, results: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        { status: 503 }
      );
    }

    const url = request.nextUrl;
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const type = url.searchParams.get('type') || 'all'; // 'all', 'suppliers', 'products'
    const offset = (page - 1) * limit;

    if (!q || q.length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: 'Query must be at least 2 characters'
      });
    }

    // ─── 1. SEARCH SUPPLIERS ───
    let supplierResults: any[] = [];
    if (type === 'all' || type === 'suppliers') {
      // Multi-field search: name, description, capabilities, products, industries
      const { data: suppliers, count, error } = await supabase
        .from('companies')
        .select(`
          id, name, slug, description, verification_status, response_rate, completion_rate,
          avg_response_hours, iso_certified, export_capability, established_year, employee_count,
          city_id, created_at,
          company_capabilities!inner(
            taxonomy!inner(name, slug)
          ),
          company_products!inner(
            taxonomy!inner(name, slug)
          ),
          company_industries!inner(
            taxonomy!inner(name, slug)
          )
        `, { count: 'exact' })
        .or(
          `name.ilike.%${q}%,` +
          `description.ilike.%${q}%,` +
          `company_capabilities.taxonomy.name.ilike.%${q}%,` +
          `company_capabilities.taxonomy.slug.ilike.%${q}%,` +
          `company_products.taxonomy.name.ilike.%${q}%,` +
          `company_products.taxonomy.slug.ilike.%${q}%,` +
          `company_industries.taxonomy.name.ilike.%${q}%,` +
          `company_industries.taxonomy.slug.ilike.%${q}%`
        )
        .eq('verification_status', 'approved')
        .is('deleted_at', null)
        .order('response_rate', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && suppliers) {
        supplierResults = suppliers.map((s) => ({
          type: 'supplier',
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description,
          verification_status: s.verification_status,
          response_rate: s.response_rate,
          completion_rate: s.completion_rate,
          iso_certified: s.iso_certified,
          export_capability: s.export_capability,
          years_in_business: s.established_year ? new Date().getFullYear() - s.established_year : 0,
          capabilities: s.company_capabilities?.map((cc: any) => cc.taxonomy?.name).filter(Boolean) || [],
          products: s.company_products?.map((cp: any) => cp.taxonomy?.name).filter(Boolean) || [],
          industries: s.company_industries?.map((ci: any) => ci.taxonomy?.name).filter(Boolean) || [],
        }));
      }
    }

    // ─── 2. SEARCH PRODUCTS ───
    let productResults: any[] = [];
    if (type === 'all' || type === 'products') {
      const { data: products, error: prodError } = await supabase
        .from('listings')
        .select(`
          id, title, description, metal_type, grade, price_min, price_max, moq,
          company_id,
          companies!inner(id, name, slug, verification_status)
        `, { count: 'exact' })
        .or(
          `title.ilike.%${q}%,` +
          `description.ilike.%${q}%,` +
          `metal_type.ilike.%${q}%,` +
          `grade.ilike.%${q}%`
        )
        .eq('is_active', true)
        .eq('companies.verification_status', 'approved')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!prodError && products) {
        productResults = products.map((p: any) => ({
          type: 'product',
          id: p.id,
          title: p.title,
          description: p.description,
          metal_type: p.metal_type,
          grade: p.grade,
          price_min: p.price_min,
          price_max: p.price_max,
          moq: p.moq,
          supplier: {
            id: p.companies.id,
            name: p.companies.name,
            slug: p.companies.slug,
            verified: p.companies.verification_status === 'approved',
          },
        }));
      }
    }

    // ─── 3. COMBINE & RETURN ───
    const allResults = type === 'all'
      ? [...supplierResults, ...productResults].slice(0, limit)
      : type === 'suppliers'
      ? supplierResults
      : productResults;

    return NextResponse.json({
      success: true,
      results: allResults,
      pagination: {
        page,
        limit,
        total: (supplierResults.length + productResults.length),
        totalPages: Math.ceil((supplierResults.length + productResults.length) / limit),
      },
      query: q,
      type,
    });
  } catch (err: any) {
    console.error('[marketplace/search]', err.message);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message }, results: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}
